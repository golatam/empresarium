export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'client' | 'partner' | 'admin';
export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'documents_requested'
  | 'documents_received'
  | 'in_progress'
  | 'government_filing'
  | 'completed'
  | 'cancelled';
export type MessageType = 'text' | 'file' | 'system';
export type AddonType = 'nominee_director' | 'nominee_shareholder' | 'accounting' | 'bookkeeping';
export type FieldType = 'text' | 'email' | 'phone' | 'select' | 'number' | 'date' | 'file' | 'textarea' | 'checkbox';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          preferred_locale: string;
          company_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          preferred_locale?: string;
          company_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          preferred_locale?: string;
          company_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
        };
      };
      countries: {
        Row: {
          id: string;
          code: string;
          name_en: string;
          name_es: string;
          name_pt: string;
          name_ru: string;
          flag_url: string | null;
          currency: string;
          tax_id_name: string;
          tax_id_format: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name_en: string;
          name_es: string;
          name_pt: string;
          name_ru: string;
          flag_url?: string | null;
          currency: string;
          tax_id_name: string;
          tax_id_format?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          code?: string;
          name_en?: string;
          name_es?: string;
          name_pt?: string;
          name_ru?: string;
          flag_url?: string | null;
          currency?: string;
          tax_id_name?: string;
          tax_id_format?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      entity_types: {
        Row: {
          id: string;
          country_id: string;
          code: string;
          name_en: string;
          name_es: string;
          name_pt: string;
          name_ru: string;
          description_en: string | null;
          description_es: string | null;
          description_pt: string | null;
          description_ru: string | null;
          min_founders: number;
          max_founders: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          country_id: string;
          code: string;
          name_en: string;
          name_es: string;
          name_pt: string;
          name_ru: string;
          description_en?: string | null;
          description_es?: string | null;
          description_pt?: string | null;
          description_ru?: string | null;
          min_founders?: number;
          max_founders?: number | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          country_id?: string;
          code?: string;
          name_en?: string;
          name_es?: string;
          name_pt?: string;
          name_ru?: string;
          description_en?: string | null;
          description_es?: string | null;
          description_pt?: string | null;
          description_ru?: string | null;
          min_founders?: number;
          max_founders?: number | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      country_form_fields: {
        Row: {
          id: string;
          country_id: string;
          field_key: string;
          field_type: FieldType;
          label_en: string;
          label_es: string;
          label_pt: string;
          label_ru: string;
          placeholder_en: string | null;
          placeholder_es: string | null;
          placeholder_pt: string | null;
          placeholder_ru: string | null;
          is_required: boolean;
          validation_rules: Json | null;
          options: Json | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          country_id: string;
          field_key: string;
          field_type: FieldType;
          label_en: string;
          label_es: string;
          label_pt: string;
          label_ru: string;
          placeholder_en?: string | null;
          placeholder_es?: string | null;
          placeholder_pt?: string | null;
          placeholder_ru?: string | null;
          is_required?: boolean;
          validation_rules?: Json | null;
          options?: Json | null;
          sort_order?: number;
        };
        Update: {
          country_id?: string;
          field_key?: string;
          field_type?: FieldType;
          label_en?: string;
          label_es?: string;
          label_pt?: string;
          label_ru?: string;
          placeholder_en?: string | null;
          placeholder_es?: string | null;
          placeholder_pt?: string | null;
          placeholder_ru?: string | null;
          is_required?: boolean;
          validation_rules?: Json | null;
          options?: Json | null;
          sort_order?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          client_id: string;
          partner_id: string | null;
          country_id: string;
          entity_type_id: string;
          status: OrderStatus;
          company_name: string;
          company_activity: string | null;
          company_address: string | null;
          form_data: Json;
          has_nominee_director: boolean;
          has_nominee_shareholder: boolean;
          has_accounting: boolean;
          has_bookkeeping: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          client_id: string;
          partner_id?: string | null;
          country_id: string;
          entity_type_id: string;
          status?: OrderStatus;
          company_name: string;
          company_activity?: string | null;
          company_address?: string | null;
          form_data?: Json;
          has_nominee_director?: boolean;
          has_nominee_shareholder?: boolean;
          has_accounting?: boolean;
          has_bookkeeping?: boolean;
          notes?: string | null;
        };
        Update: {
          partner_id?: string | null;
          country_id?: string;
          entity_type_id?: string;
          status?: OrderStatus;
          company_name?: string;
          company_activity?: string | null;
          company_address?: string | null;
          form_data?: Json;
          has_nominee_director?: boolean;
          has_nominee_shareholder?: boolean;
          has_accounting?: boolean;
          has_bookkeeping?: boolean;
          notes?: string | null;
        };
      };
      founders: {
        Row: {
          id: string;
          order_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          nationality: string | null;
          date_of_birth: string | null;
          document_type: string | null;
          document_number: string | null;
          tax_id: string | null;
          ownership_percentage: number;
          is_director: boolean;
          extra_data: Json;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          nationality?: string | null;
          date_of_birth?: string | null;
          document_type?: string | null;
          document_number?: string | null;
          tax_id?: string | null;
          ownership_percentage?: number;
          is_director?: boolean;
          extra_data?: Json;
          sort_order?: number;
        };
        Update: {
          full_name?: string;
          email?: string;
          phone?: string | null;
          nationality?: string | null;
          date_of_birth?: string | null;
          document_type?: string | null;
          document_number?: string | null;
          tax_id?: string | null;
          ownership_percentage?: number;
          is_director?: boolean;
          extra_data?: Json;
          sort_order?: number;
        };
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          old_status: OrderStatus | null;
          new_status: OrderStatus;
          changed_by: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          old_status?: OrderStatus | null;
          new_status: OrderStatus;
          changed_by: string;
          note?: string | null;
        };
        Update: Record<string, never>;
      };
      conversations: {
        Row: {
          id: string;
          order_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
        };
        Update: Record<string, never>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          message_type: MessageType;
          content: string;
          file_url: string | null;
          file_name: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          message_type?: MessageType;
          content: string;
          file_url?: string | null;
          file_name?: string | null;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
      documents: {
        Row: {
          id: string;
          order_id: string;
          uploaded_by: string;
          document_type: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          is_from_client: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          uploaded_by: string;
          document_type: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          is_from_client?: boolean;
        };
        Update: {
          document_type?: string;
          file_name?: string;
        };
      };
      required_documents: {
        Row: {
          id: string;
          country_id: string;
          document_type: string;
          label_en: string;
          label_es: string;
          label_pt: string;
          label_ru: string;
          description_en: string | null;
          description_es: string | null;
          description_pt: string | null;
          description_ru: string | null;
          is_required: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          country_id: string;
          document_type: string;
          label_en: string;
          label_es: string;
          label_pt: string;
          label_ru: string;
          description_en?: string | null;
          description_es?: string | null;
          description_pt?: string | null;
          description_ru?: string | null;
          is_required?: boolean;
          sort_order?: number;
        };
        Update: {
          document_type?: string;
          label_en?: string;
          label_es?: string;
          label_pt?: string;
          label_ru?: string;
          description_en?: string | null;
          description_es?: string | null;
          description_pt?: string | null;
          description_ru?: string | null;
          is_required?: boolean;
          sort_order?: number;
        };
      };
      addons: {
        Row: {
          id: string;
          order_id: string;
          addon_type: AddonType;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          addon_type: AddonType;
          details?: Json;
        };
        Update: {
          addon_type?: AddonType;
          details?: Json;
        };
      };
      partner_countries: {
        Row: {
          id: string;
          partner_id: string;
          country_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          partner_id: string;
          country_id: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: { user_id: string };
        Returns: UserRole;
      };
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      message_type: MessageType;
      addon_type: AddonType;
      field_type: FieldType;
    };
  };
}
