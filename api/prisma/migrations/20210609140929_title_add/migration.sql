/*
  Warnings:

  - You are about to drop the column `name` on the `Label` table. All the data in the column will be lost.
  - Added the required column `title` to the `Label` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Label" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;
