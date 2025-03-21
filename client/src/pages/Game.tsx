import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { createPacket, decodePacket } from "src/utils/packets";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useSearch } from "@tanstack/react-router";

export const Game = () => {
  const { LobbyID } = useSearch({
    from: "/lobby",
  });

  const [phraseToType, setPhraseToType] = useState("Awaiting phrase");
  const [currentPositionInPhrase, setCurrentPositionInPhrase] = useState(0);
  const [isFieldDisabled, setIsFieldDisabled] = useState(true);

  const loggedUsername = localStorage.getItem("stroyrun:username");

  const carOne = useRef<HTMLDivElement>(null);
  const carTwo = useRef<HTMLDivElement>(null);
  const tracOnekRef = useRef<HTMLDivElement>(null);
  const tracTwoRef = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const totalCharacters = phraseToType.length;

    const registerKeypress = (event: KeyboardEvent) => {
      if (isFieldDisabled) return;

      const key = event.key;
      const currentLetterWanted = phraseToType[currentPositionInPhrase];

      // Si la touche pressée est la bonne
      if (key === currentLetterWanted) {
        setCurrentPositionInPhrase((prev) => prev + 1);

        // EXEMPLE : on déplace le carOne en pourcentage
        const progress =
          ((currentPositionInPhrase + 1) / totalCharacters) * 100;
        if (carOne.current) {
          carOne.current.style.left = `${progress}%`;
        }

        if (!loggedUsername) return;

        const packet = createPacket({
          ID: "StroyRun",
          action: "PlayerState",
          playerID: loggedUsername,
          LobbyID: LobbyID,
          data: {
            personalProgress: progress,
          },
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
      }
    };

    window.addEventListener("keyup", registerKeypress);
    return () => {
      window.removeEventListener("keyup", registerKeypress);
    };
  }, [currentPositionInPhrase, phraseToType]);

  useEffect(() => {
    if (tracOnekRef.current && carOne.current) {
      const totalCharacters = phraseToType.length;
      const ratio = currentPositionInPhrase / totalCharacters;

      // Largeur piste
      const trackWidth = tracOnekRef.current.offsetWidth;
      // Largeur voiture
      const carWidth = carOne.current.offsetWidth;
      // Convertir la largeur de la voiture en pourcentage
      const carWidthPercent = (carWidth / trackWidth) * 100;
      // La position maximale qu’on veut atteindre en % (pour que la voiture ne sorte pas)
      const maxLeftPercent = 100 - carWidthPercent;

      // On positionne la voiture
      const newLeftPercent = ratio * maxLeftPercent;
      carOne.current.style.left = `${newLeftPercent}%`;
    }
  }, [currentPositionInPhrase]);

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

          //Do nothing if not our packet
          if (decodedPacket.ID !== "StroyRun") return;

          if (decodedPacket.action === "StarterTiming") {
            if (phraseToType === "Awaiting phrase") {
              setPhraseToType(decodedPacket.data?.phraseToType || "");
            }

            setTimeout(() => {
              if (!counter.current) return;

              const previousCount = counter.current?.innerText;
              if (previousCount === "3") {
                counter.current.innerText = "2";
              } else if (previousCount === "2") {
                counter.current.innerText = "1";
              } else if (previousCount === "1") {
                counter.current.innerText = "GO!";
              } else if (previousCount === "GO!") {
                setIsFieldDisabled(false);
                counter.current.innerText = "";
              } else {
                counter.current.innerText = "3";
              }
            }, 1000);
          }

          if (decodedPacket.action === "GameState") {
            const data = decodedPacket?.data?.game;
            if (!data) {
              return;
            }

            const playerOneProgress = data[loggedUsername].percentage;
            const otherPlayerId = Object.keys(data).find(
              (key) => key !== loggedUsername
            );
            const playerTwoProgress = data[otherPlayerId].percentage;

            if (carOne.current) {
              carOne.current.style.left = `${playerOneProgress}%`;
            }
            if (carTwo.current) {
              carTwo.current.style.left = `${playerTwoProgress}%`;
            }
          }

          if (decodedPacket.action === "End") {
            const data = decodedPacket.data;
            if (!data) {
              return;
            }

            const winnerId = data.winnerId;
            if (winnerId === decodedPacket.playerID) {
              console.log("You won!");
              alert(`Winner is ${winnerId}`);
            } else {
              console.log("You lost!");
            }
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
      <div className="flex items-center justify-center w-full flex-col border-2 border-black rounded-2xl p-6 gap-y-4">
        <div
          id="track-1"
          className="flex items-center justify-center w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 relative"
          ref={tracOnekRef}
        >
          <div
            className="w-17 h-12 bg-white rounded-2xl absolute left-0"
            ref={carOne}
          ></div>
        </div>
        <div
          id="track-2"
          className="flex items-center justify-center w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 relative"
          ref={tracTwoRef}
        >
          <div
            className="w-17 h-12 bg-white rounded-2xl absolute left-0"
            ref={carTwo}
          ></div>
        </div>
      </div>

      <div
        id="counter"
        className="text-xl font-semibold text-center text-purple-800 drop-shadow-sm"
      >
        <span ref={counter}></span>
      </div>

      <div
        id="typing-area"
        className="flex items-center justify-center w-full min-h-[45vh] border-2 border-black rounded-2xl p-6"
      >
        <p className="text-2xl font-semibold text-center text-purple-800 drop-shadow-sm">
          {phraseToType.split("").map((letter, index) => (
            <span
              key={index}
              className={clsx(
                index < currentPositionInPhrase
                  ? "text-purple-800"
                  : "text-gray-500",
                index === currentPositionInPhrase && "underline"
              )}
            >
              {letter}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};
