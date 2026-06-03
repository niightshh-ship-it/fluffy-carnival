import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QUESTS } from '@/constants/data';

export type QuestState = 'offer' | 'accepted' | 'done';
export type PetReaction = 'fed' | 'evolve' | null;

export interface GameState {
  coins: number;
  hype: number;
  streak: number;
  questIdx: number;
  questState: QuestState;
  petStage: number;
  petHunger: number;
  petEvo: number;
  liked: Record<number, boolean>;
  hypeCounts: number[];
  toast: string | null;
  petReaction: PetReaction;
}

const initialState: GameState = {
  coins: 340,
  hype: 180,
  streak: 7,
  questIdx: 0,
  questState: 'offer',
  petStage: 1,
  petHunger: 54,
  petEvo: 38,
  liked: {},
  hypeCounts: [1284, 842, 503, 376],
  toast: null,
  petReaction: null,
};

type Action =
  | { type: 'ACCEPT_QUEST' }
  | { type: 'COMPLETE_QUEST' }
  | { type: 'REROLL_QUEST' }
  | { type: 'TOGGLE_LIKE'; idx: number }
  | { type: 'FEED_PET' }
  | { type: 'CLEAR_TOAST' }
  | { type: 'CLEAR_REACTION' }
  | { type: 'ADD_COINS'; n: number }
  | { type: 'ADD_HYPE'; n: number };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
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
  const [state, dispatch] = useReducer(reducer, initialState);

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
