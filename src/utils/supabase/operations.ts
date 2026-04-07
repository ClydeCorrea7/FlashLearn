// Database Operations for FlashLearn App
// CRUD operations for decks, cards, and user progress

import { supabase, type Deck, type Card, type UserProgress, type DeckWithCards, type DeckStats, type LearningMode, type MCQOption, type AppNotification } from './client';
import { projectId, publicAnonKey } from './info';

// ============================================
// Utility Functions
// ============================================

// Get current authenticated user ID from Supabase
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Get current session
async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ============================================
// DECK OPERATIONS
// ============================================

/**
 * Fetch all decks for the current user
 */
export async function getDecks(): Promise<DeckStats[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('decks')
    .select(`
      id,
      title,
      description,
      card_count,
      mastered_count,
      last_studied,
      type,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching decks:', error);
    throw new Error(error.message);
  }

  // Fetch due counts for each deck
  const decksWithDueCounts = await Promise.all(data.map(async (deck) => {
    const { count } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .eq('deck_id', deck.id)
      .or(`next_review_due.lte.${new Date().toISOString()},next_review_due.is.null`);
    
    return {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cardCount: deck.card_count || 0,
      masteredCount: deck.mastered_count || 0,
      lastStudied: deck.last_studied,
      preferredMode: deck.type || 'static',
      type: deck.type || 'static',
      dueCount: count || 0
    };
  }));

  return decksWithDueCounts;
}

/**
 * Fetch a single deck by ID
 */
export async function getDeck(deckId: string): Promise<DeckWithCards | null> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Fetch deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single();

  if (deckError) {
    console.error('Error fetching deck:', deckError);
    if (deckError.code === 'PGRST116') return null;
    throw new Error(deckError.message);
  }

  // Fetch cards for the deck
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (cardsError) {
    console.error('Error fetching cards:', cardsError);
    throw new Error(cardsError.message);
  }

  return {
    ...deck,
    cards: cards || []
  };
}

/**
 * Create a new deck with optional initial cards
 */
export async function createDeck(
  title: string,
  description?: string,
  cards?: { front: string; back: string }[],
  preferredMode: LearningMode = 'static'
): Promise<DeckWithCards> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Create the deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert({
      user_id: userId,
      title,
      description: description || null,
      card_count: cards?.length || 0,
      mastered_count: 0,
      last_studied: null,
      preferred_mode: preferredMode,
      type: preferredMode // Ensure type is set explicitly
    })
    .select()
    .single();

  if (deckError) {
    console.error('Error creating deck:', deckError);
    throw new Error(deckError.message);
  }

  // If cards are provided, insert them and get their real IDs
  let finalCards: Card[] = [];
  if (cards && cards.length > 0) {
    const cardsData = cards.map(card => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
      mastered: false
    }));

    const { data: insertedCards, error: cardsError } = await supabase
      .from('cards')
      .insert(cardsData)
      .select();

    if (cardsError) {
      console.error('Error creating cards:', cardsError);
      console.warn('Deck created but cards failed to save');
    } else {
      finalCards = insertedCards || [];
    }
  }

  return { ...deck, cards: finalCards };
}

/**
 * Update an existing deck
 */
export async function updateDeck(
  deckId: string,
  updates: { title?: string; description?: string; preferred_mode?: LearningMode }
): Promise<Deck> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('decks')
    .update({
      title: updates.title,
      description: updates.description,
      preferred_mode: updates.preferred_mode
    })
    .eq('id', deckId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating deck:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a deck and all its cards
 */
export async function deleteDeck(deckId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Cards will be deleted automatically due to CASCADE
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting deck:', error);
    throw new Error(error.message);
  }
}

/**
 * Update deck stats (card count, mastered count, last studied)
 */
export async function updateDeckStats(
  deckId: string,
  cardCount: number,
  masteredCount: number
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('decks')
    .update({
      card_count: cardCount,
      mastered_count: masteredCount,
      last_studied: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating deck stats:', error);
    throw new Error(error.message);
  }
}

// ============================================
// CARD OPERATIONS
// ============================================

/**
 * Add a card to a deck
 */
export async function addCard(
  deckId: string,
  front: string,
  back: string
): Promise<Card> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Verify user owns the deck
  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single();

  if (!deck) {
    throw new Error('Deck not found or access denied');
  }

  const { data, error } = await supabase
    .from('cards')
    .insert({
      deck_id: deckId,
      front,
      back,
      mastered: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding card:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update a card
 */
export async function updateCard(
  cardId: string,
  updates: { front?: string; back?: string; mastered?: boolean }
): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single();

  if (error) {
    console.error('Error updating card:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);

  if (error) {
    console.error('Error deleting card:', error);
    throw new Error(error.message);
  }
}

/**
 * Get all cards in a deck
 */
export async function getCards(deckId: string): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cards:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Mark multiple cards as mastered
 */
export async function markCardsMastered(
  cardIds: string[],
  mastered: boolean = true
): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({ mastered })
    .in('id', cardIds);

  if (error) {
    console.error('Error marking cards:', error);
    throw new Error(error.message);
  }
}

// ============================================
// USER PROGRESS OPERATIONS
// ============================================

/**
 * Get user progress - creates record if it doesn't exist
 */
export async function getUserProgress(): Promise<UserProgress | null> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Try to fetch existing progress
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) {
    return data;
  }

  // If no progress exists, create it
  if (error && error.code === 'PGRST116') {
    const { data: newProgress, error: insertError } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        total_cards: 0,
        mastered_cards: 0,
        current_streak: 0,
        longest_streak: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user progress:', insertError);
      throw new Error(insertError.message);
    }

    return newProgress;
  }

  if (error) {
    console.error('Error fetching progress:', error);
    throw new Error(error.message);
  }

  return null;
}

/**
 * Update user progress after a study session
 */
export async function updateStudyProgress(
  masteredCount: number
): Promise<UserProgress> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const today = new Date().toISOString();

  // Get current progress
  const { data: currentProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  let newStreak = 1;
  let longestStreak = currentProgress?.longest_streak || 0;

  if (currentProgress?.last_study_date) {
    const lastStudyDate = new Date(currentProgress.last_study_date).toDateString();
    const todayDate = new Date().toDateString();

    if (lastStudyDate === todayDate) {
      // Already studied today, keep streak
      newStreak = currentProgress.current_streak;
    } else if (
      new Date(currentProgress.last_study_date).toDateString() ===
      new Date(Date.now() - 86400000).toDateString()
    ) {
      // Studied yesterday, increment streak
      newStreak = (currentProgress.current_streak || 0) + 1;
      if (newStreak > longestStreak) {
        longestStreak = newStreak;
      }
    }
  }

  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      mastered_cards: (currentProgress?.mastered_cards || 0) + masteredCount,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_study_date: today,
      updated_at: today
    })
    .select()
    .single();

  return data;
}

/**
 * Log a card attempt and update its strength score using adaptive logic.
 */
export async function logCardAttempt(
  cardId: string,
  isCorrect: boolean,
  responseTime: number,
  confidence: 'easy' | 'medium' | 'hard',
  mode: LearningMode
): Promise<Card> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // 1. Insert attempt log
  await supabase.from('card_attempts').insert({
    card_id: cardId,
    user_id: userId,
    is_correct: isCorrect,
    response_time: responseTime,
    confidence,
    mode
  });

  // 2. Fetch current metrics
  const { data: card } = await supabase
    .from('cards')
    .select('total_attempts, correct_attempts, strength_score')
    .eq('id', cardId)
    .single();

  if (!card) throw new Error('Card not found');

  const newTotal = (card.total_attempts || 0) + 1;
  const newCorrect = (card.correct_attempts || 0) + (isCorrect ? 1 : 0);

  // 3. Compute new Strength Score
  // Algorithm: CSS = (Accuracy * 0.6) + (Confidence * 0.2) + (Speed * 0.2)
  const accuracy = newCorrect / newTotal;
  
  const confidenceValues = { easy: 1.0, medium: 0.5, hard: 0.2 };
  const confFactor = confidenceValues[confidence];

  const maxExpectedTime = 15000; // 15 seconds
  const speedFactor = Math.max(0, 1 - Math.min(responseTime / maxExpectedTime, 1));

  const css = (accuracy * 0.6) + (confFactor * 0.2) + (speedFactor * 0.2);

  // 4. Determine next review (Simplified Spaced Repetition)
  let nextIntervalDays = 0;
  if (isCorrect) {
    const baseInterval = confidence === 'easy' ? 4 : confidence === 'medium' ? 2 : 1;
    nextIntervalDays = baseInterval * (1 + css);
  }
  
  const nextReviewDue = new Date();
  nextReviewDue.setHours(nextReviewDue.getHours() + (nextIntervalDays * 24));

  const { data, error } = await supabase
    .from('cards')
    .update({
      total_attempts: newTotal,
      correct_attempts: newCorrect,
      strength_score: css,
      last_reviewed: new Date().toISOString(),
      next_review_due: nextReviewDue.toISOString(),
      mastered: css >= 0.85
    })
    .eq('id', cardId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Generate MCQ distractors for a card using AI Edge Function
 */
export async function generateMCQOptions(card: Card): Promise<MCQOption[]> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bc46df65/ai/generate-mcq`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey
        },
        body: JSON.stringify({ card })
      }
    );

    if (!response.ok) throw new Error('AI failed');

    const data = await response.json();
    const distractors: string[] = data.distractors;

    const options: MCQOption[] = [
      { text: card.back, isCorrect: true },
      ...distractors.map(d => ({ text: d, isCorrect: false }))
    ];

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('MCQ generation failed:', error);
    // Fallback: simple distractors if AI fails
    const fallbacks = ["Incorrect answer A", "Incorrect answer B", "Incorrect answer C"];
    const options = [
      { text: card.back, isCorrect: true },
      ...fallbacks.map(d => ({ text: d, isCorrect: false }))
    ];
    return options.sort(() => Math.random() - 0.5);
  }
}

