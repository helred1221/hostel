import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Listar todos os clientes
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { nome, email, telefone, documento, endereco } = await request.json();

    if (!nome || !email || !telefone || !documento) {
      return NextResponse.json(
        { error: 'Nome, email, telefone e documento são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe cliente com mesmo email ou documento
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { email },
          { documento }
        ]
      }
    });

    if (existingCliente) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este email ou documento' },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        documento,
        endereco,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}