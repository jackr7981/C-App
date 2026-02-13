import { supabase } from '../supabase';
import type { Rating } from '../../types';

export async function getRatingsForUser(userId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []).map((r) => ({
    rating_id: r.rating_id,
    item_id: r.item_id,
    menu_id: r.menu_id,
    stars: r.stars,
    emoji: r.emoji,
    comment: r.comment,
  }));
}

export async function submitRating(
  rating: Omit<Rating, 'rating_id'> & { user_id: string }
): Promise<Rating | null> {
  const { data, error } = await supabase
    .from('ratings')
    .insert({
      item_id: rating.item_id,
      menu_id: rating.menu_id,
      user_id: rating.user_id,
      stars: rating.stars,
      emoji: rating.emoji,
      comment: rating.comment,
    })
    .select('rating_id, item_id, menu_id, stars, emoji, comment')
    .single();

  if (error || !data) return null;
  return {
    rating_id: data.rating_id,
    item_id: data.item_id,
    menu_id: data.menu_id,
    stars: data.stars,
    emoji: data.emoji,
    comment: data.comment,
  };
}
