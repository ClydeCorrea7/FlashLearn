import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeProvider } from "./components/ThemeProvider";
import { SimpleAuthScreen } from "./components/SimpleAuthScreen";
import { ResetPasswordScreen } from "./components/ResetPasswordScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { Dashboard } from "./components/Dashboard";
import { CreateDeckScreen } from "./components/CreateDeckScreen";
import { DeckViewScreen } from "./components/DeckViewScreen";
import { StudyModeScreen } from "./components/StudyModeScreen";
import { ProgressScreen } from "./components/ProgressScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { PageTransition } from "./components/PageTransition";
import { DeleteAccountModule } from "./components/DeleteAccountModule";
import { DeckImportExport } from './components/DeckImportExport';
import { ManualScreen } from './components/ManualScreenComponent';
import { ChangelogScreen } from "./components/ChangelogScreen";
import { DeckStorageScreen } from "./components/DeckStorageScreen";
import { DynamicSession } from "./components/DynamicSession";
import { NotesPage } from "./components/NotesPage";
import { NotesPageScreen } from "./components/NotesPageScreen";
import { projectId, publicAnonKey } from './utils/supabase/info';
import { supabase } from './utils/supabase/client';
import * as supabaseOps from './utils/supabase/operations';
import { NotificationProvider } from "./components/NotificationCenter";
import {
  Home,
  TrendingUp,
  Settings,
  Plus,
  Loader2,
  Zap,
  Sparkles,
  Brain,
  BookOpen,
  Layers
} from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
  strength_score?: number;
  last_reviewed?: string | null;
  next_review_due?: string | null;
  total_attempts?: number;
  correct_attempts?: number;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  cardCount: number;
  masteredCount: number;
  lastStudied: string;
  preferredMode: import('./utils/supabase/client').LearningMode;
  type: import('./utils/supabase/client').LearningMode;
  dueCount: number;
}

type Screen =
  | 'dashboard'
  | 'create'
  | 'socials'
  | 'notifications'
  | 'settings'
  | 'create-deck'
  | 'deck-view'
  | 'study'
  | 'edit-deck'
  | 'notes'
  | 'import-export'
  | 'dynamic-session'
  | 'auth'
  | 'onboarding'
  | 'study-mode'
  | 'purge'
  | 'manual'
  | 'changelog'
  | 'storage'
  | 'reset-password';

interface UserProgress {
  user_id: string;
  total_cards: number;
  mastered_cards: number;
  current_streak: number;
  longest_streak: number;
  last_study_date?: string;
}

interface AppState {
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  currentScreen: Screen;
  selectedDeckId: string | null;
  decks: Deck[];
  syncStatus: "idle" | "syncing" | "error" | "success";
  user: any;
  userProgress: UserProgress | null;
  isDeleting: boolean;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  initialChoice: 'selection' | 'auth' | 'notes' | null;
}

