-- CreateTable
CREATE TABLE "Player" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "wins" INTEGER NOT NULL,
    "matchesPlayed" INTEGER NOT NULL,
    "winRate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lobby" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lobby_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player" ("username") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_LobbyPlayers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LobbyPlayers_A_fkey" FOREIGN KEY ("A") REFERENCES "Lobby" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LobbyPlayers_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_LobbyPlayers_AB_unique" ON "_LobbyPlayers"("A", "B");

-- CreateIndex
CREATE INDEX "_LobbyPlayers_B_index" ON "_LobbyPlayers"("B");
