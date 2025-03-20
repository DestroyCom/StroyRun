/*
  Warnings:

  - You are about to drop the column `doesUsersReady` on the `Lobby` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lobby" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lobby_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player" ("username") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lobby" ("createdAt", "id", "updatedAt", "winnerId") SELECT "createdAt", "id", "updatedAt", "winnerId" FROM "Lobby";
DROP TABLE "Lobby";
ALTER TABLE "new_Lobby" RENAME TO "Lobby";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
