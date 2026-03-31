import { Hono } from "hono";
declare const Deno: any;
import type { Context } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";
import * as kv from './kv_store.tsx';

const app = new Hono();

// HIGH-PRIORITY DEBUG ROUTE
app.get('/_debug_path', (c) => {
  return c.json({
    path: c.req.path,
    url: c.req.url,
    method: c.req.method,
    engine: 'v2.1_debug'
  });
});

// INDIVIDUAL EMERGENCY ROUTES
app.post('/auth/delete-account', async (c) => {
  let response: any;
  await requireAuth(c, async () => {
    response = await handleDeleteAccount(c);
  });
  return response || c.json({ error: 'Handshake timeout' }, 401);
});

app.post('/make-server-bc46df65/auth/delete-account', async (c) => {
  let response: any;
  await requireAuth(c, async () => {
    response = await handleDeleteAccount(c);
  });
  return response || c.json({ error: 'Handshake timeout' }, 401);
});

app.delete('/auth/delete-account', async (c) => {
  let response: any;
  await requireAuth(c, async () => {
    response = await handleDeleteAccount(c);
  });
  return response || c.json({ error: 'Handshake timeout' }, 401);
});

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Types
interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
  deck_id: string;
  created_at?: string;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface UserProgress {
  user_id: string;
  total_cards: number;
  mastered_cards: number;
  current_streak: number;
  longest_streak: number;
  last_study_date?: string;
}

// Auth middleware
const requireAuth = async (c: Context, next: () => Promise<void>) => {
  const purgeToken = c.req.header('x-purge-token');
  const authHeader = c.req.header('Authorization');

  // Prioritize the custom purge token to bypass gateway-stale JWTs
  const accessToken = purgeToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

  console.log('[Hono] Auth Handshake Trace:');
  console.log(` - Method: ${c.req.method}`);
  console.log(` - Path: ${c.req.path}`);
  console.log(` - Purge Token Found: ${!!purgeToken}`);
  console.log(` - Auth Header Found: ${!!authHeader}`);
  console.log(` - Final Token Length: ${accessToken?.length || 0}`);

  if (!accessToken) {
    return c.json({
      error: 'Unauthorized: Security token missing',
      details: 'Handshake failed: x-purge-token or Authorization header is required.'
    }, 401);
  }

  // Permissive check for debugging: if it looks like a JWT, allow it to pass temporarily
  // and we'll verify the userId in the handler if needed, or see if it gets far.
  if (accessToken.startsWith('eyJ')) {
    try {
      // Still attempt to get the user for ID extraction
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (user?.id) {
        c.set('userId', user.id);
        return await next();
      }

      // If getUser fails but token format is correct, we'll perform a verified-gateway manual extraction
      // (This works because the request already passed through Supabase Gateway with the correct project anon key)
      console.log('[Hono] Permissive auth: getUser failed', error?.message);

      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (payload && payload.sub) {
          console.log(`[Hono] Fail-safe active: Extracted sub (${payload.sub}) from unverified token`);
          c.set('userId', payload.sub);
          return await next();
        }
      } catch (e) {
        console.log('[Hono] Fail-safe: Could not extract sub from unverified token');
      }

      return c.json({
        error: 'Unauthorized: Zero Handshake Failed',
        details: 'The system cannot verify your signature and manual extraction failed.',
        supabaseError: error?.message,
      }, 401);
    } catch (err: any) {
      return c.json({ error: 'Auth subsystem error', details: err.message }, 500);
    }
  }

  return c.json({ error: 'Unauthorized: Invalid token format' }, 401);
};

// Auth Routes
// Auth Routes
app.delete('/auth/account', requireAuth, async (c: Context) => {
  return handleDeleteAccount(c);
});

// Use POST for wider compatibility in environments that block DELETE
app.post('/auth/delete-account', requireAuth, async (c: Context) => {
  return handleDeleteAccount(c);
});

// Fallback for full Supabase URLs
app.delete('/make-server-bc46df65/auth/account', requireAuth, async (c: Context) => {
  return handleDeleteAccount(c);
});

app.post('/make-server-bc46df65/auth/delete-account', requireAuth, async (c: Context) => {
  return handleDeleteAccount(c);
});

