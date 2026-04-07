// Supabase Client Configuration
// Modern, clean Supabase client and types

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';
import { LearningMode, Deck, Card, UserProgress, DeckWithCards, DeckStats, MCQOption, CardAttempt, AppNotification } from './types';

// Export types for convenience
export type { LearningMode, Deck, Card, UserProgress, DeckWithCards, DeckStats, MCQOption, CardAttempt, AppNotification };

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API base URL
const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-bc46df65`;

// Helper function to make authenticated API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || publicAnonKey;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth functions
export const authService = {
  async signUp(email: string, password: string, name?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      
      // Now sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      return { user: signInData.user, session: signInData.session };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Data service functions
export const dataService = {
  async getDecks() {
    return apiCall('/decks');
  },

  async createDeck(title: string, description: string, cards: Array<{front: string, back: string}>) {
    return apiCall('/decks', {
      method: 'POST',
      body: JSON.stringify({ title, description, cards }),
    });
  },

  async getDeck(deckId: string) {
    return apiCall(`/decks/${deckId}`);
  },

  async updateDeck(deckId: string, title: string, description: string, cards: any[]) {
    return apiCall(`/decks/${deckId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description, cards }),
    });
  },

  async deleteDeck(deckId: string) {
    return apiCall(`/decks/${deckId}`, {
      method: 'DELETE',
    });
  },

  async getProgress() {
    return apiCall('/progress');
  },

  async recordStudySession(deckId: string, masteredCards: number) {
    return apiCall('/progress/study-session', {
      method: 'POST',
      body: JSON.stringify({ deckId, masteredCards }),
    });
  }
};
