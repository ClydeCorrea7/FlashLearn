import React, { useState } from 'react';
import { NeonButton } from './NeonButton';
import { Input } from './ui/input';
import { PasswordInput } from './PasswordInput';
import { ArrowLeft } from 'lucide-react';
import { authAPI } from '../utils/api';
import { cn } from './ui/utils';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void; // callback after successful login/signup
  onBack?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        const data = await authAPI.signIn(email, password);
        onAuthSuccess(data);
      } else {
        const data = await authAPI.signUp(email, password, name);
        onAuthSuccess(data);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--cyber-bg)] p-4">
      {onBack && (
        <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6 cyber-surface neon-border-blue">
        <h2 className="text-center text-2xl font-medium bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent mb-4">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        {mode === 'signup' && (
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent"
            disabled={loading}
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent"
          disabled={loading}
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Password"
          disabled={loading}
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <NeonButton type="submit" disabled={loading} className="w-full">
          {loading ? (mode === 'signin' ? 'Signing In...' : 'Creating Account...') : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
        </NeonButton>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {mode === 'signin' ? (
            <>Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-[var(--neon-blue)] hover:underline">Create one</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => setMode('signin')} className="text-[var(--neon-blue)] hover:underline">Sign In</button></>
          )}
        </p>
      </form>
    </div>
  );
};