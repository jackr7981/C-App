export interface DietaryProfile {
  food_allergies: string[];
  religious_restrictions: {
    religion: 'muslim' | 'hindu' | 'jewish' | 'buddhist' | 'none' | 'other';
    avoid_items: string[];
    requires_halal: boolean;
    requires_kosher: boolean;
  };
  medical_restrictions: string[];
  lifestyle_preferences: string[];
  dislikes: string[];
}

export interface User {
  user_id: string; // Acts as Passport Number for Crew
  password?: string;
  password_changed?: boolean;
  name: string;
  rank: string;
  role: 'crew' | 'admin' | 'galley' | 'officer';
  onboarding_completed: boolean;
  dietary_profile: DietaryProfile;
}

export interface MenuItem {
  item_id: string;
  name: string;
  category: 'main' | 'side' | 'dessert' | 'beverage' | 'fruit';
  estimated_calories: number;
  dietary_flags: {
    contains_pork: boolean;
    contains_beef: boolean;
    contains_shellfish: boolean;
    vegetarian: boolean;
    halal_compliant: boolean;
  };
  image_url?: string;
}

export interface Menu {
  menu_id: string;
  date: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner';
  items: MenuItem[];
  alternatives?: MenuItem[]; // Pre-defined alternatives for this meal
}

export interface Rating {
  rating_id: string;
  item_id: string;
  menu_id: string;
  stars: number;
  emoji: 'delicious' | 'average' | 'bad';
  comment: string;
}

export interface Request {
  request_id: string;
  user_id: string;
  menu_id: string;
  type: 'substitution' | 'absence';
  status: 'pending' | 'approved' | 'denied';
  detail: string;
  timestamp: string;
}

export interface MealAttendance {
  menu_id: string;
  user_id: string;
  status: 'standard' | 'late_plate' | 'served' | 'skipped';
  timestamp?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'alert' | 'success';
}

export interface WasteConfig {
  container_volume_m3: number;
  container_weight_kg: number;
}

export interface WasteLog {
  log_id: string;
  date: string;
  container_count: number;
  total_weight_kg: number;
  total_volume_m3: number;
  logged_by: string;
}