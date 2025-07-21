import React, { useMemo } from 'react';
import type { Transaction } from '@/types/auth.ts';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Clock, UserCheck } from 'lucide-react';

interface StatsCardsProps {
  transactions: Transaction[];
}

export const StatsCards = React.memo(function StatsCards({ transactions }: StatsCardsProps) {
  const pendingCount = useMemo(
    () => transactions.filter((t) => t.status === 'pending').length,
    [transactions]
  );
  
  const approvedCount = useMemo(
    () => transactions.filter((t) => t.status === 'approved').length,
    [transactions]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Approved
              </p>
              <p className="text-2xl font-bold">{approvedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
