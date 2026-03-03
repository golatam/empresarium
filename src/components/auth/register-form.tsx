'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

import {
  registerSchema,
  verifyOtpSchema,
  type RegisterFormData,
  type VerifyOtpFormData,
} from '@/lib/validations/auth';
import { sendOtp, verifyOtpAndSignUp } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function RegisterForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [registrationData, setRegistrationData] = useState<RegisterFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const detailsForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      fullName: '',
      role: 'client',
    },
  });

  const codeForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: '', code: '' },
  });

  const handleSendOtp = useCallback(async (targetEmail: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendOtp(targetEmail, locale);

      if (result.error) {
        if (result.error === 'RATE_LIMIT') {
          setError(t('errorRateLimit'));
        } else {
          setError(result.error);
        }
        return false;
      }

      setCooldown(60);
      return true;
    } catch {
      setError(t('errorGeneric'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [locale, t]);

  async function onDetailsSubmit(data: RegisterFormData) {
    const success = await handleSendOtp(data.email);
    if (success) {
      setRegistrationData(data);
      codeForm.setValue('email', data.email);
      setStep('code');
    }
  }

  async function onCodeSubmit(data: VerifyOtpFormData) {
    if (!registrationData) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOtpAndSignUp({
        email: registrationData.email,
        code: data.code,
        fullName: registrationData.fullName,
        role: registrationData.role,
        locale,
      });

      if (result.error) {
        if (result.error === 'INVALID_CODE') {
          setError(t('invalidCode'));
        } else if (result.error === 'CODE_EXPIRED') {
          setError(t('codeExpired'));
        } else if (result.error === 'TOO_MANY_ATTEMPTS') {
          setError(t('tooManyAttempts'));
        } else {
          setError(result.error);
        }
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || !registrationData) return;
    await handleSendOtp(registrationData.email);
  }

  if (step === 'code' && registrationData) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('enterCode')}</CardTitle>
          <CardDescription>{t('enterCodeDescription', { email: registrationData.email })}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
              <FormField
                control={codeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('verifyCode')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('codePlaceholder')}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        disabled={isLoading}
                        className="text-center text-lg tracking-widest"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('verifyCode')}
              </Button>
            </form>
          </Form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setStep('details'); setError(null); }}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('changeEmail')}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isLoading}
              className="text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `${t('resendCode')} (${cooldown}s)` : t('resendCode')}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
        <CardDescription>{t('registerDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...detailsForm}>
          <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)} className="space-y-4">
            <FormField
              control={detailsForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <Tabs
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="client">
                        {t('registerAsClient')}
                      </TabsTrigger>
                      <TabsTrigger value="partner">
                        {t('registerAsPartner')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormItem>
              )}
            />

            <FormField
              control={detailsForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fullName')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('fullNamePlaceholder')}
                      autoComplete="name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={detailsForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('sendCode')}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('haveAccount')}{' '}
          <Link
            href={`/${locale}/login`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t('signIn')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
