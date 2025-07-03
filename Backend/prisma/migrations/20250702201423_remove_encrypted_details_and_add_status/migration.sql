/*
  Warnings:

  - You are about to drop the column `encryptedPaymentDetails` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `tourName` on the `booking` table. All the data in the column will be lost.
  - Added the required column `destinationId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `encryptedPaymentDetails`,
    DROP COLUMN `tourName`,
    ADD COLUMN `customerTransactionNumber` VARCHAR(191) NULL,
    ADD COLUMN `destinationId` INTEGER NOT NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentProofUrl` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
