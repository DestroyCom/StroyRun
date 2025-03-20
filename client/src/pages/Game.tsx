import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export const Game = () => {
  const phraseToType = "The quick brown fox jumps over the lazy dog";
  const [currentPositionInPhrase, setCurrentPositionInPhrase] = useState(0);

  const carOne = useRef<HTMLDivElement>(null);
  const carTwo = useRef<HTMLDivElement>(null);
  const tracOnekRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const totalCharacters = phraseToType.length;

    const registerKeypress = (event: KeyboardEvent) => {
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
        >
          <div
            className="w-17 h-12 bg-white rounded-2xl absolute left-0"
            ref={carTwo}
          ></div>
        </div>
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
