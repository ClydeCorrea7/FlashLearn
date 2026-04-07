// Supabase Type Definitions

export type LearningMode = 'static' | 'dynamic' | 'mcq';

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  card_count: number;
  mastered_count: number;
  last_studied: string | null;
  type: LearningMode;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  mastered: boolean;
  strength_score: number;
  last_reviewed: string | null;
  next_review_due: string | null;
  total_attempts: number;
  correct_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  user_id: string;
  total_cards: number;
  mastered_cards: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeckWithCards extends Deck {
  cards: Card[];
}

export interface DeckStats {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  masteredCount: number;
  lastStudied: string | null;
  preferredMode: LearningMode;
  type: LearningMode;
  dueCount: number;
}

export interface MCQOption {
  text: string;
  isCorrect: boolean;
}

export interface CardAttempt {
  id: string;
  card_id: string;
  user_id: string;
  is_correct: boolean;
  response_time: number;
  confidence: 'easy' | 'medium' | 'hard';
  mode: LearningMode;
  created_at: string;
}

export interface AppNotification {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  type: 'admin' | 'system';
  readStatus: boolean;
  createdAt: string;
}