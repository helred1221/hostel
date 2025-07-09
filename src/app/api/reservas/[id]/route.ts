import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Buscar reserva por ID
export async function GET(
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

    return NextResponse.json(reserva);
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar reserva
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { clienteId, quartoId, dataCheckIn, dataCheckOut, status, observacoes } = await request.json();

    if (!clienteId || !quartoId || !dataCheckIn || !dataCheckOut) {
      return NextResponse.json(
        { error: 'Cliente, quarto, data de check-in e check-out são obrigatórios' },
        { status: 400 }
      );
    }

    const checkIn = new Date(dataCheckIn);
    const checkOut = new Date(dataCheckOut);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'Data de check-out deve ser posterior à data de check-in' },
        { status: 400 }
      );
    }

    // Verificar se o quarto está disponível no período (excluindo a reserva atual)
    const conflictingReservations = await prisma.reserva.findMany({
      where: {
        id: { not: params.id },
        quartoId,
        status: {
          in: ['PENDENTE', 'CONFIRMADA', 'CHECKIN']
        },
        OR: [
          {
            AND: [
              { dataCheckIn: { lte: checkIn } },
              { dataCheckOut: { gt: checkIn } }
            ]
          },
          {
            AND: [
              { dataCheckIn: { lt: checkOut } },
              { dataCheckOut: { gte: checkOut } }
            ]
          },
          {
            AND: [
              { dataCheckIn: { gte: checkIn } },
              { dataCheckOut: { lte: checkOut } }
            ]
          }
        ]
      }
    });

    if (conflictingReservations.length > 0) {
      return NextResponse.json(
        { error: 'Quarto não está disponível no período selecionado' },
        { status: 400 }
      );
    }

    // Buscar informações do quarto para recalcular valor total
    const quarto = await prisma.quarto.findUnique({
      where: { id: quartoId }
    });

    if (!quarto) {
      return NextResponse.json(
        { error: 'Quarto não encontrado' },
        { status: 404 }
      );
    }

    // Calcular número de dias
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const valorTotal = Number(quarto.preco) * diffDays;

    const reserva = await prisma.reserva.update({
      where: { id: params.id },
      data: {
        clienteId,
        quartoId,
        dataCheckIn: checkIn,
        dataCheckOut: checkOut,
        valorTotal,
        status: status || 'PENDENTE',
        observacoes,
      },
      include: {
        cliente: true,
        quarto: true,
      },
    });

    return NextResponse.json(reserva);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir reserva
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se a reserva pode ser excluída (não pode estar em check-in)
    const reserva = await prisma.reserva.findUnique({
      where: { id: params.id }
    });

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    if (reserva.status === 'CHECKIN') {
      return NextResponse.json(
        { error: 'Não é possível excluir reserva com hóspede em check-in' },
        { status: 400 }
      );
    }

    await prisma.reserva.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Reserva excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir reserva:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}