import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  canInputTransactions: boolean;
}

export function DashboardHeader({
  canInputTransactions,
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Transaction Dashboard
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            {user?.email}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {canInputTransactions && (
          <Button onClick={() => navigate('/create-transaction')}>
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        )}

        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
