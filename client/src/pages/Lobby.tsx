import { useNavigate, useSearch } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { createPacket, decodePacket } from "../utils/packets";

export const Lobby = () => {
  const navigate = useNavigate();
  const { LobbyID, playerData } = useSearch({
    from: "/lobby",
  });

  console.log("LobbyID:", LobbyID);

  const loggedUsername = localStorage.getItem("stroyrun:username");

  const [playerStatus, setPlayerStatus] = useState({
    player1: {
      status: "Waiting",
      username: loggedUsername,
    },
    player2: {
      status: "Waiting",
      username:
        playerData?.find((player: any) => player.username !== loggedUsername)
          ?.username || "En attente de l'autre joueur",
    },
  });

  useEffect(() => {
    let lobbyJoinListener: any;
    (async () => {
      console.log("Démarrage de l'écoute des messages UDP...");
      try {
        lobbyJoinListener = await listen<string>("udp-message", (event) => {
          const packet = event.payload;
          // console.log("UDP message reçu brut:", packet);
          const decodedPacket = decodePacket(packet, "", 0);
          // console.log("UDP message reçu decoded:", decodedPacket);

          if (
            decodedPacket.ID === "StroyRun" &&
            (decodedPacket.action === "Ready" ||
              decodedPacket.action === "JoinLobby" ||
              decodedPacket.action === "WaitingInLobby")
          ) {
            const data = decodedPacket.data?.players;

            if (!data) {
              return;
            }

            // console.log("players", data);

            if (data) {
              const loggedPlayer = data.find(
                (player: any) => player.username === loggedUsername
              );
              const otherPlayer = data.find(
                (player: any) => player.username !== loggedUsername
              );

              if (!loggedPlayer || !otherPlayer) {
                return;
              }

              setPlayerStatus({
                player1: {
                  status: loggedPlayer.isReady ? "Ready" : "Waiting",
                  username: loggedUsername,
                },
                player2: {
                  status: otherPlayer.isReady ? "Ready" : "Waiting",
                  username: otherPlayer.username,
                },
              });

              // console.log("prebuilduserstauts", {
              //   player1: {
              //     status: loggedPlayer.isReady ? "Ready" : "Waiting",
              //     username: loggedUsername,
              //   },
              //   player2: {
              //     status: otherPlayer.isReady ? "Ready" : "Waiting",
              //     username: otherPlayer.username,
              //   },
              // });

              // console.log("playerStatus", playerStatus);
            }
          } else if (
            decodedPacket.ID === "StroyRun" &&
            decodedPacket.action === "Start"
          ) {
            navigate({
              to: "/game",
              search: {
                LobbyID: decodedPacket.LobbyID,
                loggedUsername: "",
              },
            });
          }
        });
        console.log("Écoute UDP établie avec succès");
      } catch (error) {
        console.error("Erreur lors de l'établissement de l'écoute UDP:", error);
      }
    })();
    return () => {
      if (lobbyJoinListener) {
        console.log("Nettoyage de l'écoute UDP");
        lobbyJoinListener();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-6">
      <h1 className="text-2xl md:text-6xl font-bold text-center text-purple-800 drop-shadow-sm">
        Waiting for players in lobby <br />
        <span className="text-xl">{LobbyID}</span>
      </h1>

      <div className="flex-1 flex items-center justify-center w-full flex-col">
        <p className="text-xl font-semibold text-center text-purple-800 drop-shadow-sm">
          {playerStatus.player1.username} - {playerStatus.player1.status}
        </p>

        <p className="text-xl font-semibold text-center text-purple-800 drop-shadow-sm">
          {playerStatus.player2.username} - {playerStatus.player2.status}
        </p>
      </div>

      <button
        className="px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={async () => {
          if (playerStatus.player1.status === "Ready") {
            return;
          }

          if (!loggedUsername) {
            return;
          }
          const packet = createPacket({
            ID: "StroyRun",
            action: "Ready",
            playerID: loggedUsername,
            LobbyID: LobbyID,
            data: {},
            context: {
              senderIp: "",
              senderPort: 0,
              receiverIp: "",
              receiverPort: 0,
            },
          });

          invoke<string>("send_udp_message", {
            message: packet,
          });
        }}
      >
        {playerStatus.player1.status === "Ready"
          ? "Waiting player 2..."
          : "Ready ?"}
      </button>
    </div>
  );
};
