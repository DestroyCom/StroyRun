/*
  Warnings:

  - Added the required column `doesUsersReady` to the `Lobby` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_LobbyToPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LobbyToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Lobby" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LobbyToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lobby" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doesUsersReady" BOOLEAN NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "_LobbyToPlayer_AB_unique" ON "_LobbyToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_LobbyToPlayer_B_index" ON "_LobbyToPlayer"("B");
