import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// POST - Realizar check-out
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        quarto: true,
      },
    });

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    if (reserva.status !== 'CHECKIN') {
      return NextResponse.json(
        { error: 'Apenas reservas com check-in realizado podem fazer check-out' },
        { status: 400 }
      );
    }

    const reservaAtualizada = await prisma.reserva.update({
      where: { id: params.id },
      data: {
        status: 'CHECKOUT',
      },
      include: {
        cliente: true,
        quarto: true,
      },
    });

    return NextResponse.json(reservaAtualizada);
  } catch (error) {
    console.error('Erro ao realizar check-out:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}