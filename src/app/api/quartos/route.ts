import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Listar todos os quartos
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const quartos = await prisma.quarto.findMany({
      orderBy: { numero: 'asc' },
    });

    return NextResponse.json(quartos);
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo quarto
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { numero, tipo, preco, descricao, ativo } = await request.json();

    if (!numero || !tipo || !preco) {
      return NextResponse.json(
        { error: 'Número, tipo e preço são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe quarto com mesmo número
    const existingQuarto = await prisma.quarto.findUnique({
      where: { numero }
    });

    if (existingQuarto) {
      return NextResponse.json(
        { error: 'Já existe um quarto com este número' },
        { status: 400 }
      );
    }

    const quarto = await prisma.quarto.create({
      data: {
        numero,
        tipo,
        preco: parseFloat(preco),
        descricao,
        ativo: ativo !== undefined ? ativo : true,
      },
    });

    return NextResponse.json(quarto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar quarto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}