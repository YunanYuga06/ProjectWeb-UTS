/*
  Warnings:

  - You are about to drop the column `authorName` on the `testimonial` table. All the data in the column will be lost.
  - You are about to drop the column `authorRole` on the `testimonial` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Testimonial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `destination` MODIFY `longDescription` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `testimonial` DROP COLUMN `authorName`,
    DROP COLUMN `authorRole`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Testimonial` ADD CONSTRAINT `Testimonial_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
