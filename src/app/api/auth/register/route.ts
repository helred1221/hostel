import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = 'USER' } = await request.json();

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar role
    const validRoles = ['USER', 'ADMIN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role.toUpperCase()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    
    // Tratamento específico para erros do Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}