'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Quarto } from '@/types';

const TIPOS_QUARTO = [
  { value: 'SOLTEIRO', label: 'Solteiro' },
  { value: 'DUPLO', label: 'Duplo' },
  { value: 'SUITE', label: 'Suíte' },
  { value: 'FAMILIA', label: 'Família' },
];

export default function QuartosPage() {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuarto, setEditingQuarto] = useState<Quarto | null>(null);

  useEffect(() => {
    fetchQuartos();
  }, []);

  const fetchQuartos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quartos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuartos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar quartos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este quarto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/quartos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchQuartos();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir quarto');
      }
    } catch (error) {
      console.error('Erro ao excluir quarto:', error);
      alert('Erro ao excluir quarto');
    }
  };

  const filteredQuartos = quartos.filter(quarto =>
    quarto.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quarto.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoLabel = (tipo: string) => {
    const tipoObj = TIPOS_QUARTO.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quartos</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por número ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingQuarto(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Quarto
          </Button>
        </div>
      </div>

      {showForm && (
        <QuartoForm
          quarto={editingQuarto}
          onSave={() => {
            setShowForm(false);
            setEditingQuarto(null);
            fetchQuartos();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingQuarto(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {filteredQuartos.map((quarto) => (
          <Card key={quarto.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quarto {quarto.numero}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quarto.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {quarto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <p><strong>Tipo:</strong> {getTipoLabel(quarto.tipo)}</p>
                  <p><strong>Preço:</strong> R$ {Number(quarto.preco).toFixed(2)}</p>
                  {quarto.descricao && (
                    <p className="md:col-span-3"><strong>Descrição:</strong> {quarto.descricao}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingQuarto(quarto);
                    setShowForm(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(quarto.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredQuartos.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum quarto encontrado.' : 'Nenhum quarto cadastrado.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function QuartoForm({
  quarto,
  onSave,
  onCancel,
}: {
  quarto: Quarto | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    numero: quarto?.numero || '',
    tipo: quarto?.tipo || 'SOLTEIRO',
    preco: quarto?.preco ? Number(quarto.preco).toString() : '',
    descricao: quarto?.descricao || '',
    ativo: quarto?.ativo !== undefined ? quarto.ativo : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = quarto ? `/api/quartos/${quarto.id}` : '/api/quartos';
      const method = quarto ? 'PUT' : 'POST';

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
        setError(errorData.error || 'Erro ao salvar quarto');
      }
    } catch (error) {
      console.error('Erro ao salvar quarto:', error);
      setError('Erro ao salvar quarto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={quarto ? 'Editar Quarto' : 'Novo Quarto'} className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Número"
            type="text"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {TIPOS_QUARTO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.preco}
            onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
            required
          />
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Quarto ativo</span>
            </label>
          </div>
        </div>
        <Input
          label="Descrição (opcional)"
          type="text"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
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