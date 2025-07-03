/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `Testimonial` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `testimonial` ADD COLUMN `bookingId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Testimonial_bookingId_key` ON `Testimonial`(`bookingId`);

-- AddForeignKey
ALTER TABLE `Testimonial` ADD CONSTRAINT `Testimonial_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
