import { PrismaClient } from "@prisma/client";
import { HOST, PORT } from "..";
import { createLobby, joinLobby } from "./lobby/manage";
import { sendPacket } from "./packets/send";
import { PacketPayload } from "./types";

const prisma = new PrismaClient();

export async function interpretAction(payload: PacketPayload) {
  switch (payload.action) {
    case "CreateLobby":
      const createdLobby = await createLobby(payload);
      await sendPacket({
        ID: "StroyRun",
        action: "WaitingInLobby",
        playerID: payload.playerID,
        LobbyID: createdLobby.id,
        data: {},
        context: {
          senderIp: HOST,
          senderPort: PORT,
          receiverIp: payload.context.senderIp,
          receiverPort: payload.context.senderPort,
        },
      });
      return;
    case "JoinLobby":
      const joinedLobby = await joinLobby(payload);

      if (!joinedLobby) {
        return;
      }

      await sendPacket({
        ID: "StroyRun",
        action: "WaitingInLobby",
        playerID: payload.playerID,
        LobbyID: joinedLobby.id,
        data: {},
        context: {
          senderIp: HOST,
          senderPort: PORT,
          receiverIp: payload.context.senderIp,
          receiverPort: payload.context.senderPort,
        },
      });

      return;
    case "Ready":
      await prisma.lobby.update({
        where: {
          id: payload.LobbyID,
        },
        data: {
          readyUsers: {
            connect: {
              username: payload.playerID,
            },
          },
        },
      });

      const lobby = await prisma.lobby.findUnique({
        where: {
          id: payload.LobbyID,
        },
        include: {
          _count: {
            select: { readyUsers: true },
          },
        },
      });

      if (lobby?._count?.readyUsers === 2) {
        const players = await prisma.player.findMany({
          where: { lobbies: { some: { id: payload.LobbyID } } },
        });
        //Send packet to start the game to the two players
        for (const player of players) {
          await sendPacket({
            ID: "StroyRun",
            action: "Start",
            playerID: player.username,
            LobbyID: payload.LobbyID,
            data: {},
            context: {
              senderIp: HOST,
              senderPort: PORT,
              receiverIp: player.ipAdress,
              receiverPort: player.port,
            },
          });
        }
      } else {
        await sendPacket({
          ID: "StroyRun",
          action: "Ready",
          playerID: payload.playerID,
          LobbyID: payload.LobbyID,
          data: {
            isReady: [
              {
                username: payload.playerID,
              },
            ],
          },
          context: {
            senderIp: HOST,
            senderPort: PORT,
            receiverIp: payload.context.senderIp,
            receiverPort: payload.context.senderPort,
          },
        });
      }

      return;
    default:
      await sendPacket({
        ID: "StroyRun",
        action: "NACK",
        playerID: payload.playerID,
        LobbyID: payload.LobbyID,
        data: {
          error: "Invalid action",
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
}
