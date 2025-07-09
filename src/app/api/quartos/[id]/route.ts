import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Buscar quarto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const quarto = await prisma.quarto.findUnique({
      where: { id: params.id },
      include: {
        reservas: {
          include: {
            cliente: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!quarto) {
      return NextResponse.json(
        { error: 'Quarto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(quarto);
  } catch (error) {
    console.error('Erro ao buscar quarto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar quarto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se já existe outro quarto com mesmo número
    const existingQuarto = await prisma.quarto.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          { numero }
        ]
      }
    });

    if (existingQuarto) {
      return NextResponse.json(
        { error: 'Já existe outro quarto com este número' },
        { status: 400 }
      );
    }

    const quarto = await prisma.quarto.update({
      where: { id: params.id },
      data: {
        numero,
        tipo,
        preco: parseFloat(preco),
        descricao,
        ativo: ativo !== undefined ? ativo : true,
      },
    });

    return NextResponse.json(quarto);
  } catch (error) {
    console.error('Erro ao atualizar quarto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir quarto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o quarto tem reservas ativas
    const reservasAtivas = await prisma.reserva.findMany({
      where: {
        quartoId: params.id,
        status: {
          in: ['PENDENTE', 'CONFIRMADA', 'CHECKIN']
        }
      }
    });

    if (reservasAtivas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir quarto com reservas ativas' },
        { status: 400 }
      );
    }

    await prisma.quarto.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Quarto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir quarto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}