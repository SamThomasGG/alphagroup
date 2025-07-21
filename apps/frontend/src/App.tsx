import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { ViewTransactions } from './pages/ViewTransactions';
import { CreateTransaction } from './pages/CreateTransaction';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute permission="can_view_transactions">
                  <ErrorBoundary>
                    <ViewTransactions />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-transaction"
              element={
                <ProtectedRoute permission="can_input_transactions">
                  <ErrorBoundary>
                    <CreateTransaction />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/transactions" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
