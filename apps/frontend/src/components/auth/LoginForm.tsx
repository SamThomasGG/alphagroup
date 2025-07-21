import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';

export function LoginForm() {
  const navigate = useNavigate();

  const { login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/transactions');
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof Error) {
        errorMessage = err.message;

        // Improve specific error messages
        if (
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized')
        ) {
          errorMessage =
            'Invalid email or password. Please check your credentials and try again.';
        } else if (
          errorMessage.includes('500') ||
          errorMessage.includes('Internal server error')
        ) {
          errorMessage =
            'Server is temporarily unavailable. Please try again in a few moments.';
        } else if (
          errorMessage.includes('Network') ||
          errorMessage.includes('fetch')
        ) {
          errorMessage =
            'Unable to connect to the server. Please check your internet connection.';
        } else if (errorMessage.includes('Validation failed')) {
          // Keep Zod validation messages as they are more specific
          errorMessage = errorMessage.replace('Validation failed: ', '');
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardHeader className="space-y-3">
          <h1 className="text-2xl font-semibold text-center w-full gap-2">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <CardDescription>
            {isRegistering
              ? 'Create a new account to get started with transaction management'
              : 'Sign in to your account to access the transaction dashboard'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isRegistering ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              <>
                {isRegistering ? (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(''); // Clear error when switching modes
            }}
            disabled={isLoading}
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
