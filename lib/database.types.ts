/**
 * Supabase database types. Regenerate with: npx supabase gen types typescript --project-id YOUR_REF > lib/database.types.ts
 * This is a hand-written version matching the app types.
 */

export type Json = Record<string, unknown>;

export interface DietaryProfileDb {
  food_allergies: string[];
  religious_restrictions: {
    religion: string;
    avoid_items: string[];
    requires_halal: boolean;
    requires_kosher: boolean;
  };
  medical_restrictions: string[];
  lifestyle_preferences: string[];
  dislikes: string[];
}

export interface DietaryFlagsDb {
  contains_pork: boolean;
  contains_beef: boolean;
  contains_shellfish: boolean;
  vegetarian: boolean;
  halal_compliant: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_id: string | null;
          user_id: string;
          name: string;
          rank: string;
          role: 'crew' | 'admin' | 'galley' | 'officer';
          onboarding_completed: boolean;
          dietary_profile: DietaryProfileDb;
          password_changed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      menu_items: {
        Row: {
          item_id: string;
          name: string;
          category: 'main' | 'side' | 'dessert' | 'beverage' | 'fruit';
          estimated_calories: number;
          dietary_flags: DietaryFlagsDb;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'created_at'> & { created_at?: string };
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
      menus: {
        Row: {
          menu_id: string;
          date: string;
          meal_type: 'Breakfast' | 'Lunch' | 'Dinner';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menus']['Row'], 'created_at'> & { created_at?: string };
        Update: Partial<Database['public']['Tables']['menus']['Insert']>;
      };
      menu_menu_items: {
        Row: { menu_id: string; item_id: string; is_alternative: boolean; sort_order: number };
        Insert: Database['public']['Tables']['menu_menu_items']['Row'] & { sort_order?: number };
        Update: Partial<Database['public']['Tables']['menu_menu_items']['Insert']>;
      };
      ratings: {
        Row: {
          rating_id: string;
          item_id: string;
          menu_id: string;
          user_id: string;
          stars: number;
          emoji: 'delicious' | 'average' | 'bad';
          comment: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ratings']['Row'], 'rating_id' | 'created_at'> & { rating_id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
      };
      requests: {
        Row: {
          request_id: string;
          user_id: string;
          menu_id: string;
          type: 'substitution' | 'absence';
          status: 'pending' | 'approved' | 'denied';
          detail: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['requests']['Row'], 'request_id' | 'created_at'> & { request_id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
      };
      meal_attendance: {
        Row: {
          menu_id: string;
          user_id: string;
          status: 'standard' | 'late_plate' | 'served' | 'skipped';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['meal_attendance']['Row'], 'created_at'> & { created_at?: string };
        Update: Partial<Database['public']['Tables']['meal_attendance']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'alert' | 'success';
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      waste_config: {
        Row: {
          id: string;
          container_volume_m3: number;
          container_weight_kg: number;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['waste_config']['Row'], 'id' | 'updated_at'> & { id?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['waste_config']['Insert']>;
      };
      waste_logs: {
        Row: {
          log_id: string;
          date: string;
          container_count: number;
          total_weight_kg: number;
          total_volume_m3: number;
          logged_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['waste_logs']['Row'], 'log_id' | 'created_at'> & { log_id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['waste_logs']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
