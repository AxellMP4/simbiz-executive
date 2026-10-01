import { DifficultyLevel } from '../types/simulation';

export interface DifficultyProfile {
  label: string;
  description: string;
  competitorSkill: number;
  competitorAggression: number;
  marketVolatility: number;
  eventImpact: number;
  budgetPressure: number;
}

export const DIFFICULTY_PROFILES: Record<DifficultyLevel, DifficultyProfile> = {
  easy: {
    label: 'Facile',
    description: 'Concurrents plus lisibles, marché plus stable et pression budgétaire réduite.',
    competitorSkill: 0.88,
    competitorAggression: 0.82,
    marketVolatility: 0.65,
    eventImpact: 0.7,
    budgetPressure: 0.85,
  },
  normal: {
    label: 'Normal',
    description: 'Une partie équilibrée pour apprendre les arbitrages du marché.',
    competitorSkill: 1,
    competitorAggression: 1,
    marketVolatility: 1,
    eventImpact: 1,
    budgetPressure: 1,
  },
  hard: {
    label: 'Difficile',
    description: 'Les firmes investissent davantage, les chocs sont plus marqués et les marges se tendent.',
    competitorSkill: 1.12,
    competitorAggression: 1.16,
    marketVolatility: 1.35,
    eventImpact: 1.25,
    budgetPressure: 1.12,
  },
  expert: {
    label: 'Expert',
    description: 'Concurrence très réactive, forte volatilité et événements à conséquences durables.',
    competitorSkill: 1.25,
    competitorAggression: 1.3,
    marketVolatility: 1.7,
    eventImpact: 1.55,
    budgetPressure: 1.25,
  },
};

export const effectiveDifficulty = (difficulty?: DifficultyLevel): DifficultyLevel => difficulty || 'normal';
