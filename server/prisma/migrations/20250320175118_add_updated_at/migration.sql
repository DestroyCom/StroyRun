/*
  Warnings:

  - The primary key for the `Lobby` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updatedAt` to the `Lobby` table without a default value. This is not possible if the table is not empty.

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
INSERT INTO "new_Lobby" ("createdAt", "id", "winnerId") SELECT "createdAt", "id", "winnerId" FROM "Lobby";
DROP TABLE "Lobby";
ALTER TABLE "new_Lobby" RENAME TO "Lobby";
CREATE TABLE "new__LobbyPlayers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LobbyPlayers_A_fkey" FOREIGN KEY ("A") REFERENCES "Lobby" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LobbyPlayers_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__LobbyPlayers" ("A", "B") SELECT "A", "B" FROM "_LobbyPlayers";
DROP TABLE "_LobbyPlayers";
ALTER TABLE "new__LobbyPlayers" RENAME TO "_LobbyPlayers";
CREATE UNIQUE INDEX "_LobbyPlayers_AB_unique" ON "_LobbyPlayers"("A", "B");
CREATE INDEX "_LobbyPlayers_B_index" ON "_LobbyPlayers"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
