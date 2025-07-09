'use client';

import { Card } from '@/components/ui/Card';
import { Users, Bed, Calendar, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard - Sistema de Reservas
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Clientes</h3>
            <p className="text-gray-600">Gerenciar clientes do hotel</p>
          </Card>
          
          <Card className="text-center">
            <Bed className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Quartos</h3>
            <p className="text-gray-600">Gerenciar quartos disponíveis</p>
          </Card>
          
          <Card className="text-center">
            <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Reservas</h3>
            <p className="text-gray-600">Gerenciar reservas de quartos</p>
          </Card>
          
          <Card className="text-center">
            <CheckCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Check-in/out</h3>
            <p className="text-gray-600">Processar entrada e saída</p>
          </Card>
        </div>
        
        <Card title="Bem-vindo ao Sistema de Reservas">
          <p className="text-gray-600 mb-4">
            Este sistema permite gerenciar todas as operações do hotel de forma integrada:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Clientes:</strong> Cadastro e gerenciamento de informações dos hóspedes</li>
            <li><strong>Quartos:</strong> Controle de disponibilidade e tipos de acomodação</li>
            <li><strong>Reservas:</strong> Criação e acompanhamento de reservas</li>
            <li><strong>Check-in/Check-out:</strong> Processamento de entrada e saída dos hóspedes</li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Exemplo de Uso:</h4>
            <p className="text-blue-800">
              <strong>DALILA DOS SANTOS</strong> reservou o quarto <strong>201 (duplo)</strong> de <strong>25/07/2025</strong> até <strong>25/07/2025</strong>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}