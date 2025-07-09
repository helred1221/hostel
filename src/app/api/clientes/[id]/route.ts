import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Buscar cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: params.id },
      include: {
        reservas: {
          include: {
            quarto: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se já existe outro cliente com mesmo email ou documento
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { email },
              { documento }
            ]
          }
        ]
      }
    });

    if (existingCliente) {
      return NextResponse.json(
        { error: 'Já existe outro cliente com este email ou documento' },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.update({
      where: { id: params.id },
      data: {
        nome,
        email,
        telefone,
        documento,
        endereco,
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o cliente tem reservas ativas
    const reservasAtivas = await prisma.reserva.findMany({
      where: {
        clienteId: params.id,
        status: {
          in: ['PENDENTE', 'CONFIRMADA', 'CHECKIN']
        }
      }
    });

    if (reservasAtivas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir cliente com reservas ativas' },
        { status: 400 }
      );
    }

    await prisma.cliente.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}