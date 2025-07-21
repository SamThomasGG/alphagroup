import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogOut, Shield } from 'lucide-react';

export function AccessDenied() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to view transactions. Please contact your
            administrator to request access.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}