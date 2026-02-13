import { User, Menu } from './types';

// Helper to generate dates
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

const fmt = (d: Date) => d.toISOString().split('T')[0];

export const MEAL_TIMINGS = {
  Breakfast: '0630 to 0800',
  Lunch: '1130 to 1230',
  Dinner: '1830 to 1930'
};

export const MOCK_USER: User = {
  user_id: 'A12345678', // Passport format
  password: '123456', // Default password
  password_changed: false,
  name: 'Ahmed Hassan',
  rank: 'AB',
  role: 'crew',
  onboarding_completed: false, // Starts false to show flow
  dietary_profile: {
    food_allergies: [],
    religious_restrictions: {
      religion: 'none',
      avoid_items: [],
      requires_halal: false,
      requires_kosher: false,
    },
    medical_restrictions: [],
    lifestyle_preferences: [],
    dislikes: [],
  },
};

export const OFFICER_USER: User = {
  ...MOCK_USER,
  user_id: 'u_officer',
  name: 'Chief Officer Smith',
  role: 'officer',
  rank: 'Chief Officer',
  onboarding_completed: true,
  password: 'admin',
  password_changed: true,
};

export const ADMIN_USER: User = {
  ...MOCK_USER,
  user_id: 'u_admin',
  name: 'SysAdmin',
  role: 'admin',
  rank: 'IT Admin',
  onboarding_completed: true,
  password: 'admin',
  password_changed: true,
};

export const GALLEY_USER: User = {
  ...MOCK_USER,
  user_id: 'u_galley',
  name: 'Chief Cook Antonio',
  rank: 'Ch. Cook',
  role: 'galley',
  onboarding_completed: true,
  password: 'admin',
  password_changed: true,
}

// Base items to reuse - Calories updated based on Guidelines for Overweight Prevention
const items = {
    eggs: {
        item_id: 'i1',
        name: 'Scrambled Eggs (2)',
        category: 'main',
        estimated_calories: 220, // 2 eggs (180) + butter/milk. Guideline: 1 egg = 90kcal.
        dietary_flags: { contains_pork: false, contains_beef: false, contains_shellfish: false, vegetarian: true, halal_compliant: true },
        image_url: 'https://picsum.photos/100/100?random=1'
    } as const,
    sausage: {
        item_id: 'i2',
        name: 'Chicken Sausages',
        category: 'side',
        estimated_calories: 250, // Guideline: Pork Sausage portion is 250kcal. Chicken is similar/slightly leaner.
        dietary_flags: { contains_pork: false, contains_beef: false, contains_shellfish: false, vegetarian: false, halal_compliant: true },
        image_url: 'https://picsum.photos/100/100?random=2'
    } as const,
    stew: {
        item_id: 'i3',
        name: 'Pork Afritada Stew',
        category: 'main',
        estimated_calories: 550, // Pork portion (320) + Veg/Sauce.
        dietary_flags: { contains_pork: true, contains_beef: false, contains_shellfish: false, vegetarian: false, halal_compliant: false },
        image_url: 'https://picsum.photos/100/100?random=3'
    } as const,
    steak: {
        item_id: 'i6',
        name: 'Grilled Beef Steak',
        category: 'main',
        estimated_calories: 600, // Guideline: Roast Beef portion is 300kcal (107g). Steaks are usually double (~200g).
        dietary_flags: { contains_pork: false, contains_beef: true, contains_shellfish: false, vegetarian: false, halal_compliant: true },
        image_url: 'https://picsum.photos/100/100?random=8'
    } as const,
    fish: {
        item_id: 'alt1',
        name: 'Pan Fried Fish',
        category: 'main',
        estimated_calories: 220, // Guideline: Fresh Salmon portion (122g) is 220kcal.
        dietary_flags: { contains_pork: false, contains_beef: false, contains_shellfish: false, vegetarian: false, halal_compliant: true },
        image_url: 'https://picsum.photos/100/100?random=6'
    } as const,
    fruit: {
        item_id: 'fr1',
        name: 'Fresh Melon Slices',
        category: 'fruit',
        estimated_calories: 45, // Guideline: Apple 44kcal/100g.
        dietary_flags: { contains_pork: false, contains_beef: false, contains_shellfish: false, vegetarian: true, halal_compliant: true },
        image_url: 'https://picsum.photos/100/100?random=9'
    } as const,
    dessert: {
        item_id: 'ds1',
        name: 'Chocolate Lava Cake',
        category: 'dessert',
        estimated_calories: 350,
        dietary_flags: { contains_pork: false, contains_beef: false, contains_shellfish: false, vegetarian: true, halal_compliant: true },
        image_url: 'https://picsum.photos/100/100?random=10'
    } as const
};

export const TODAY_MENUS: Menu[] = [
  // TODAY
  {
    menu_id: 'm1',
    date: fmt(today),
    meal_type: 'Breakfast',
    items: [items.eggs, items.sausage]
  },
  {
    menu_id: 'm2',
    date: fmt(today),
    meal_type: 'Lunch',
    items: [
      items.stew,
      {
        item_id: 'i4',
        name: 'Steamed Rice',
        category: 'side',
        estimated_calories: 420, // Guideline: Rice (white boiled) portion (300g) is 420kcal.
        dietary_flags: { contains_pork: false, contains_beef: false, contains_shellfish: false, vegetarian: true, halal_compliant: true },
        image_url: 'https://picsum.photos/100/100?random=4'
      },
      {
        item_id: 'i5',
        name: 'Garden Salad',
        category: 'side',
        estimated_calories: 80,
        dietary_flags: { contains_pork: false, contains_beef: false, contains_shellfish: false, vegetarian: true, halal_compliant: true },
        image_url: 'https://picsum.photos/100/100?random=5'
      },
      items.fruit
    ],
    alternatives: [items.fish]
  },
  {
    menu_id: 'm3',
    date: fmt(today),
    meal_type: 'Dinner',
    items: [items.steak, items.dessert]
  },
  // YESTERDAY (History)
  {
    menu_id: 'm_prev_1',
    date: fmt(yesterday),
    meal_type: 'Breakfast',
    items: [items.eggs]
  },
  {
    menu_id: 'm_prev_2',
    date: fmt(yesterday),
    meal_type: 'Dinner',
    items: [items.fish]
  },
  // TOMORROW (Upcoming)
  {
    menu_id: 'm_next_1',
    date: fmt(tomorrow),
    meal_type: 'Breakfast',
    items: [{...items.eggs, name: 'Omelette'}]
  },
  {
    menu_id: 'm_next_2',
    date: fmt(tomorrow),
    meal_type: 'Lunch',
    items: [items.steak, items.fruit]
  },
  // NEXT WEEK (Future planning)
  {
    menu_id: 'm_future_1',
    date: fmt(nextWeek),
    meal_type: 'Dinner',
    items: [items.stew, items.dessert]
  }
];