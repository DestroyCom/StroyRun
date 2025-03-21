import { createFileRoute } from "@tanstack/react-router";
import { Game } from "../pages/Game";

type Search = {
  LobbyID: string;
  loggedUsername: string;
};

export const Route = createFileRoute("/game")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const loggedUsername = localStorage.getItem("stroyrun:username");

    return {
      LobbyID: search.LobbyID as string,
      loggedUsername: loggedUsername as string,
    };
  },
  component: Game,
});
