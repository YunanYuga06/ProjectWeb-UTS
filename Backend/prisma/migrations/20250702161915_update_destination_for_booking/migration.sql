-- AlterTable
ALTER TABLE `destination` ADD COLUMN `basePrice` DOUBLE NULL,
    ADD COLUMN `contactEmail` VARCHAR(191) NULL,
    ADD COLUMN `contactPhone` VARCHAR(191) NULL,
    ADD COLUMN `currency` VARCHAR(191) NULL,
    ADD COLUMN `mapEmbedUrl` VARCHAR(191) NULL,
    ADD COLUMN `openingHours` VARCHAR(191) NULL,
    ADD COLUMN `priceNotes` VARCHAR(191) NULL;
