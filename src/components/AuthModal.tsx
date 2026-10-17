import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  LogOut,
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types/restaurant';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail
} from '../services/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogin: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onOpenOrders: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  onOpenOrders
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign in with Google (Firebase Authentication)
  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    setError(null);
    try {
      const fbUser = await signInWithGoogle();
      const updatedProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Maheswari Guest',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '98110 23456',
        photoURL: fbUser.photoURL || undefined,
        authProvider: 'google',
        isLoggedIn: true,
        savedAddresses: [
          'Flat 402, Block B, Barakhamba Road, Connaught Place, New Delhi',
          'C-12, Green Park Main, South Delhi'
        ],
        loyaltyPoints: 500,
        recentOrdersCount: 1
      };
      onLogin(updatedProfile);
      setIsLoadingGoogle(false);
      onClose();
    } catch (err: any) {
      setIsLoadingGoogle(false);
      setError(err?.message || 'Google sign-in was cancelled or failed.');
    }
  };

  // Sign in or Register with Email (Firebase Authentication)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const fbUser = await signInWithEmail(email, password);
        const profile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
          phone: fbUser.phoneNumber || '',
          photoURL: fbUser.photoURL || undefined,
          authProvider: 'email' as any,
          isLoggedIn: true,
          savedAddresses: ['Connaught Place, New Delhi'],
          loyaltyPoints: 300,
          recentOrdersCount: 0
        };
        onLogin(profile);
      } else {
        const fbUser = await registerWithEmail(email, password, displayName || undefined);
        const profile: UserProfile = {
          id: fbUser.uid,
          name: displayName || email.split('@')[0],
          email: fbUser.email || email,
          phone: '',
          photoURL: undefined,
          authProvider: 'email' as any,
          isLoggedIn: true,
          savedAddresses: [],
          loyaltyPoints: 100,
          recentOrdersCount: 0
        };
        onLogin(profile);
      }

      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please switch to Sign In.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err?.message || 'Authentication failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-sans-body animate-fade-in">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-stone-100 max-h-[92vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900/60 p-6 border-b border-amber-500/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
            {user.isLoggedIn ? 'Patron Account' : 'MAHESWARI MULTI CUISINE RESTAURANT'}
          </span>
          <h2 className="text-xl font-serif-display font-bold text-amber-100">
            {user.isLoggedIn ? 'Member Profile' : mode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {user.isLoggedIn
              ? 'View order records, address book, and club points.'
              : 'Sign in with Google or Email to unlock seamless ordering.'}
          </p>
        </div>

        {user.isLoggedIn ? (
          /* Profile view when logged in */
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3.5 p-4 bg-stone-800/80 rounded-xl border border-stone-700/80">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border border-amber-400 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-serif-display text-lg font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-white text-sm truncate">{user.name || 'Patron'}</h3>
                  <span className="text-[10px] bg-stone-900 border border-stone-700 px-1.5 py-0.2 rounded text-amber-300 font-mono">
                    {user.authProvider || 'Verified'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 truncate">{user.email || user.phone}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Maheswari Club Member ({user.loyaltyPoints} Points)</span>
                </div>
              </div>
            </div>

            {/* Quick Action to view orders */}
            <button
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-stone-950" />
              <span>View Ordered Item List & Live Status</span>
            </button>

            <div className="pt-2 flex items-center justify-between border-t border-stone-800">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold py-2 px-3 rounded-lg hover:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Sign In with Google and Email ONLY */
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* 1. Sign In With Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoadingGoogle}
              className="w-full py-3 px-4 bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoadingGoogle ? 'Connecting with Google...' : 'Sign in with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-stone-800" />
              <span className="shrink mx-3 text-stone-500 text-[10px] uppercase font-bold tracking-widest">
                or sign in with email
              </span>
              <div className="grow border-t border-stone-800" />
            </div>

            {/* 2. Sign In with Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-300 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="patron@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In with Email' : 'Create Email Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Toggle between Sign In and Create Account */}
            <div className="pt-2 text-center text-xs text-stone-400">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    Register with Email
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    Sign In instead
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
