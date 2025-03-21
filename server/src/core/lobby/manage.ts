import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { PacketPayload } from "../types";
import { HOST, PORT, server } from "../..";
import { createPacket } from "../packets/create";
import { sendPacket } from "../packets/send";

const prisma = new PrismaClient();

export async function createLobby(payload: PacketPayload) {
  const playerUsername = payload.playerID;

  const lobbyId = uuidv4();

  let checkIfPlayerExists = await prisma.player.findUnique({
    where: {
      username: playerUsername,
    },
  });

  if (!checkIfPlayerExists) {
    checkIfPlayerExists = await prisma.player.create({
      data: {
        username: playerUsername || uuidv4(),
        ipAdress: payload.context.senderIp,
        port: payload.context.senderPort,
        wins: 0,
        matchesPlayed: 0,
        winRate: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  const newLobby = await prisma.lobby.create({
    data: {
      id: lobbyId,
      players: {
        connect: {
          username: checkIfPlayerExists.username,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return newLobby;
}

export async function joinLobby(payload: PacketPayload) {
  const lobbyId = payload.LobbyID;
  const playerUsername = payload.playerID;

  if (!lobbyId) {
    console.error("No lobby ID provided");
    await createPacket({
      ID: "StroyRun",
      action: "NACK",
      playerID: payload.playerID,
      LobbyID: payload.LobbyID,
      data: {
        error: "No lobby ID provided",
      },
      context: {
        senderIp: HOST,
        senderPort: PORT,
        receiverIp: payload.context.senderIp,
        receiverPort: payload.context.senderPort,
      },
    });
    await sendPacket({
      ID: "StroyRun",
      action: "NACK",
      playerID: payload.playerID,
      LobbyID: payload.LobbyID,
      data: {
        error: "No lobby ID provided",
      },
      context: {
        senderIp: HOST,
        senderPort: PORT,
        receiverIp: payload.context.senderIp,
        receiverPort: payload.context.senderPort,
      },
    });
    return;
  }

  const checkIfLobbyExists = await prisma.lobby.findUnique({
    where: {
      id: lobbyId,
    },
  });

  if (!checkIfLobbyExists) {
    console.error("Lobby does not exist");
    await sendPacket({
      ID: "StroyRun",
      action: "NACK",
      playerID: payload.playerID,
      LobbyID: payload.LobbyID,
      data: {
        error: "Lobby does not exist",
      },
      context: {
        senderIp: HOST,
        senderPort: PORT,
        receiverIp: payload.context.senderIp,
        receiverPort: payload.context.senderPort,
      },
    });
    return;
  }

  let checkIfPlayerExists = await prisma.player.findUnique({
    where: {
      username: playerUsername,
    },
  });

  if (!checkIfPlayerExists) {
    checkIfPlayerExists = await prisma.player.create({
      data: {
        username: playerUsername || uuidv4(),
        ipAdress: payload.context.senderIp,
        port: payload.context.senderPort,
        wins: 0,
        matchesPlayed: 0,
        winRate: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  const lobby = await prisma.lobby.update({
    where: {
      id: lobbyId,
    },
    data: {
      players: {
        connect: {
          username: checkIfPlayerExists.username,
        },
      },
    },
    include: {
      players: true,
      readyUsers: true,
      winner: true,
    },
  });

  return lobby;
}
