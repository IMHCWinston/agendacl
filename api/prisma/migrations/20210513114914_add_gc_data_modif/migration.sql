/*
  Warnings:

  - Added the required column `dateCreated` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "dateCreated" TEXT NOT NULL,
ADD COLUMN     "courseWorkTitle" TEXT,
ADD COLUMN     "courseWorkDescription" TEXT;
