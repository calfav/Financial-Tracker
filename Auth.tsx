import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/auth-form';
import { useFinanceStore } from '@/lib/store-with-supabase';

export default function AuthPage() {
  const { isAuthenticated } = useFinanceStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard if user is already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Finance Tracker</h1>
        <p className="text-muted-foreground text-center">Manage your personal finances with ease</p>
      </div>
      
      <AuthForm />
    </div>
  );
}