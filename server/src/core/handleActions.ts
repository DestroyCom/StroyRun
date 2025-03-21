import { PrismaClient } from "@prisma/client";
import { HOST, PORT } from "..";
import { createLobby, joinLobby } from "./lobby/manage";
import { sendPacket } from "./packets/send";
import { PacketPayload } from "./types";
import { createPacket } from "./packets/create";

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
        data: {
          players: [
            {
              username: payload.playerID,
              isReady: false,
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
      return;
    case "JoinLobby":
      const joinedLobby = await joinLobby(payload);

      if (!joinedLobby) {
        return;
      }

      const players = await prisma.player.findMany({
        where: { lobbies: { some: { id: payload.LobbyID } } },
      });

      for (const player of players) {
        const currentPlayer = players.find(
          (player) => player.username === payload.playerID
        );
        const otherPlayer = players.find(
          (player) => player.username !== payload.playerID
        );
        const currentPlayerIsReady = joinedLobby.readyUsers.find(
          (user) => user.username === currentPlayer?.username
        );
        const otherPlayerIsReady = joinedLobby.readyUsers.find(
          (user) => user.username === otherPlayer?.username
        );

        await sendPacket({
          ID: "StroyRun",
          action: "WaitingInLobby",
          playerID: payload.playerID,
          LobbyID: joinedLobby.id,
          data: {
            players: [
              {
                username: currentPlayer?.username ?? "",
                isReady: currentPlayerIsReady ? true : false,
              },
              {
                username: otherPlayer?.username ?? "",
                isReady: otherPlayerIsReady ? true : false,
              },
            ],
          },
          context: {
            senderIp: HOST,
            senderPort: PORT,
            receiverIp: player.ipAdress,
            receiverPort: player.port,
          },
        });
      }

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
            data: {
              players: [
                {
                  username: players[0].username,
                  isReady: true,
                },
                {
                  username: players[1].username,
                  isReady: true,
                },
              ],
            },
            context: {
              senderIp: HOST,
              senderPort: PORT,
              receiverIp: player.ipAdress,
              receiverPort: player.port,
            },
          });
        }
      } else {
        const players = await prisma.player.findMany({
          where: { lobbies: { some: { id: payload.LobbyID } } },
        });
        //Send packet to start the game to the two players
        for (const player of players) {
          const otherPlayer = players.find(
            (player) => player.username !== payload.playerID
          );

          await sendPacket({
            ID: "StroyRun",
            action: "Ready",
            playerID: payload.playerID,
            LobbyID: payload.LobbyID,
            data: {
              players: [
                {
                  username: payload.playerID,
                  isReady: true,
                },
                {
                  username: otherPlayer?.username ?? "",
                  isReady: false,
                },
              ],
            },
            context: {
              senderIp: HOST,
              senderPort: PORT,
              receiverIp: player.ipAdress,
              receiverPort: player.port,
            },
          });
        }
      }

      return;
    case "StarterTiming":
      console.log("StarterTiming");

      //Check if two player are on screen, if it is send "StarterTiming" to the two players
      const getLobby = await prisma.lobby.findUnique({
        where: {
          id: payload.LobbyID,
        },
        include: {
          players: true,
        },
      });

      const playersOnScreeen = getLobby?.playersOnScreen;
      if (playersOnScreeen === 2) {
        const players = await prisma.player.findMany({
          where: { lobbies: { some: { id: payload.LobbyID } } },
        });

        for (const player of players) {
          await sendPacket({
            ID: "StroyRun",
            action: "StarterTiming",
            playerID: player.username,
            LobbyID: payload.LobbyID,
            data: {
              countdown: "3",
              phraseToType: "The brown fox jumps over the lazy dog",
            },
            context: {
              senderIp: HOST,
              senderPort: PORT,
              receiverIp: player.ipAdress,
              receiverPort: player.port,
            },
          });
        }

        let continueWhile = true;
        do {
          //await new Promise((resolve) => setTimeout(resolve, 1000));
          const lobby = await prisma.lobby.findUnique({
            where: {
              id: payload.LobbyID,
            },
            include: {
              players: true,
            },
          });

          if (!lobby?.players) {
            //continueWhile = false;
            return;
          }

          for (const player of lobby.players) {
            let playersObject = {};
            for (const player of lobby.players) {
              playersObject[player.username] = {
                percentage: player.currentGamePercentage,
                isWinner: lobby.winnerId === player.username,
                startingTime: new Date(),
                endingTime: new Date(),
              };
            }

            await sendPacket({
              ID: "StroyRun",
              action: "GameState",
              playerID: player.username,
              LobbyID: payload.LobbyID,
              data: {
                game: {
                  players: playersObject,
                  context: {
                    countdownStart: new Date(),
                    countdownEnd: new Date(),
                  },
                },
              },
              context: {
                senderIp: HOST,
                senderPort: PORT,
                receiverIp: player.ipAdress,
                receiverPort: player.port,
              },
            });
          }

          if (lobby.winnerId !== null) {
            continueWhile = false;
          }

          //Timeout
          await new Promise((resolve) => setTimeout(resolve, 500));
        } while (continueWhile);
      } else {
        await prisma.lobby.update({
          where: {
            id: payload.LobbyID,
          },
          data: {
            playersOnScreen: (playersOnScreeen ?? 0) + 1,
          },
        });
      }
      return;
    case "PlayerState":
      await prisma.player.update({
        where: {
          username: payload.playerID,
        },
        data: {
          currentGamePercentage: payload.data?.personalProgress ?? 0,
        },
      });

      //If gamepercentage is 100% send "End" to the two players
      if (payload.data?.personalProgress === 100) {
        const lobby = await prisma.lobby.update({
          where: {
            id: payload.LobbyID,
          },
          data: {
            winnerId: payload.playerID,
          },
          include: {
            players: true,
          },
        });

        for (const player of lobby.players) {
          await sendPacket({
            ID: "StroyRun",
            action: "End",
            playerID: player.username,
            LobbyID: payload.LobbyID,
            data: {
              winnerId: payload.playerID,
            },
            context: {
              senderIp: HOST,
              senderPort: PORT,
              receiverIp: player.ipAdress,
              receiverPort: player.port,
            },
          });
        }
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