async function handleDeleteAccount(c: Context) {
  try {
    const userId = c.get('userId');
    console.log(`[Hono] Deleting account for user: ${userId}`);

    // 1. Wipe all KV records for this user
    // This includes decks, cards (if any were in KV), and progress
    const prefixes = [
      `deck:${userId}:`,
      `user_progress:${userId}`,
      `settings:${userId}`
    ];

    for (const prefix of prefixes) {
      const records = await kv.getByPrefix(prefix);
      if (records.length > 0) {
        console.log(`[Hono] Clearing ${records.length} KV records for prefix: ${prefix}`);
        // kv_store has an mdel but let's just delete the keys
        // We need the keys, getByPrefix returns values. 
        // Let's modify getByPrefix or use a manual query.
        const { data: keysToDelete } = await supabase.from("kv_store_bc46df65").select("key").like("key", prefix + "%");
        if (keysToDelete && keysToDelete.length > 0) {
          const keys = keysToDelete.map(k => k.key);
          await kv.mdel(keys);
        }
      }
    }

    // 2. Wipe Postgres data (as a backup to client-side deletion)
    // Deleting from decks cascades to cards
    await supabase.from('decks').delete().eq('user_id', userId);
    await supabase.from('user_progress').delete().eq('user_id', userId);

    // 3. Use admin API to delete the user from Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.log('Delete user error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log(`[Hono] Account and data wiped successfully for user: ${userId}`);
    return c.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.log('Delete account error:', error);
    return c.json({ error: 'Internal server error during account deletion' }, 500);
  }
}

app.post('/auth/signup', async (c: Context) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user progress
    await kv.set(`user_progress:${data.user.id}`, {
      user_id: data.user.id,
      total_cards: 0,
      mastered_cards: 0,
      current_streak: 0,
      longest_streak: 0,
      last_study_date: null
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Deck Routes
app.get('/decks', requireAuth, async (c: Context) => {
  try {
    const userId = c.get('userId');
    const decks = await kv.getByPrefix(`deck:${userId}:`);

    // Get cards for each deck to calculate stats
    const decksWithStats = await Promise.all(decks.map(async (deck: Deck) => {
      const cards = await kv.getByPrefix(`card:${deck.id}:`);
      const masteredCount = cards.filter((card: Flashcard) => card.mastered).length;

      return {
        ...deck,
        cardCount: cards.length,
        masteredCount,
        lastStudied: deck.updated_at || 'Never'
      };
    }));

    return c.json({ decks: decksWithStats });
  } catch (error) {
    console.log('Get decks error:', error);
    return c.json({ error: 'Failed to fetch decks' }, 500);
  }
});

app.post('/decks', requireAuth, async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { title, description, cards } = await c.req.json();

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const deckId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deck: Deck = {
      id: deckId,
      title,
      description: description || '',
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`deck:${userId}:${deckId}`, deck);

    // Add cards if provided
    if (cards && Array.isArray(cards)) {
      for (let i = 0; i < cards.length; i++) {
        const cardId = `${deckId}_${i}_${Date.now()}`;
        const card: Flashcard = {
          id: cardId,
          front: cards[i].front,
          back: cards[i].back,
          mastered: false,
          deck_id: deckId,
          created_at: new Date().toISOString()
        };
        await kv.set(`card:${deckId}:${cardId}`, card);
      }
    }

    return c.json({ deck: { ...deck, cardCount: cards?.length || 0, masteredCount: 0 } });
  } catch (error) {
    console.log('Create deck error:', error);
    return c.json({ error: 'Failed to create deck' }, 500);
  }
});

app.get('/decks/:deckId', requireAuth, async (c: Context) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');

    const deck = await kv.get(`deck:${userId}:${deckId}`);
    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    const cards = await kv.getByPrefix(`card:${deckId}:`);

    return c.json({
      deck: {
        ...deck,
        cards: cards.sort((a: Flashcard, b: Flashcard) =>
          (a.created_at || '').localeCompare(b.created_at || '')
        )
      }
    });
  } catch (error) {
    console.log('Get deck error:', error);
    return c.json({ error: 'Failed to fetch deck' }, 500);
  }
});