/**
 * Recalculate and sync all user progress from decks
 */
export async function syncUserProgress(): Promise<UserProgress> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // Get all user's decks
  const { data: decks } = await supabase
    .from('decks')
    .select('id, card_count, mastered_count')
    .eq('user_id', userId);

  const totalCards = decks?.reduce((sum, d) => sum + (d.card_count || 0), 0) || 0;
  const masteredCards = decks?.reduce((sum, d) => sum + (d.mastered_count || 0), 0) || 0;

  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      total_cards: totalCards,
      mastered_cards: masteredCards,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error syncing progress:', error);
    throw new Error(error.message);
  }

  return data;
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Create multiple cards at once
 */
export async function addCards(
  deckId: string,
  cards: { front: string; back: string; mastered?: boolean }[]
): Promise<Card[]> {
  if (cards.length === 0) return [];

  const cardsData = cards.map(card => ({
    deck_id: deckId,
    front: card.front,
    back: card.back,
    mastered: card.mastered ?? false
  }));

  const { data, error } = await supabase
    .from('cards')
    .insert(cardsData)
    .select();

  if (error) {
    console.error('Error adding cards:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Replace all cards in a deck
 */
export async function replaceCards(
  deckId: string,
  cards: { front: string; back: string; mastered?: boolean }[]
): Promise<Card[]> {
  // Delete existing cards
  await supabase.from('cards').delete().eq('deck_id', deckId);

  // Add new cards
  return addCards(deckId, cards);
}

// ============================================
// USER ACCOUNT OPERATIONS
// ============================================

/**
 * Delete user account and all associated data
 * This is a two-step process: 
 * 1. Wipe all local/database records in public schema
 * 2. Invoke the Edge Function to wipe Auth user and any hidden metadata/KV data (if purgeEverything is true)
 */
export async function deleteUserAccount(purgeEverything: boolean = true): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bc46df65`;
  const accessToken = (await getCurrentSession())?.access_token;

  if (!accessToken) {
    throw new Error('Access token required for security clearance');
  }

  console.log('[Operations] Initiating multi-stage account purge sequence...');

  try {
    // 1. Client-side database purging (Fast path)
    // Deleting from user_progress and decks first
    const [progressResult, decksResult] = await Promise.all([
      supabase.from('user_progress').delete().eq('user_id', userId),
      supabase.from('decks').delete().eq('user_id', userId)
    ]);

    if (progressResult.error) console.warn('[Purge] Progress wipe failed partially:', progressResult.error);
    if (decksResult.error) console.warn('[Purge] Decks wipe failed partially:', decksResult.error);

    // 2. Server-side Authority purging (Admin path)
    // Only required for full account deletion
    if (purgeEverything) {
      console.log('[Operations] Invoking remote purge via manual protocol (AI-aligned)...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bc46df65/auth/delete-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
            'x-purge-token': accessToken, // Pass user identity in custom header
            'x-client-info': 'flashlearn-client'
          },
          body: JSON.stringify({
            userId,
            reason: 'User-initiated terminal purge',
            timestamp: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Handshake Terminal Error' }));
        console.error('[Operations] Remote handshake failed:', {
          status: response.status,
          error: errorData.error,
          details: errorData.details,
          full: errorData
        });

        const message = errorData.error
          ? `Security: ${errorData.error} (${errorData.details || 'No trace'})`
          : 'Security: Zero Handshake Terminal Error';

        throw new Error(message);
      }

      console.log('[Operations] Remote purge successful.');
    }

    console.log(`[Operations] ${purgeEverything ? 'Account purge' : 'Data wipe'} successful.`);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Deletion request timed out. The server is overloaded, but data may still be scrubbing.');
    }
    throw err;
  }
}


// ============================================
// NOTIFICATION OPERATIONS
// ============================================

/**
 * Fetch all notifications for the current user
 */
export async function getNotifications(): Promise<AppNotification[]> {
  const userId = await getCurrentUserId();
  // Don't throw for unauthenticated here to allow public notifications if needed, 
  // but usually we want a user.
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(error.message);
  }

  return data.map(n => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: n.type,
    readStatus: n.read_status,
    createdAt: n.created_at
  }));
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('notifications')
    .update({ read_status: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(error.message);
  }
}

// ============================================
// SYSTEM VALIDATIONS
// ============================================

/**
 * Check if the user has reached the deck limit (15)
 */
export async function verifyDeckLimit(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { count, error } = await supabase
    .from('decks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return (count || 0) < 15;
}

// ============================================
// DECK MERGING
// ============================================

/**
 * Merge two decks of the same type (Static or MCQ)
 */
export async function mergeDecks(
  deckId1: string,
  deckId2: string,
  newTitle: string,
  newDescription: string
): Promise<Deck> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  // 1. Fetch both decks to verify type and ownership
  const [deck1, deck2] = await Promise.all([
    getDeck(deckId1),
    getDeck(deckId2)
  ]);

  if (!deck1 || !deck2) throw new Error('One or both decks not found');
  
  // Rule: Must be of same type and NOT dynamic
  if (deck1.type !== deck2.type) throw new Error('Cannot merge decks of different types');
  if (deck1.type === 'dynamic') throw new Error('Dynamic sessions cannot be merged');

  // 2. Combine cards, removing duplicates by front text
  const allCardsRaw = [...deck1.cards, ...deck2.cards];
  const uniqueCardsMap = new Map();
  
  allCardsRaw.forEach(card => {
    // Basic deduplication based on front text
    if (!uniqueCardsMap.has(card.front.trim().toLowerCase())) {
      uniqueCardsMap.set(card.front.trim().toLowerCase(), {
        front: card.front,
        back: card.back,
        mastered: card.mastered
      });
    }
  });

  const mergedCards = Array.from(uniqueCardsMap.values());

  // 3. Create the new merged deck
  const newDeck = await createDeck(
    newTitle,
    newDescription,
    mergedCards,
    deck1.type
  );

  // 4. Optionally delete the old decks
  // To be safe, we let the UI handle if it wants to delete them, 
  // but typically we delete them after a successful merge.
  await Promise.all([
    deleteDeck(deckId1),
    deleteDeck(deckId2)
  ]);

  return newDeck;
}

/**
 * Checks if a user email exists in the system
 * Note: This checks the public.users helper table or profile if exists,
 * or handles based on auth attempt.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // We try to sign in with a dummy password. 
    // Supabase returns specific errors for "User not found" if configured.
    // However, for better DX, we usually check a 'profiles' or 'users' table.
    // If no profiles table exists, we can use a more clever approach.
    // Direct query to public.profiles table
    // We check if the email exists in our mirrored profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();
    
    if (error) {
       // PGRST116 means no rows found
       return false;
    }
    
    return !!data;
  } catch {
    return false;
  }
}
