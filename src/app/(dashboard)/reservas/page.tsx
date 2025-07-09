'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, Search, LogIn, LogOut } from 'lucide-react';
import { Reserva, Cliente, Quarto } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABELS = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMADA: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  CHECKIN: { label: 'Check-in', color: 'bg-green-100 text-green-800' },
  CHECKOUT: { label: 'Check-out', color: 'bg-gray-100 text-gray-800' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [reservasRes, clientesRes, quartosRes] = await Promise.all([
        fetch('/api/reservas', { headers }),
        fetch('/api/clientes', { headers }),
        fetch('/api/quartos', { headers }),
      ]);

      if (reservasRes.ok) {
        const reservasData = await reservasRes.json();
        setReservas(reservasData);
      }

      if (clientesRes.ok) {
        const clientesData = await clientesRes.json();
        setClientes(clientesData);
      }

      if (quartosRes.ok) {
        const quartosData = await quartosRes.json();
        setQuartos(quartosData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir reserva');
      }
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      alert('Erro ao excluir reserva');
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservas/${id}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao realizar check-in');
      }
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      alert('Erro ao realizar check-in');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservas/${id}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao realizar check-out');
      }
    } catch (error) {
      console.error('Erro ao realizar check-out:', error);
      alert('Erro ao realizar check-out');
    }
  };

  const filteredReservas = reservas.filter(reserva =>
    reserva.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reserva.quarto?.numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Reservas</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por cliente ou quarto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingReserva(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Reserva
          </Button>
        </div>
      </div>

      {showForm && (
        <ReservaForm
          reserva={editingReserva}
          clientes={clientes}
          quartos={quartos}
          onSave={() => {
            setShowForm(false);
            setEditingReserva(null);
            fetchData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingReserva(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {filteredReservas.map((reserva) => (
          <Card key={reserva.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reserva.cliente?.nome} - Quarto {reserva.quarto?.numero}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    STATUS_LABELS[reserva.status as keyof typeof STATUS_LABELS]?.color
                  }`}>
                    {STATUS_LABELS[reserva.status as keyof typeof STATUS_LABELS]?.label}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                  <p><strong>Check-in:</strong> {format(new Date(reserva.dataCheckIn), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p><strong>Check-out:</strong> {format(new Date(reserva.dataCheckOut), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p><strong>Tipo:</strong> {reserva.quarto?.tipo.toLowerCase()}</p>
                  <p><strong>Valor:</strong> R$ {Number(reserva.valorTotal).toFixed(2)}</p>
                  {reserva.observacoes && (
                    <p className="md:col-span-2 lg:col-span-4"><strong>Observações:</strong> {reserva.observacoes}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {reserva.status === 'CONFIRMADA' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCheckIn(reserva.id)}
                    title="Realizar Check-in"
                  >
                    <LogIn className="w-4 h-4" />
                  </Button>
                )}
                {reserva.status === 'CHECKIN' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCheckOut(reserva.id)}
                    title="Realizar Check-out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
                {reserva.status !== 'CHECKIN' && reserva.status !== 'CHECKOUT' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingReserva(reserva);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {reserva.status !== 'CHECKIN' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(reserva.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredReservas.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'Nenhuma reserva encontrada.' : 'Nenhuma reserva cadastrada.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function ReservaForm({
  reserva,
  clientes,
  quartos,
  onSave,
  onCancel,
}: {
  reserva: Reserva | null;
  clientes: Cliente[];
  quartos: Quarto[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    clienteId: reserva?.clienteId || '',
    quartoId: reserva?.quartoId || '',
    dataCheckIn: reserva?.dataCheckIn ? format(new Date(reserva.dataCheckIn), 'yyyy-MM-dd') : '',
    dataCheckOut: reserva?.dataCheckOut ? format(new Date(reserva.dataCheckOut), 'yyyy-MM-dd') : '',
    status: reserva?.status || 'PENDENTE',
    observacoes: reserva?.observacoes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = reserva ? `/api/reservas/${reserva.id}` : '/api/reservas';
      const method = reserva ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao salvar reserva');
      }
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      setError('Erro ao salvar reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={reserva ? 'Editar Reserva' : 'Nova Reserva'} className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              value={formData.clienteId}
              onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quarto
            </label>
            <select
              value={formData.quartoId}
              onChange={(e) => setFormData({ ...formData, quartoId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione um quarto</option>
              {quartos.filter(q => q.ativo).map((quarto) => (
                <option key={quarto.id} value={quarto.id}>
                  {quarto.numero} - {quarto.tipo.toLowerCase()} (R$ {Number(quarto.preco).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Data Check-in"
            type="date"
            value={formData.dataCheckIn}
            onChange={(e) => setFormData({ ...formData, dataCheckIn: e.target.value })}
            required
          />

          <Input
            label="Data Check-out"
            type="date"
            value={formData.dataCheckOut}
            onChange={(e) => setFormData({ ...formData, dataCheckOut: e.target.value })}
            required
          />

          {reserva && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          )}
        </div>

        <Input
          label="Observações (opcional)"
          type="text"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
        />

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex space-x-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}