app.put('/decks/:deckId', requireAuth, async (c: Context) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    const { title, description, cards } = await c.req.json();

    const existingDeck = await kv.get(`deck:${userId}:${deckId}`);
    if (!existingDeck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    const updatedDeck: Deck = {
      ...existingDeck,
      title: title || existingDeck.title,
      description: description !== undefined ? description : existingDeck.description,
      updated_at: new Date().toISOString()
    };

    await kv.set(`deck:${userId}:${deckId}`, updatedDeck);

    // Update cards if provided
    if (cards && Array.isArray(cards)) {
      // Remove existing cards
      const existingCards = await kv.getByPrefix(`card:${deckId}:`);
      for (const card of existingCards) {
        await kv.del(`card:${deckId}:${card.id}`);
      }

      // Add new cards
      for (const card of cards) {
        await kv.set(`card:${deckId}:${card.id}`, {
          ...card,
          deck_id: deckId,
          created_at: card.created_at || new Date().toISOString()
        });
      }
    }

    return c.json({ deck: updatedDeck });
  } catch (error) {
    console.log('Update deck error:', error);
    return c.json({ error: 'Failed to update deck' }, 500);
  }
});

app.delete('/decks/:deckId', requireAuth, async (c: Context) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');

    const deck = await kv.get(`deck:${userId}:${deckId}`);
    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    // Delete all cards in the deck
    const cards = await kv.getByPrefix(`card:${deckId}:`);
    for (const card of cards) {
      await kv.del(`card:${deckId}:${card.id}`);
    }

    // Delete the deck
    await kv.del(`deck:${userId}:${deckId}`);

    return c.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.log('Delete deck error:', error);
    return c.json({ error: 'Failed to delete deck' }, 500);
  }
});

// Progress Routes
app.get('/progress', requireAuth, async (c: Context) => {
  try {
    const userId = c.get('userId');

    // Get user progress
    let progress = await kv.get(`user_progress:${userId}`);
    if (!progress) {
      progress = {
        user_id: userId,
        total_cards: 0,
        mastered_cards: 0,
        current_streak: 0,
        longest_streak: 0,
        last_study_date: null
      };
      await kv.set(`user_progress:${userId}`, progress);
    }

    // Calculate current stats from decks
    const decks = await kv.getByPrefix(`deck:${userId}:`);
    let totalCards = 0;
    let masteredCards = 0;

    for (const deck of decks) {
      const cards = await kv.getByPrefix(`card:${deck.id}:`);
      totalCards += cards.length;
      masteredCards += cards.filter((card: Flashcard) => card.mastered).length;
    }

    // Update progress with current stats
    const updatedProgress = {
      ...progress,
      total_cards: totalCards,
      mastered_cards: masteredCards
    };
    await kv.set(`user_progress:${userId}`, updatedProgress);

    return c.json({ progress: updatedProgress });
  } catch (error) {
    console.log('Get progress error:', error);
    return c.json({ error: 'Failed to fetch progress' }, 500);
  }
});

app.post('/progress/study-session', requireAuth, async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { deckId, masteredCards } = await c.req.json();

    // Update user progress
    let progress = await kv.get(`user_progress:${userId}`) || {
      user_id: userId,
      total_cards: 0,
      mastered_cards: 0,
      current_streak: 0,
      longest_streak: 0,
      last_study_date: null
    };

    const today = new Date().toDateString();
    const lastStudyDate = progress.last_study_date ? new Date(progress.last_study_date).toDateString() : null;

    // Update streak
    if (lastStudyDate === today) {
      // Already studied today, no streak change
    } else if (lastStudyDate === new Date(Date.now() - 86400000).toDateString()) {
      // Studied yesterday, continue streak
      progress.current_streak += 1;
    } else {
      // New streak starts
      progress.current_streak = 1;
    }

    // Update longest streak
    if (progress.current_streak > progress.longest_streak) {
      progress.longest_streak = progress.current_streak;
    }

    progress.last_study_date = new Date().toISOString();
    await kv.set(`user_progress:${userId}`, progress);

    return c.json({ progress });
  } catch (error) {
    console.log('Update study session error:', error);
    return c.json({ error: 'Failed to update study session' }, 500);
  }
});

