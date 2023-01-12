/*
  Warnings:

  - You are about to drop the column `point` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `radius` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Address` DROP COLUMN `point`,
    DROP COLUMN `radius`;
