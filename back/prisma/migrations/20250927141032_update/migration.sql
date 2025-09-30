/*
  Warnings:

  - The `movies` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `series` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "movies",
ADD COLUMN     "movies" INTEGER[],
DROP COLUMN "series",
ADD COLUMN     "series" INTEGER[];
