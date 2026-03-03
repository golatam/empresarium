'use server';

import { createClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/types/database';
import type { FounderFormData } from '@/types/order';
import { ORDER_STATUS_FLOW } from '@/types/order';
import { revalidatePath } from 'next/cache';

export async function createOrder(data: {
  countryId: string;
  entityTypeId: string;
  companyName: string;
  companyActivity?: string;
  companyAddress?: string;
  formData: Record<string, unknown>;
  founders: FounderFormData[];
  addons: {
    nomineeDirector: boolean;
    nomineeShareholder: boolean;
    accounting: boolean;
    bookkeeping: boolean;
  };
  status: 'draft' | 'submitted';
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      client_id: user.id,
      country_id: data.countryId,
      entity_type_id: data.entityTypeId,
      company_name: data.companyName,
      company_activity: data.companyActivity || null,
      company_address: data.companyAddress || null,
      form_data: data.formData,
      has_nominee_director: data.addons.nomineeDirector,
      has_nominee_shareholder: data.addons.nomineeShareholder,
      has_accounting: data.addons.accounting,
      has_bookkeeping: data.addons.bookkeeping,
      status: data.status,
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  // Insert founders
  if (data.founders.length > 0) {
    const founders = data.founders.map((f, i) => ({
      order_id: order.id,
      full_name: f.fullName,
      email: f.email,
      phone: f.phone || null,
      nationality: f.nationality || null,
      date_of_birth: f.dateOfBirth || null,
      document_type: f.documentType || null,
      document_number: f.documentNumber || null,
      tax_id: f.taxId || null,
      ownership_percentage: f.ownershipPercentage,
      is_director: f.isDirector,
      extra_data: f.extraData,
      sort_order: i,
    }));

    const { error: foundersError } = await supabase
      .from('founders')
      .insert(founders);

    if (foundersError) return { error: foundersError.message };
  }

  revalidatePath('/[locale]/orders', 'page');
  revalidatePath('/[locale]/dashboard', 'page');

  return { success: true, orderId: order.id };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get current order
  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();

  if (!order) return { error: 'Order not found' };

  // Get user role for admin override
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Validate transition (admins can make any transition)
  if (profile?.role !== 'admin') {
    const allowedTransitions = ORDER_STATUS_FLOW[order.status as OrderStatus];
    if (!allowedTransitions.includes(newStatus)) {
      return { error: `Cannot transition from ${order.status} to ${newStatus}` };
    }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) return { error: error.message };

  revalidatePath('/[locale]/orders', 'page');
  revalidatePath(`/[locale]/orders/${orderId}`, 'page');
  revalidatePath('/[locale]/dashboard', 'page');

  return { success: true };
}

export async function assignPartner(orderId: string, partnerId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ partner_id: partnerId })
    .eq('id', orderId);

  if (error) return { error: error.message };

  revalidatePath('/[locale]/orders', 'page');
  revalidatePath(`/[locale]/orders/${orderId}`, 'page');

  return { success: true };
}

export async function updateDraftOrder(
  orderId: string,
  data: {
    companyName?: string;
    companyActivity?: string;
    companyAddress?: string;
    formData?: Record<string, unknown>;
    addons?: {
      nomineeDirector: boolean;
      nomineeShareholder: boolean;
      accounting: boolean;
      bookkeeping: boolean;
    };
  }
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.companyName !== undefined) updateData.company_name = data.companyName;
  if (data.companyActivity !== undefined) updateData.company_activity = data.companyActivity;
  if (data.companyAddress !== undefined) updateData.company_address = data.companyAddress;
  if (data.formData !== undefined) updateData.form_data = data.formData;
  if (data.addons) {
    updateData.has_nominee_director = data.addons.nomineeDirector;
    updateData.has_nominee_shareholder = data.addons.nomineeShareholder;
    updateData.has_accounting = data.addons.accounting;
    updateData.has_bookkeeping = data.addons.bookkeeping;
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .eq('status', 'draft');

  if (error) return { error: error.message };

  revalidatePath(`/[locale]/orders/${orderId}`, 'page');
  return { success: true };
}
