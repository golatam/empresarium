'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

import {
  sendOtpSchema,
  verifyCodeSchema,
  type SendOtpFormData,
  type VerifyCodeFormData,
} from '@/lib/validations/auth';
import { sendOtp, verifyOtpAndSignIn } from '@/lib/actions/auth';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const redirectTo = searchParams.get('redirect') || `/${locale}/dashboard`;

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const emailForm = useForm<SendOtpFormData>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
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

  async function onEmailSubmit(data: SendOtpFormData) {
    const success = await handleSendOtp(data.email);
    if (success) {
      setEmail(data.email);
      setStep('code');
    }
  }

  async function onCodeSubmit(data: VerifyCodeFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOtpAndSignIn(email, data.code);

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

      // Full page navigation to ensure session cookies are sent with the request.
      // Using window.location instead of router.push to avoid race conditions
      // with router.refresh() that can cancel the navigation.
      window.location.href = redirectTo;
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    await handleSendOtp(email);
  }

  if (step === 'code') {
    return (
      <Card key="code">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('enterCode')}</CardTitle>
          <CardDescription>{t('enterCodeDescription', { email })}</CardDescription>
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
              onClick={() => { setStep('email'); setError(null); }}
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
    <Card key="email">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
        <CardDescription>{t('loginDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
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
          {t('noAccount')}{' '}
          <Link
            href={`/${locale}/register`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t('createAccount')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
