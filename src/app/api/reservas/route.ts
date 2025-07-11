import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Listar todas as reservas
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const reservas = await prisma.reserva.findMany({
      include: {
        cliente: true,
        quarto: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reservas);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { clienteId, quartoId, dataCheckIn, dataCheckOut, observacoes } = await request.json();

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

    // Verificar se o quarto está disponível no período
    const conflictingReservations = await prisma.reserva.findMany({
      where: {
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

    // Buscar informações do quarto para calcular valor total
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

    const reserva = await prisma.reserva.create({
      data: {
        clienteId,
        quartoId,
        dataCheckIn: checkIn,
        dataCheckOut: checkOut,
        valorTotal,
        observacoes,
        status: 'PENDENTE',
      },
      include: {
        cliente: true,
        quarto: true,
      },
    });

    return NextResponse.json(reserva, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}