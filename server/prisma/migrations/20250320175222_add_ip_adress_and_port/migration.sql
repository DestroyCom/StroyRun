/*
  Warnings:

  - Added the required column `ipAdress` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `port` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "wins" INTEGER NOT NULL,
    "matchesPlayed" INTEGER NOT NULL,
    "winRate" REAL NOT NULL,
    "ipAdress" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Player" ("createdAt", "matchesPlayed", "updatedAt", "username", "winRate", "wins") SELECT "createdAt", "matchesPlayed", "updatedAt", "username", "winRate", "wins" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
