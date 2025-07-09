/*
  Warnings:

  - You are about to drop the `cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quarto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reserva` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `reserva` DROP FOREIGN KEY `Reserva_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `reserva` DROP FOREIGN KEY `Reserva_quartoId_fkey`;

-- DropTable
DROP TABLE `cliente`;

-- DropTable
DROP TABLE `quarto`;

-- DropTable
DROP TABLE `reserva`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clientes_email_key`(`email`),
    UNIQUE INDEX `clientes_documento_key`(`documento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quartos` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `tipo` ENUM('SOLTEIRO', 'DUPLO', 'SUITE', 'FAMILIA') NOT NULL,
    `preco` DOUBLE NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quartos_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `quartoId` VARCHAR(191) NOT NULL,
    `dataCheckIn` DATETIME(3) NOT NULL,
    `dataCheckOut` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `valorTotal` DOUBLE NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_quartoId_fkey` FOREIGN KEY (`quartoId`) REFERENCES `quartos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
