'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { signIn, signUp, user, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  if (user) {
    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/');
    }
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        await signUp(email, password);
        setMessage('Check your email for the confirmation link!');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        
        // Redirect based on role
        if (email === 'info@voon.fi') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold text-foreground mb-4">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <Euro className="w-8 h-8" />
            </div>
            FoodAi.fi
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {isSignUp ? 'Luo tili' : 'Kirjaudu sisään'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? 'Liity FoodAi-yhteisöön' : 'Tervetuloa takaisin!'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? 'Rekisteröityminen' : 'Sisäänkirjautuminen'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {message}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Sähköposti
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="sinun@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Salasana
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Syötä salasana"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Ladataan...'
                ) : isSignUp ? (
                  'Luo tili'
                ) : (
                  'Kirjaudu sisään'
                )}
              </Button>
            </form>

            {/* Toggle between signin/signup */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setMessage('');
                }}
                className="text-sm text-orange-600 hover:text-orange-500"
              >
                {isSignUp ? (
                  'Onko sinulla jo tili? Kirjaudu sisään'
                ) : (
                  'Eikö sinulla ole tiliä? Rekisteröidy'
                )}
              </button>
            </div>

            {/* Admin Notice */}
            {email === 'info@voon.fi' && (
              <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
                <p className="text-sm text-blue-700">
                  🔑 Admin-käyttäjä tunnistettu
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Takaisin etusivulle
          </Link>
        </div>
      </div>
    </div>
  );
}