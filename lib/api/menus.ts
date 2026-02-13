import { supabase } from '../supabase';
import type { Menu, MenuItem } from '../../types';
import type { Database } from '../database.types';

type MenuItemRow = Database['public']['Tables']['menu_items']['Row'];

function itemFromRow(row: MenuItemRow): MenuItem {
  return {
    item_id: row.item_id,
    name: row.name,
    category: row.category,
    estimated_calories: row.estimated_calories,
    dietary_flags: row.dietary_flags,
    image_url: row.image_url ?? undefined,
  };
}

/** Fetch all menus with their items and alternatives. Returns app-shaped Menu[]. */
export async function getMenus(): Promise<Menu[]> {
  const { data: menusData, error: menusError } = await supabase
    .from('menus')
    .select('*')
    .order('date', { ascending: true });

  if (menusError || !menusData?.length) return [];

  const { data: linksData } = await supabase
    .from('menu_menu_items')
    .select('*');

  const itemIds = new Set<string>();
  (linksData ?? []).forEach((r: { item_id: string }) => itemIds.add(r.item_id));
  if (itemIds.size === 0 && menusData.length > 0) {
    return menusData.map((m: { menu_id: string; date: string; meal_type: 'Breakfast' | 'Lunch' | 'Dinner' }) => ({
      menu_id: m.menu_id,
      date: typeof m.date === 'string' ? m.date.split('T')[0] : m.date,
      meal_type: m.meal_type,
      items: [],
      alternatives: [],
    }));
  }

  const { data: itemsData } = await supabase
    .from('menu_items')
    .select('*')
    .in('item_id', Array.from(itemIds));

  const itemsMap = new Map<string, MenuItem>();
  (itemsData ?? []).forEach((row: MenuItemRow) => {
    itemsMap.set(row.item_id, itemFromRow(row));
  });

  const linksByMenu = new Map<string, { item_id: string; is_alternative: boolean; sort_order: number }[]>();
  (linksData ?? []).forEach((r: { menu_id: string; item_id: string; is_alternative: boolean; sort_order: number }) => {
    if (!linksByMenu.has(r.menu_id)) linksByMenu.set(r.menu_id, []);
    linksByMenu.get(r.menu_id)!.push({ item_id: r.item_id, is_alternative: r.is_alternative, sort_order: r.sort_order });
  });

  return menusData.map((m: { menu_id: string; date: string; meal_type: 'Breakfast' | 'Lunch' | 'Dinner' }) => {
    const links = linksByMenu.get(m.menu_id) ?? [];
    const mainLinks = links.filter((l) => !l.is_alternative).sort((a, b) => a.sort_order - b.sort_order);
    const altLinks = links.filter((l) => l.is_alternative).sort((a, b) => a.sort_order - b.sort_order);
    const items = mainLinks.map((l) => itemsMap.get(l.item_id)).filter(Boolean) as MenuItem[];
    const alternatives = altLinks.map((l) => itemsMap.get(l.item_id)).filter(Boolean) as MenuItem[];
    return {
      menu_id: m.menu_id,
      date: typeof m.date === 'string' ? m.date.split('T')[0] : m.date,
      meal_type: m.meal_type,
      items,
      alternatives: alternatives.length ? alternatives : undefined,
    };
  });
}

export async function getMenusByDate(date: string): Promise<Menu[]> {
  const menus = await getMenus();
  return menus.filter((m) => m.date === date);
}

/** Insert a menu and its item links. Reuses existing menu_items by item_id or inserts new ones. */
export async function upsertMenu(menu: Menu): Promise<Menu | null> {
  const { error: menuError } = await supabase.from('menus').upsert({
    menu_id: menu.menu_id,
    date: menu.date,
    meal_type: menu.meal_type,
  });

  if (menuError) return null;

  const allItems = [...menu.items, ...(menu.alternatives ?? [])];
  for (const item of allItems) {
    await supabase.from('menu_items').upsert({
      item_id: item.item_id,
      name: item.name,
      category: item.category,
      estimated_calories: item.estimated_calories,
      dietary_flags: item.dietary_flags,
      image_url: item.image_url ?? null,
    });
  }

  await supabase.from('menu_menu_items').delete().eq('menu_id', menu.menu_id);

  let sortOrder = 0;
  for (const item of menu.items) {
    await supabase.from('menu_menu_items').insert({
      menu_id: menu.menu_id,
      item_id: item.item_id,
      is_alternative: false,
      sort_order: sortOrder++,
    });
  }
  for (const item of menu.alternatives ?? []) {
    await supabase.from('menu_menu_items').insert({
      menu_id: menu.menu_id,
      item_id: item.item_id,
      is_alternative: true,
      sort_order: sortOrder++,
    });
  }

  return menu;
}

export async function insertMenuItemsIfMissing(items: MenuItem[]): Promise<void> {
  for (const item of items) {
    await supabase.from('menu_items').upsert({
      item_id: item.item_id,
      name: item.name,
      category: item.category,
      estimated_calories: item.estimated_calories,
      dietary_flags: item.dietary_flags,
      image_url: item.image_url ?? null,
    });
  }
}
