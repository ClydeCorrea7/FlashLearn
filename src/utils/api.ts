import { createClient } from '@supabase/supabase-js';
import { requestWithRetry } from './rateLimiter';
import { projectId, publicAnonKey } from './supabase/info'

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bc46df65`

// Auth API
export const authAPI = {
  async signUp(email: string, password: string, name: string) {
    const response = await requestWithRetry(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    })
    
    if (!response.ok) {
      let errorMessage = 'Signup failed';
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        errorMessage = data.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error (${response.status}): ${text || 'No details'}`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(error.message)
    }
    return data
  }
}

// Get access token for authenticated requests
async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Decks API
export const decksAPI = {
  async getDecks() {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await requestWithRetry(`${API_BASE}/decks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      let errorMessage = 'Failed to fetch decks';
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        errorMessage = data.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error (${response.status}): ${text || 'No details'}`;
        if (response.status === 404) errorMessage = "Decks endpoint not found (404).";
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    return data.decks
  },

  async createDeck(title: string, description: string, cards: Array<{front: string, back: string}>) {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await requestWithRetry(`${API_BASE}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ title, description, cards })
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create deck')
    }

    return data.deck
  },

  async updateDeck(deckId: string, updatedDeck: any) {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await requestWithRetry(`${API_BASE}/decks/${deckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updatedDeck)
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update deck')
    }

    return data.deck
  },

  async deleteDeck(deckId: string) {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await requestWithRetry(`${API_BASE}/decks/${deckId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete deck')
    }

    return data
  }
}

// Settings API
export const settingsAPI = {
  async getSettings() {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await requestWithRetry(`${API_BASE}/settings`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch settings')
    }

    return data.settings
  },

  async updateSettings(settings: any) {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await requestWithRetry(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(settings)
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update settings')
    }

    return data.settings
  }
}