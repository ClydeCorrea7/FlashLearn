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
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'signin') {
        const data = await authAPI.signIn(email, password);
        onAuthSuccess(data);
      } else if (mode === 'signup') {
        const data = await authAPI.signUp(email, password, name);
        onAuthSuccess(data);
      } else {
        await authAPI.resetPassword(email);
        setMessage('Check your email for the reset link!');
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
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6 cyber-surface neon-border-blue relative">
        <h2 className="text-center text-2xl font-medium bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent mb-4">
          {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
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
          required
          disabled={loading}
        />
        {mode !== 'forgot' && (
          <div className="space-y-1">
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Password"
              disabled={loading}
            />
            {mode === 'signin' && (
              <div className="flex justify-end pr-1">
                <button 
                  type="button" 
                  onClick={() => setMode('forgot')}
                  className="text-[10px] text-[var(--neon-purple)] hover:text-[var(--neon-blue)] transition-colors uppercase font-mono tracking-tighter"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>
        )}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {message && <p className="text-sm text-[var(--neon-blue)] text-center animate-pulse">{message}</p>}
        <NeonButton type="submit" disabled={loading} className="w-full">
          {loading ? (
             mode === 'signin' ? 'Signing In...' : 
             mode === 'signup' ? 'Creating Account...' : 
             'Sending Reset Email...'
          ) : (
             mode === 'signin' ? 'Sign In' : 
             mode === 'signup' ? 'Sign Up' : 
             'Reset Password'
          )}
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