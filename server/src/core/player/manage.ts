import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createPlayer(
  username: string,
  ipAdress: string,
  port: number
) {
  const newPlayer = await prisma.player.create({
    data: {
      username,
      ipAdress,
      port,
      wins: 0,
      matchesPlayed: 0,
      winRate: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return newPlayer;
}
