/*
  Warnings:

  - You are about to drop the column `label` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "label",
ADD COLUMN     "labelId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;
