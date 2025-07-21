import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api.ts';
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
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Plus,
  PoundSterling,
  AlertCircle,
  FileText,
} from 'lucide-react';

export function TransactionForm() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.transactions.create({
        title,
        priceGBP: parseFloat(price),
      });
      navigate('/transactions');
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Process validation errors to show cleaner messages
      if (errorMessage.includes('Validation failed')) {
        errorMessage = errorMessage.replace('Validation failed: ', '');
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1 mb-6">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Transaction Details
            </CardTitle>
            <CardDescription>
              Enter the details for the new transaction. All transactions
              require approval before being processed.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter a descriptive title for the transaction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="text-sm font-medium flex items-center gap-2"
              >
                <PoundSterling className="h-4 w-4" />
                Amount (GBP)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  £
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the transaction amount in British Pounds
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex gap-3 pt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Transaction...
                </div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Transaction
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/transactions')}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
