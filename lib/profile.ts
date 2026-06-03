import { supabase } from '@/lib/supabase';

/** Поля профиля, которые хранятся в Supabase (таблица public.profiles). */
export interface ProfileRow {
  id: string;
  username: string | null;
  coins: number;
  hype: number;
  streak: number;
  pet_stage: number;
  pet_hunger: number;
  pet_evo: number;
}

/** Часть игрового состояния, которая принадлежит профилю и синхронизируется. */
export interface ProfileState {
  coins: number;
  hype: number;
  streak: number;
  petStage: number;
  petHunger: number;
  petEvo: number;
}

export function rowToState(row: ProfileRow): ProfileState {
  return {
    coins: row.coins,
    hype: row.hype,
    streak: row.streak,
    petStage: row.pet_stage,
    petHunger: row.pet_hunger,
    petEvo: row.pet_evo,
  };
}

/** Прочитать профиль текущего пользователя. Профиль создаётся триггером при регистрации. */
export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, coins, hype, streak, pet_stage, pet_hunger, pet_evo')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[profile] fetch error:', error.message);
    return null;
  }
  return data as ProfileRow | null;
}

/** Сохранить игровые поля профиля. RLS пропустит только свою строку. */
export async function saveProfile(userId: string, s: ProfileState): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      coins: s.coins,
      hype: s.hype,
      streak: s.streak,
      pet_stage: s.petStage,
      pet_hunger: s.petHunger,
      pet_evo: s.petEvo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) console.warn('[profile] save error:', error.message);
}

export async function updateUsername(userId: string, username: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ username, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) console.warn('[profile] username error:', error.message);
}
