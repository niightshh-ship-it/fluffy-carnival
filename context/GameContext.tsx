import React, {
  createContext, useContext, useReducer, useEffect, useRef, ReactNode,
} from 'react';
import { QUESTS } from '@/constants/data';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProfile, saveProfile, rowToState, ProfileState,
} from '@/lib/profile';

export type QuestState = 'offer' | 'accepted' | 'done';
export type PetReaction = 'fed' | 'evolve' | null;

export interface GameState {
  // --- синхронизируется с профилем в Supabase ---
  coins: number;
  hype: number;
  streak: number;
  petStage: number;
  petHunger: number;
  petEvo: number;
  // --- локальное состояние сессии ---
  questIdx: number;
  questState: QuestState;
  liked: Record<number, boolean>;
  hypeCounts: number[];
  toast: string | null;
  petReaction: PetReaction;
  /** Профиль загружен из Supabase — можно начинать автосохранение. */
  ready: boolean;
}

const initialState: GameState = {
  coins: 0,
  hype: 0,
  streak: 0,
  petStage: 0,
  petHunger: 50,
  petEvo: 0,
  questIdx: 0,
  questState: 'offer',
  liked: {},
  hypeCounts: [1284, 842, 503, 376],
  toast: null,
  petReaction: null,
  ready: false,
};

type Action =
  | { type: 'HYDRATE'; profile: ProfileState }
  | { type: 'ACCEPT_QUEST' }
  | { type: 'COMPLETE_QUEST' }
  | { type: 'REROLL_QUEST' }
  | { type: 'TOGGLE_LIKE'; idx: number }
  | { type: 'FEED_PET' }
  | { type: 'CLEAR_TOAST' }
  | { type: 'CLEAR_REACTION' }
  | { type: 'ADD_COINS'; n: number }
  | { type: 'ADD_HYPE'; n: number }
  | { type: 'RESET' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.profile, ready: true };

    case 'RESET':
      return { ...initialState };

    case 'ACCEPT_QUEST':
      return { ...state, questState: 'accepted' };

    case 'COMPLETE_QUEST': {
      const quest = QUESTS[state.questIdx];
      return {
        ...state,
        coins: state.coins + quest.coin,
        hype: state.hype + quest.hype,
        questState: 'done',
        toast: '+' + quest.coin + ' монет · +' + quest.hype + ' хайпа',
      };
    }

    case 'REROLL_QUEST':
      return {
        ...state,
        questIdx: (state.questIdx + 1) % QUESTS.length,
        questState: 'offer',
      };

    case 'TOGGLE_LIKE': {
      const { idx } = action;
      const nowLiked = !state.liked[idx];
      const liked = { ...state.liked, [idx]: nowLiked };
      const hypeCounts = state.hypeCounts.slice();
      hypeCounts[idx] = hypeCounts[idx] + (nowLiked ? 1 : -1);
      return {
        ...state,
        liked,
        hypeCounts,
        hype: nowLiked ? state.hype + 5 : state.hype,
      };
    }

    case 'FEED_PET': {
      if (state.hype < 50) {
        return { ...state, toast: 'Мало хайпа — выполни квест!' };
      }
      const hype = state.hype - 50;
      const petHunger = Math.min(100, state.petHunger + 16);
      const newEvo = state.petEvo + 18;
      if (newEvo >= 100 && state.petStage < 2) {
        return {
          ...state,
          hype,
          petHunger,
          petStage: state.petStage + 1,
          petEvo: 0,
          petReaction: 'evolve',
          toast: 'ЭВОЛЮЦИЯ! Хайпожорик растёт',
        };
      }
      return {
        ...state,
        hype,
        petHunger,
        petEvo: Math.min(100, newEvo),
        petReaction: 'fed',
        toast: 'Ням! Хайпожорик доволен',
      };
    }

    case 'CLEAR_TOAST':
      return { ...state, toast: null };

    case 'CLEAR_REACTION':
      return { ...state, petReaction: null };

    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.n };

    case 'ADD_HYPE':
      return { ...state, hype: state.hype + action.n };

    default:
      return state;
  }
}

export interface GameContextValue extends GameState {
  acceptQuest: () => void;
  completeQuest: () => void;
  rerollQuest: () => void;
  toggleLike: (idx: number) => void;
  feedPet: () => void;
  clearToast: () => void;
  clearReaction: () => void;
  addCoins: (n: number) => void;
  addHype: (n: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загружаем профиль при входе / сбрасываем при выходе.
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      dispatch({ type: 'RESET' });
      return;
    }
    fetchProfile(user.id).then((row) => {
      if (cancelled) return;
      if (row) dispatch({ type: 'HYDRATE', profile: rowToState(row) });
    });
    return () => { cancelled = true; };
  }, [user]);

  // Автосохранение игровых полей в Supabase (с задержкой, чтобы не спамить запросами).
  useEffect(() => {
    if (!user || !state.ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const snapshot: ProfileState = {
      coins: state.coins,
      hype: state.hype,
      streak: state.streak,
      petStage: state.petStage,
      petHunger: state.petHunger,
      petEvo: state.petEvo,
    };
    saveTimer.current = setTimeout(() => {
      saveProfile(user.id, snapshot);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    user, state.ready, state.coins, state.hype, state.streak,
    state.petStage, state.petHunger, state.petEvo,
  ]);

  const value: GameContextValue = {
    ...state,
    acceptQuest: () => dispatch({ type: 'ACCEPT_QUEST' }),
    completeQuest: () => dispatch({ type: 'COMPLETE_QUEST' }),
    rerollQuest: () => dispatch({ type: 'REROLL_QUEST' }),
    toggleLike: (idx: number) => dispatch({ type: 'TOGGLE_LIKE', idx }),
    feedPet: () => dispatch({ type: 'FEED_PET' }),
    clearToast: () => dispatch({ type: 'CLEAR_TOAST' }),
    clearReaction: () => dispatch({ type: 'CLEAR_REACTION' }),
    addCoins: (n: number) => dispatch({ type: 'ADD_COINS', n }),
    addHype: (n: number) => dispatch({ type: 'ADD_HYPE', n }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
