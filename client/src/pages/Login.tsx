import { useNavigate } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { createPacket, decodePacket } from "../utils/packets";

export const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let lobbyJoinListener: any;
    (async () => {
      console.log("Démarrage de l'écoute des messages UDP...");
      try {
        lobbyJoinListener = await listen<string>("udp-message", (event) => {
          const packet = event.payload;
          console.log("UDP message reçu brut:", packet);
          const decodedPacket = decodePacket(packet, "", 0);
          console.log("UDP message reçu decoded:", decodedPacket);

          if (
            decodedPacket.ID === "StroyRun" &&
            (decodedPacket.action === "WaitingInLobby" ||
              decodedPacket.action === "JoinLobby")
          ) {
            console.log("decodedPacket", decodedPacket);
            navigate({
              to: "/lobby",
              search: { LobbyID: decodedPacket.LobbyID },
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
      <form
        className="flex-1 flex items-center justify-center w-full flex-col"
        onSubmit={(e) => {
          e.preventDefault();

          console.log("create lobby");

          const form = e.target as HTMLFormElement;
          const username = (form.elements[0] as HTMLInputElement).value;
          localStorage.setItem("stroyrun:username", username);

          const packet = createPacket({
            ID: "StroyRun",
            action: "CreateLobby",
            playerID: username,
            LobbyID: "null",
            data: {},
            context: {
              senderIp: "",
              senderPort: 0,
              receiverIp: "",
              receiverPort: 0,
            },
          });

          console.log("sending packet", packet);

          invoke<string>("send_udp_message", {
            message: packet,
          });
        }}
      >
        <h1 className="text-2xl md:text-6xl font-bold text-center text-purple-800 drop-shadow-sm">
          Create a game
        </h1>
        <input
          type="text"
          className="border-2 border-purple-800 rounded-lg p-2 m-2"
          title="Username"
          placeholder="Your username"
        />
        <button className="px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          Create Lobby
        </button>
      </form>

      <div
        id="separator"
        className="flex-1 flex items-center justify-center w-full"
      >
        <p className="text-xl font-semibold text-center text-purple-800 drop-shadow-sm">
          Or
        </p>
      </div>

      <form
        className="flex-1 flex items-center justify-center w-full flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          console.log("join lobby");

          const form = e.target as HTMLFormElement;
          const username = (form.elements[0] as HTMLInputElement).value;
          const lobby = (form.elements[1] as HTMLInputElement).value;
          localStorage.setItem("stroyrun:username", username);

          const packet = createPacket({
            ID: "StroyRun",
            action: "JoinLobby",
            playerID: username,
            LobbyID: lobby,
            data: {},
            context: {
              senderIp: "",
              senderPort: 0,
              receiverIp: "",
              receiverPort: 0,
            },
          });

          console.log(packet);

          invoke<string>("send_udp_message", {
            message: packet,
          });
        }}
      >
        <h1 className="text-2xl md:text-6xl font-bold text-center text-purple-800 drop-shadow-sm">
          Join a game
        </h1>
        <input
          type="text"
          className="border-2 border-purple-800 rounded-lg p-2 m-2"
          title="Username"
          placeholder="Your username"
        />
        <input
          type="text"
          className="border-2 border-purple-800 rounded-lg p-2 m-2"
          title="lobby"
          placeholder="Lobby ID"
        />
        <button className="px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          Join Lobby
        </button>
      </form>
    </div>
  );
};
