'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from '@/lib/utils/format';
import { getLocalizedName } from '@/types/country';

interface AdminPartnersTableProps {
  partners: any[];
  countries: any[];
  locale: string;
}

export function AdminPartnersTable({ partners, locale }: AdminPartnersTableProps) {
  const t = useTranslations('admin');

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('partnerName')}</TableHead>
            <TableHead>{t('partnerCountries')}</TableHead>
            <TableHead>{t('userCreated')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell className="font-medium">
                {partner.full_name || '—'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {partner.partner_countries?.map((pc: any) => (
                    <Badge key={pc.id} variant="outline">
                      {pc.country ? getLocalizedName(pc.country, locale) : pc.country_id}
                    </Badge>
                  )) || '—'}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatRelative(partner.created_at, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
