'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getLocalizedName } from '@/types/country';

interface CountryConfigListProps {
  countries: any[];
  locale: string;
}

export function CountryConfigList({ countries, locale }: CountryConfigListProps) {
  const t = useTranslations('admin');

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {countries.map((country) => (
        <Card key={country.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {getLocalizedName(country, locale)}
              </CardTitle>
              <Badge variant={country.is_active ? 'default' : 'secondary'}>
                {country.code}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t('entityTypes')}
              </p>
              <div className="flex flex-wrap gap-1">
                {country.entity_types?.map((et: any) => (
                  <Badge key={et.id} variant="outline">
                    {et.code} — {getLocalizedName(et, locale)}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Currency:</span>{' '}
                <span className="font-medium">{country.currency}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tax ID:</span>{' '}
                <span className="font-medium">{country.tax_id_name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