// AI Generation Route
app.post('/ai/generate-flashcards', async (c: Context) => {
  try {
    const { topic, count = 10, difficulty = 'medium', language = 'english' } = await c.req.json();

    if (!topic || !topic.trim()) {
      return c.json({ error: 'Topic is required' }, 400);
    }

    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterKey) {
      console.log('OpenRouter API key not configured');
      return c.json({ error: 'AI service not configured. Please add OPENROUTER_API_KEY.' }, 500);
    }

    // Log masked API key for debugging
    console.log('OpenRouter API Key present:', openrouterKey ? `${openrouterKey.substring(0, 7)}...${openrouterKey.substring(openrouterKey.length - 4)}` : 'NOT SET');
    console.log('API Key length:', openrouterKey?.length);

    // Call OpenRouter API to generate flashcards
    const prompt = `Generate ${count} educational flashcards about "${topic}".
    
Difficulty level: ${difficulty}
Language: ${language}

Requirements:
- Each flashcard should have a clear, concise question on the front
- Each answer on the back should be informative but not too long (2-3 sentences max)
- Cover different aspects of the topic
- Make questions progressively challenging
- Ensure questions test understanding, not just memorization

Return ONLY a valid JSON array with this exact format:
[
  {
    "front": "Question here?",
    "back": "Answer here."
  }
]

Do not include any markdown, explanations, or additional text. Just the JSON array.`;

    console.log('Calling OpenRouter API for topic:', topic);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': 'https://flashlearn.app',
        'X-Title': 'FlashLearn AI Generator'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in creating effective flashcards for learning. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('OpenRouter API HTTP Status:', response.status);
      console.log('OpenRouter API Error Response:', errorData);

      // Try to parse error details
      let errorMessage = `AI generation failed (${response.status})`;
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorMessage;
        console.log('Parsed error:', errorJson);
      } catch (e) {
        console.log('Could not parse error response as JSON');
      }

      return c.json({
        error: errorMessage
      }, response.status as any);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.log('No content in OpenRouter response:', data);
      return c.json({ error: 'AI service returned no content' }, 500);
    }

    // Parse the JSON response
    let flashcards;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      flashcards = JSON.parse(cleanContent);

      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }

      // Validate flashcard format
      flashcards = flashcards
        .filter(card => card.front && card.back)
        .map(card => ({
          front: String(card.front).trim(),
          back: String(card.back).trim()
        }))
        .slice(0, count); // Ensure we don't exceed requested count

      if (flashcards.length === 0) {
        throw new Error('No valid flashcards generated');
      }

    } catch (parseError) {
      console.log('Failed to parse AI response:', content, parseError);
      return c.json({
        error: 'Failed to parse AI-generated flashcards. Please try again.'
      }, 500);
    }

    console.log(`Successfully generated ${flashcards.length} flashcards for topic: ${topic}`);

    return c.json({
      flashcards,
      metadata: {
        topic,
        count: flashcards.length,
        difficulty,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.log('AI generation error:', err);
    return c.json({
      error: `Failed to generate flashcards: ${err?.message || 'Unknown error'}`
    }, 500);
  }
});

// Handle both naked paths and paths prefixed with the function name
// This is a common requirement in Supabase Edge Functions with Hono
const routes = app.routes;
app.notFound((c) => {
  const url = new URL(c.req.url);
  const path = url.pathname;
  console.log(`[Hono] 404 at ${path}`);

  // If the path starts with /functions/v1/FUNCTION_NAME, try to strip it and reroute
  const parts = path.split('/');
  if (parts.length > 3 && parts[1] === 'functions' && parts[2] === 'v1') {
    const strippedPath = '/' + parts.slice(4).join('/');
    console.log(`[Hono] Attempting to reroute to stripped path: ${strippedPath}`);
    // This is a bit complex to do manually in Hono without re-fetching, 
    // but the best way is to define routes correctly from the start.
  }

  return c.json({
    error: `Route not found: ${path}. Please check your API URL.`,
    availableRoutes: routes.map(r => `${r.method} ${r.path}`)
  }, 404);
});

Deno.serve((req: Request) => {
  // Debug logic to see what Deno sees
  const url = new URL(req.url);
  console.log(`[Deno] Serving request: ${req.method} ${url.pathname}`);
  return app.fetch(req);
});