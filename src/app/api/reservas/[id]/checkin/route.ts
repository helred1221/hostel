import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// POST - Realizar check-in
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

    if (reserva.status !== 'CONFIRMADA') {
      return NextResponse.json(
        { error: 'Apenas reservas confirmadas podem fazer check-in' },
        { status: 400 }
      );
    }

    // Verificar se a data de check-in é hoje ou anterior
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataCheckIn = new Date(reserva.dataCheckIn);
    dataCheckIn.setHours(0, 0, 0, 0);

    if (dataCheckIn > hoje) {
      return NextResponse.json(
        { error: 'Check-in só pode ser realizado a partir da data prevista' },
        { status: 400 }
      );
    }

    const reservaAtualizada = await prisma.reserva.update({
      where: { id: params.id },
      data: {
        status: 'CHECKIN',
      },
      include: {
        cliente: true,
        quarto: true,
      },
    });

    return NextResponse.json(reservaAtualizada);
  } catch (error) {
    console.error('Erro ao realizar check-in:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}