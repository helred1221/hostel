'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login({ username, password });
    
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card title="Sistema de Reservas - Hotel">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Digite seu e-mail"
            />
            
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
            />
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-gray-600 text-center">
            <p>Usuário padrão: <strong>admin</strong></p>
            <p>Senha padrão: <strong>admin123</strong></p>
          </div>

          <div className="mt-6 text-center border-t pt-4">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 underline">
                Registre-se aqui
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}