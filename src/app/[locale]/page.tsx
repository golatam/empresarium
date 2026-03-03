import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, BarChart3, Globe } from 'lucide-react';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('landing');

  const features = [
    { icon: Building2, title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: Users, title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: BarChart3, title: t('feature3Title'), desc: t('feature3Desc') },
    { icon: Globe, title: t('feature4Title'), desc: t('feature4Desc') },
  ];

  const steps = [
    { num: '1', title: t('step1Title'), desc: t('step1Desc') },
    { num: '2', title: t('step2Title'), desc: t('step2Desc') },
    { num: '3', title: t('step3Title'), desc: t('step3Desc') },
  ];

  const countries = [
    { name: 'Brazil', flag: '🇧🇷' },
    { name: 'Chile', flag: '🇨🇱' },
    { name: 'Colombia', flag: '🇨🇴' },
    { name: 'Peru', flag: '🇵🇪' },
    { name: 'Argentina', flag: '🇦🇷' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-xl">Empresarium</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/login`}>
              <Button variant="ghost">{t('ctaLogin')}</Button>
            </Link>
            <Link href={`/${locale}/register`}>
              <Button>{t('cta')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
            {t('hero')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href={`/${locale}/register`}>
              <Button size="lg">{t('cta')}</Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button variant="outline" size="lg">{t('ctaLogin')}</Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-6 text-3xl">
            {countries.map((c) => (
              <span key={c.name} title={c.name} className="hover:scale-110 transition-transform cursor-default">
                {c.flag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title}>
                <CardContent className="pt-6">
                  <f.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('howItWorks')}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  {s.num}
                </div>
                <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Empresarium. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