// AI Integration for flashcard generation using OpenAI
const generateFlashcardsWithAI = async (
  topic: string,
  count: number = 10
): Promise<Array<{ front: string, back: string }>> => {
  try {
    console.log(`Generating ${count} AI flashcards for topic: ${topic}`);

    // Call the server endpoint for AI generation
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bc46df65/ai/generate-flashcards`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey
        },
        body: JSON.stringify({
          topic,
          count,
          difficulty: 'medium',
          language: 'english'
        })
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to generate flashcards';
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `Server responded with ${response.status}: ${text || 'No detail provided'}`;
      }
      console.error('AI generation API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`Successfully received ${data.flashcards.length} AI-generated flashcards`);

    return data.flashcards;
  } catch (error) {
    console.error('AI generation failed:', error);
    throw new Error(`Failed to generate AI flashcards: ${error.message}`);
  }
};

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'admin' | 'system';
  readStatus: boolean;
  createdAt: string;
}


function App() {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    hasSeenOnboarding: false,
    isLoading: true,
    currentScreen: "auth",
    selectedDeckId: null,
    decks: [],
    syncStatus: "idle",
    user: null,
    userProgress: null,
    isDeleting: false,
    notifications: [],
    unreadNotificationsCount: 0,
    initialChoice: 'auth',
  });

  // PWA installation support
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // PWA install prompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initialize app
    initializeApp();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-hide success sync indicator after 2 seconds
  useEffect(() => {
    if (state.syncStatus === "success") {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, syncStatus: "idle" }));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state.syncStatus]);

  const initializeApp = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Check for existing Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();

      // Simulate loading time for smooth animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (error) {
        console.error("Session error:", error);
      }

      // Detect recovery flow (Handles both path and hash-based from Supabase)
      const hash = window.location.hash;
      const path = window.location.pathname;
      if ((hash && hash.includes('type=recovery')) || path.includes('/reset-password')) {
        setState((prev) => ({
          ...prev,
          isAuthenticated: true, // We have a temporary session from the link
          currentScreen: "reset-password",
          isLoading: false,
          initialChoice: 'auth'
        }));
        return;
      }

      if (session?.user) {
        // User is logged in
        const user = session.user;

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          hasSeenOnboarding: true, // Set to true for returning users
          currentScreen: 'dashboard',
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0],
            user_metadata: user.user_metadata
          },
        }));
        await loadUserData();
      } else {
        // No session - show auth screen
        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          currentScreen: "auth",
          user: null,
        }));
      }
    } catch (error) {
      console.error("App initialization error:", error);
      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        currentScreen: "auth",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const loadUserData = async () => {
    try {
      setState((prev) => ({ ...prev, syncStatus: "syncing" }));

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState((prev) => ({ ...prev, syncStatus: "error" }));
        return;
      }

      // Load decks from Supabase
      const decks = await supabaseOps.getDecks();

      // Get or create user progress
      let progress = null;
      try {
        progress = await supabaseOps.getUserProgress();
      } catch (e) {
        console.log("Could not load progress, will use defaults");
      }

      setState((prev) => ({
        ...prev,
        decks: decks.map(deck => ({
          id: deck.id,
          title: deck.title,
          description: deck.description || '',
          cards: [],
          cardCount: deck.cardCount,
          masteredCount: deck.masteredCount,
          lastStudied: deck.lastStudied || 'Never',
          preferredMode: deck.preferredMode,
          type: deck.type, // Explicitly pass type
          dueCount: deck.dueCount
        })),
        userProgress: progress ? {
          user_id: progress.user_id,
          total_cards: progress.total_cards,
          mastered_cards: progress.mastered_cards,
          current_streak: progress.current_streak,
          longest_streak: progress.longest_streak,
          last_study_date: progress.last_study_date
        } : null,
        syncStatus: "success",
      }));

      // Load notifications
      await loadNotifications();
    } catch (error) {
      console.error("Failed to load user data from Supabase:", error);
      setState((prev) => ({ ...prev, syncStatus: "error" }));
    }
  };

  const loadNotifications = async () => {
    try {
      const notifications = await supabaseOps.getNotifications();
      setState(prev => ({
        ...prev,
        notifications,
        unreadNotificationsCount: notifications.filter(n => !n.readStatus).length
      }));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleAuthSuccess = async (userData: { name: string; email: string }) => {
    try {
      // Get the current session from Supabase (already set by SimpleAuthScreen)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const user = session.user;

        // Final verification check
        if (!user.email_confirmed_at) {
          return; // Logic handled in Auth screen or initializeApp
        }

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          currentScreen: "onboarding",
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0],
            user_metadata: user.user_metadata
          },
        }));

        await loadUserData();
      } else {
        // Fallback if no session (shouldn't happen after real auth)
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          currentScreen: "onboarding",
          user: {
            id: 'temp-' + Date.now(),
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            user_metadata: { name: userData.name || userData.email.split('@')[0] }
          },
        }));
        await loadUserData();
      }
    } catch (error) {
      console.error("Error getting user after auth:", error);
    }
  };

  const handleCompleteOnboarding = () => {
    setState((prev) => ({
      ...prev,
      hasSeenOnboarding: true,
      currentScreen: "dashboard",
    }));

    // Save onboarding completion
    localStorage.setItem('flashlearn_onboarding', 'true');
  };

  const handleStartDynamicSession = () => {
    setState(prev => ({ ...prev, currentScreen: 'dynamic-session' }));
  };

  const handleCreateDeck = async (
    title: string,
    description: string,
    cards: { front: string; back: string }[],
    preferredMode: 'static' | 'mcq' | 'dynamic' = 'static'
  ) => {
    try {
      setState((prev) => ({ ...prev, syncStatus: "syncing" }));

      // 1. Verify Deck Limit (Max 15)
      const canCreate = await supabaseOps.verifyDeckLimit();
      if (!canCreate) {
        alert("Maximum deck limit reached (15). Delete or merge decks to continue.");
        setState(prev => ({ ...prev, syncStatus: 'idle' }));
        return;
      }

      // Create deck in Supabase with preferred mode
      const deck = await supabaseOps.createDeck(title, description, cards, preferredMode);

      // Format deck for local state
      const formattedDeck: Deck = {
        id: deck.id,
        title: deck.title,
        description: deck.description || '',
        cards: cards.map((card, index) => ({
          id: `${deck.id}_${index}_${Date.now()}`,
          front: card.front,
          back: card.back,
          mastered: false,
        })),
        cardCount: cards.length,
        masteredCount: 0,
        preferredMode: preferredMode,
        type: preferredMode,
        lastStudied: "Never",
        dueCount: 0
      };

      const updatedDecks = [...state.decks, formattedDeck];

      setState((prev) => ({
        ...prev,
        decks: updatedDecks,
        selectedDeckId: deck.id,
        currentScreen: "deck-view",
        syncStatus: "success",
      }));
    } catch (error) {
      console.error("Failed to create deck in Supabase:", error);
      setState((prev) => ({ ...prev, syncStatus: "error" }));
    }
  };

  const handleMergeDecks = async (deckId1: string, deckId2: string, title: string, description: string) => {
    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' }));

      const newDeck = await supabaseOps.mergeDecks(deckId1, deckId2, title, description);

      // Refresh decks list
      await loadUserData();

      setState(prev => ({
        ...prev,
        currentScreen: 'dashboard',
        syncStatus: 'success'
      }));
    } catch (error) {
      console.error("Merge failed:", error);
      alert(`Merge failed: ${error.message}`);
      setState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  };

  const handleCreateDeckWithAI = async (
    topic: string,
    cardCount: number,
    preferredMode: 'static' | 'mcq' | 'dynamic' = 'static'
  ) => {
    try {
      setState((prev) => ({ ...prev, syncStatus: "syncing" }));

      const aiCards = await generateFlashcardsWithAI(topic, cardCount);
      await handleCreateDeck(
        `${preferredMode === 'mcq' ? 'MCQ' : 'Static'} : ${topic}`,
        `Auto-generated flashcards about ${topic}`,
        aiCards,
        preferredMode
      );
    } catch (error) {
      console.error("Failed to create AI deck:", error);
      setState((prev) => ({ ...prev, syncStatus: "error" }));
    }
  };


  const handleUpdateDeck = async (updatedDeck: Deck) => {
    try {
      setState((prev) => ({ ...prev, syncStatus: "syncing" }));

      // Update deck in Supabase
      await supabaseOps.updateDeck(updatedDeck.id, {
        title: updatedDeck.title,
        description: updatedDeck.description,
        preferred_mode: updatedDeck.preferredMode
      });

      // Update cards in Supabase
      if (updatedDeck.cards.length > 0) {
        await supabaseOps.replaceCards(updatedDeck.id,
          updatedDeck.cards.map(card => ({
            front: card.front,
            back: card.back,
            mastered: card.mastered
          }))
        );
      }

      // Update deck stats in Supabase
      const cardCount = updatedDeck.cards.length;
      const masteredCount = updatedDeck.cards.filter(card => card.mastered).length;
      await supabaseOps.updateDeckStats(updatedDeck.id, cardCount, masteredCount);

      // Update local state
      const updatedDecks = state.decks.map((deck) =>
        deck.id === updatedDeck.id
          ? {
            ...updatedDeck,
            cardCount,
            masteredCount,
            lastStudied: "Just now",
          }
          : deck,
      );

      setState((prev) => ({
        ...prev,
        decks: updatedDecks,
        syncStatus: "success",
      }));

      // Sync user progress
      await supabaseOps.syncUserProgress();
    } catch (error) {
      console.error("Failed to update deck in Supabase:", error);
      setState((prev) => ({ ...prev, syncStatus: "error" }));
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      setState((prev) => ({ ...prev, syncStatus: "syncing" }));

      // Delete deck from Supabase (cards are deleted via CASCADE)
      await supabaseOps.deleteDeck(deckId);

      // Update local state
      const updatedDecks = state.decks.filter((deck) => deck.id !== deckId);

      setState((prev) => ({
        ...prev,
        decks: updatedDecks,
        selectedDeckId: null,
        currentScreen: "dashboard",
        syncStatus: "success",
      }));

      // Sync user progress
      await supabaseOps.syncUserProgress();
    } catch (error) {
      console.error("Failed to delete deck from Supabase:", error);
      setState((prev) => ({ ...prev, syncStatus: "error" }));
    }
  };

  const handleStartStudy = (deckId: string) => {
    setState((prev) => ({
      ...prev,
      selectedDeckId: deckId,
      currentScreen: "study-mode",
    }));
  };

  const handleOpenDeck = async (deckId: string) => {
    try {
      setState((prev) => ({ ...prev, syncStatus: "syncing" }));

      // Load full deck with cards from Supabase
      const deckWithCards = await supabaseOps.getDeck(deckId);

      if (deckWithCards) {
        // Update the deck in state with full cards
        const updatedDecks = state.decks.map(deck =>
          deck.id === deckId
            ? {
              id: deckWithCards.id,
              title: deckWithCards.title,
              description: deckWithCards.description || '',
              cards: deckWithCards.cards.map(card => ({
                id: card.id,
                front: card.front,
                back: card.back,
                mastered: card.mastered
              })),
              cardCount: deckWithCards.cards.length,
              masteredCount: deckWithCards.cards.filter(c => c.mastered).length,
              lastStudied: deckWithCards.last_studied || 'Never',
              preferredMode: deckWithCards.type || 'static',
              type: deckWithCards.type,
              dueCount: 0 // Will be synced on return to dashboard
            }
            : deck
        );

        setState((prev) => ({
          ...prev,
          decks: updatedDecks,
          selectedDeckId: deckId,
          currentScreen: "deck-view",
          syncStatus: "success",
        }));
      } else {
        console.error("Deck not found");
        setState((prev) => ({ ...prev, syncStatus: "error" }));
      }
    } catch (error) {
      console.error("Failed to load deck from Supabase:", error);
      setState((prev) => ({ ...prev, syncStatus: "error" }));
    }
  };

  const handleCompleteStudy = async (updatedCards: Flashcard[]) => {
    if (!state.selectedDeckId) return;

    const updatedDeck = state.decks.find(
      (deck) => deck.id === state.selectedDeckId,
    );
    if (updatedDeck) {
      const deckWithUpdatedCards = {
        ...updatedDeck,
        cards: updatedCards,
      };

      await handleUpdateDeck(deckWithUpdatedCards);
    }

    setState((prev) => ({
      ...prev,
      currentScreen: "dashboard",
    }));
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        hasSeenOnboarding: false,
        currentScreen: "auth",
        decks: [],
        selectedDeckId: null,
        syncStatus: "idle",
        user: null,
        userProgress: null,
      }));
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleDeleteAccount = async (purgeEverything: boolean = true) => {
    try {
      console.log(`[DeleteAccount] Starting ${purgeEverything ? 'full account purge' : 'data wipe'} process...`);
      setState((prev) => ({ ...prev, isDeleting: true, syncStatus: "syncing" }));

      // Wipe/Delete account
      await supabaseOps.deleteUserAccount(purgeEverything);

      if (purgeEverything) {
        // Full purge: sign out and return to auth
        await supabase.auth.signOut();
        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          hasSeenOnboarding: false,
          currentScreen: "auth",
          decks: [],
          selectedDeckId: null,
          syncStatus: "idle",
          user: null,
          userProgress: null,
          isDeleting: false,
        }));
      } else {
        // Wipe only: clear local list and stay on settings
        setState((prev) => ({
          ...prev,
          decks: [],
          userProgress: {
            user_id: state.user?.id || '',
            total_cards: 0,
            mastered_cards: 0,
            current_streak: 0,
            longest_streak: 0
          },
          isDeleting: false,
          syncStatus: "success",
          currentScreen: "dashboard" // Kick back to dashboard after wipe
        }));
      }

      console.log(`[DeleteAccount] ${purgeEverything ? 'Account purge' : 'Data wipe'} successful.`);
    } catch (error) {
      console.error("[DeleteAccount] Error during process:", error);
      setState((prev) => ({ ...prev, isDeleting: false, syncStatus: "error" }));
      console.warn("Failed to complete request. System state may be inconsistent.");
      throw error;
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const selectedDeck = state.selectedDeckId
    ? state.decks.find((deck) => deck.id === state.selectedDeckId)
    : null;

  // Enhanced mobile loading screen
  if (state.isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden touch-none">
          {/* Mobile-optimized animated background */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{
              backgroundPosition: ["0px 0px", "30px 30px"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundImage:
                "linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <motion.div
            className="text-center relative z-10 px-4 max-w-sm mx-auto"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="cyber-gradient w-16 h-16 sm:w-20 sm:h-20 rounded-xl mx-auto flex items-center justify-center neon-glow-blue mb-6 relative"
              animate={{
                rotateY: [0, 360],
                boxShadow: [
                  "0 0 15px rgba(59, 130, 246, 0.4)",
                  "0 0 30px rgba(139, 92, 246, 0.6)",
                  "0 0 15px rgba(59, 130, 246, 0.4)",
                ],
              }}
              transition={{
                rotateY: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                },
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />

              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-[var(--neon-purple)] rounded-full flex items-center justify-center neon-glow-purple"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </motion.div>

              {/* Mobile-optimized scan lines */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-white/15 to-transparent rounded-xl"
                animate={{ y: [-60, 60] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>

            <motion.h1
              className="text-xl sm:text-2xl mb-4 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent"
              animate={{
                textShadow: [
                  "0 0 8px rgba(59,130,246,0.5)",
                  "0 0 16px rgba(139,92,246,0.7)",
                  "0 0 8px rgba(59,130,246,0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              FlashLearn
            </motion.h1>

            <motion.p
              className="text-muted-foreground mb-8 text-sm px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Initializing learning protocol...
            </motion.p>

            {/* Mobile-optimized loading dots */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-[var(--neon-blue)] rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </ThemeProvider>
    );
  }

  // Mobile-optimized sync indicator with temporary display for success
  const SyncIndicator = () => {
    if (state.syncStatus === "idle") return null;

    const statusConfig = {
      syncing: {
        text: "Syncing...",
        color: "text-[var(--neon-blue)]",
        icon: Loader2,
      },
      error: {
        text: "Sync failed",
        color: "text-destructive",
        icon: Zap,
      },
      success: {
        text: "Synced",
        color: "text-green-500",
        icon: Zap,
      },
    };

    const config = statusConfig[state.syncStatus];
    const IconComponent = config.icon;

    return (
      <AnimatePresence>
        <motion.div
          className={`fixed top-4 left-4 right-4 sm:right-auto sm:w-auto z-50 flex items-center justify-center sm:justify-start gap-2 cyber-surface rounded-lg px-3 py-2 border-2 border-border shadow-lg ${config.color}`}
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <IconComponent
            className={`w-3 h-3 ${state.syncStatus === "syncing" ? "animate-spin" : "animate-pulse"}`}
          />
          <span className="text-[7px] sm:text-[8px] font-['Press_Start_2P'] font-black">
            {config.text}
          </span>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Mobile-first navigation bar
  const NavigationBar = () => {
    if (!state.isAuthenticated || !state.hasSeenOnboarding) return null;

    const navItems = [
      { icon: Home, screen: "dashboard", label: "Home" },
      { icon: Plus, screen: "create", label: "Create" },
      { icon: Zap, screen: "socials", label: "Socials" },
      { icon: BookOpen, screen: "notifications", label: "Alerts" },
      { icon: Settings, screen: "settings", label: "Settings" },
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 cyber-surface border-t-2 border-border p-3 z-50 safe-area-bottom">
        <div className="flex justify-around max-w-md mx-auto">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = state.currentScreen === item.screen;

            return (
              <motion.button
                key={item.screen}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    currentScreen: item.screen as Screen,
                  }))
                }
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-0 flex-1 ${isActive
                  ? "cyber-gradient text-white neon-glow-blue"
                  : "hover:bg-secondary/50 text-muted-foreground"
                  }`}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
              >
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-[6px] font-['Press_Start_2P'] text-center">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  // PWA Install prompt
  const PWAInstallPrompt = () => {
    if (!showInstallPrompt) return null;

    return (
      <motion.div
        className="fixed top-20 left-4 right-4 z-50 bg-card border-2 border-border rounded-lg p-4 shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm mb-1 text-foreground">Install FlashLearn</p>
            <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-3 py-1 text-xs text-muted-foreground"
            >
              Later
            </button>
            <button
              onClick={handleInstallPWA}
              className="px-3 py-1 text-xs cyber-gradient text-white rounded"
            >
              Install
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCurrentScreen = () => {
    if (!state.isAuthenticated) {
      return (
        <PageTransition>
          <SimpleAuthScreen onAuthSuccess={handleAuthSuccess} />
        </PageTransition>
      );
    }

    switch (state.currentScreen) {
      case "onboarding":
        return (
          <PageTransition>
            <OnboardingScreen onComplete={handleCompleteOnboarding} />
          </PageTransition>
        );

      case "dashboard":
        return (
          <PageTransition>
            <Dashboard
              decks={state.decks}
              onCreateDeck={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "create-deck",
                }))
              }
              onOpenDeck={handleOpenDeck}
              onDeleteDeck={handleDeleteDeck}
              onOpenManual={() => setState((prev) => ({ ...prev, currentScreen: 'manual' }))}
              onOpenStorage={() => setState((prev) => ({ ...prev, currentScreen: 'storage' }))}
            />
          </PageTransition>
        );
      
      case "storage":
        return (
          <PageTransition>
            <DeckStorageScreen 
              decks={state.decks}
              onBack={() => setState(prev => ({ ...prev, currentScreen: 'dashboard' }))}
              onMergeDecks={handleMergeDecks}
              onDeleteDeck={handleDeleteDeck}
              onOpenDeck={handleOpenDeck}
            />
          </PageTransition>
        );

      case "dynamic-session":
        return (
          <PageTransition>
            <DynamicSession
              onClose={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "dashboard",
                }))
              }
            />
          </PageTransition>
        );

      case "create-deck":
        return (
          <PageTransition>
            <CreateDeckScreen
              onBack={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "dashboard",
                }))
              }
              onCreateDeck={handleCreateDeck}
              onCreateDeckWithAI={handleCreateDeckWithAI}
              onStartDynamicSession={handleStartDynamicSession}
            />
          </PageTransition>
        );

      case "deck-view":
        return selectedDeck ? (
          <PageTransition>
            <DeckViewScreen
              deck={selectedDeck}
              onBack={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "dashboard",
                }))
              }
              onStartStudy={handleStartStudy}
              onUpdateDeck={handleUpdateDeck}
              onDeleteDeck={handleDeleteDeck}
            />
          </PageTransition>
        ) : (
          <PageTransition>
            <Dashboard
              decks={state.decks}
              onCreateDeck={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "create-deck",
                }))
              }
              onOpenDeck={handleOpenDeck}
              onOpenManual={() => setState((prev) => ({ ...prev, currentScreen: 'manual' }))}
              onOpenStorage={() => setState((prev) => ({ ...prev, currentScreen: 'storage' }))}
            />
          </PageTransition>
        );

      case "study-mode":
        return selectedDeck ? (
          <PageTransition>
            <StudyModeScreen
              cards={selectedDeck.cards}
              deckTitle={selectedDeck.title}
              initialMode={selectedDeck.preferredMode}
              onBack={() => setState((prev) => ({ ...prev, currentScreen: "deck-view" }))}
              onComplete={handleCompleteStudy}
            />
          </PageTransition>
        ) : (
          <PageTransition>
            <Dashboard
              decks={state.decks}
              onCreateDeck={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "create-deck",
                }))
              }
              onOpenDeck={handleOpenDeck}
              onOpenManual={() => setState((prev) => ({ ...prev, currentScreen: 'manual' }))}
              onOpenStorage={() => setState((prev) => ({ ...prev, currentScreen: 'storage' }))}
            />
          </PageTransition>
        );

      case "create":
        return (
          <PageTransition>
            <CreateDeckScreen
              onBack={() => setState((prev) => ({ ...prev, currentScreen: "dashboard" }))}
              onCreateDeck={handleCreateDeck}
              onCreateDeckWithAI={handleCreateDeckWithAI}
              onStartDynamicSession={handleStartDynamicSession}
              onOpenNotes={() => setState(prev => ({ ...prev, currentScreen: 'notes' }))}
            />
          </PageTransition>
        );

      case "notes":
        return (
          <NotesPageScreen
            onBack={() => setState(prev => ({ ...prev, currentScreen: 'dashboard' }))}
            isAuthenticated={state.isAuthenticated}
          />
        );

      case "socials":
        return (
          <PageTransition>
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
              <div className="space-y-4">
                <motion.div
                  className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Plus className="w-10 h-10 text-muted-foreground opacity-20" />
                </motion.div>
                <h2 className="text-xl font-bold opacity-40">Socials coming soon</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto opacity-30">
                  Connect with other learners, share decks, and master topics together.
                </p>
              </div>
            </div>
          </PageTransition>
        );

      case "notifications":
        return (
          <PageTransition>
            <div className="min-h-screen bg-background overflow-auto">
              <div className="max-w-2xl mx-auto p-4 pb-24">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">Notifications</h1>
                </div>

                {state.notifications.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <Zap className="w-12 h-12 mx-auto mb-4" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.notifications.map(n => (
                      <motion.div
                        key={n.id}
                        className={`p-4 rounded-xl border border-border bg-card ${!n.readStatus ? 'border-[var(--neon-blue)] shadow-[0_0_10px_rgba(59,130,246,0.2)]' : ''}`}
                        onClick={async () => {
                          if (!n.readStatus) {
                            await supabaseOps.markNotificationRead(n.id);
                            loadNotifications();
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-sm text-foreground">{n.title}</h3>
                          <span className="text-[8px] text-muted-foreground opacity-60 font-bold">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">{n.message}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PageTransition>
        );

      case "settings":
        return (
          <PageTransition>
            <SettingsScreen
              onBack={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "dashboard",
                }))
              }
              onSignOut={handleSignOut}
              onStartPurge={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "purge",
                }))
              }
              onOpenChangelog={() =>
                setState(prev => ({ ...prev, currentScreen: 'changelog' }))
              }
              user={state.user}
              isDeleting={state.isDeleting}
            />
          </PageTransition>
        );

      case "purge":
        return (
          <PageTransition>
            <DeleteAccountModule
              onConfirm={handleDeleteAccount}
              onAbort={() =>
                setState((prev) => ({
                  ...prev,
                  currentScreen: "settings",
                }))
              }
              isDeleting={state.isDeleting}
            />
          </PageTransition>
        );

      case "manual":
        return (
          <PageTransition>
            <ManualScreen onBack={() => setState((prev) => ({ ...prev, currentScreen: 'dashboard' }))} />
          </PageTransition>
        );

      case "changelog":
        return (
          <PageTransition>
            <ChangelogScreen onBack={() => setState((prev) => ({ ...prev, currentScreen: 'settings' }))} />
          </PageTransition>
        );

      case "reset-password":
        return (
          <ResetPasswordScreen
            onSuccess={() => {
              // Reload app to clean URL hash and load dashboard
              window.location.hash = '';
              window.location.reload();
            }}
          />
        );

      case "auth":
        return (
          <PageTransition>
            <SimpleAuthScreen onAuthSuccess={handleAuthSuccess} />
          </PageTransition>
        );

      default:
        return (
          <PageTransition>
            <SimpleAuthScreen onAuthSuccess={handleAuthSuccess} />
          </PageTransition>
        );
    }
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Mobile-optimized background */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 opacity-3"
            animate={{
              backgroundPosition: ["0px 0px", "40px 40px"],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundImage:
                "linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Reduced particles for mobile performance */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[var(--neon-blue)] rounded-full opacity-20"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 20}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                x: [-8, 8, -8],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={state.currentScreen}>
            {renderCurrentScreen()}
          </motion.div>
        </AnimatePresence>

        {state.currentScreen !== "purge" && (
          <>
            <SyncIndicator />
            <PWAInstallPrompt />
            {state.currentScreen !== "study-mode" && state.currentScreen !== "dynamic-session" && (
              <NavigationBar />
            )}
            {state.isAuthenticated && state.hasSeenOnboarding && state.currentScreen !== "study-mode" && state.currentScreen !== "dynamic-session" && (
              <div className="pb-24" />
            )}
          </>
        )}
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;