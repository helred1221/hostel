export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  endereco?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quarto {
  id: string;
  numero: string;
  tipo: 'solteiro' | 'duplo' | 'suite' | 'familia';
  preco: number;
  descricao?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reserva {
  id: string;
  clienteId: string;
  quartoId: string;
  dataCheckIn: Date;
  dataCheckOut: Date;
  status: 'pendente' | 'confirmada' | 'checkin' | 'checkout' | 'cancelada';
  valorTotal: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
  cliente?: Cliente;
  quarto?: Quarto;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
}

