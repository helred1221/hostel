import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  // Criar alguns quartos de exemplo
  const quartos = [
    {
      numero: '101',
      tipo: 'SOLTEIRO' as const,
      preco: 150.00,
      descricao: 'Quarto solteiro confortável com vista para o jardim',
    },
    {
      numero: '201',
      tipo: 'DUPLO' as const,
      preco: 250.00,
      descricao: 'Quarto duplo espaçoso com varanda',
    },
    {
      numero: '301',
      tipo: 'SUITE' as const,
      preco: 400.00,
      descricao: 'Suíte luxuosa com sala de estar',
    },
    {
      numero: '401',
      tipo: 'FAMILIA' as const,
      preco: 350.00,
      descricao: 'Quarto família com duas camas de casal',
    },
  ];

  for (const quarto of quartos) {
    await prisma.quarto.upsert({
      where: { numero: quarto.numero },
      update: {},
      create: quarto,
    });
  }

  // Criar cliente de exemplo
  const cliente = await prisma.cliente.upsert({
    where: { email: 'dalila.santos@email.com' },
    update: {},
    create: {
      nome: 'DALILA DOS SANTOS',
      email: 'dalila.santos@email.com',
      telefone: '(11) 99999-9999',
      documento: '123.456.789-00',
      endereco: 'Rua das Flores, 123 - São Paulo, SP',
    },
  });

  console.log('Seed executado com sucesso!');
  console.log('Usuário admin criado:', admin);
  console.log('Cliente exemplo criado:', cliente);
  console.log('Quartos criados:', quartos.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });