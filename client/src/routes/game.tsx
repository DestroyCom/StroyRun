import { createFileRoute } from "@tanstack/react-router";
import { Game } from "../pages/Game";

type Search = {
  LobbyID: string;
};

export const Route = createFileRoute("/game")({
  validateSearch: (search: Record<string, unknown>): Search => {
    return {
      LobbyID: search.LobbyID as string,
    };
  },
  component: Game,
});
