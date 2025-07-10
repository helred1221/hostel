'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erros quando o usuário começar a digitar
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }
    if (!formData.password) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Usuário registrado com sucesso! Redirecionando...');
        // Limpar o formulário
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'USER'
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Erro ao registrar usuário');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card title="Criar Nova Conta">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Digite seu nome completo"
              disabled={loading}
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Digite seu email"
              disabled={loading}
            />
            
            <Input
              label="Senha"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Digite sua senha (mínimo 6 caracteres)"
              disabled={loading}
            />
            
            <Input
              label="Confirmar Senha"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirme sua senha"
              disabled={loading}
            />
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuário
              </label>
              <select
                id="role"
                name="role"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="USER">Usuário</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-center border-t pt-4">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 underline">
                Faça login aqui
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}