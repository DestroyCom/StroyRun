import { createFileRoute } from "@tanstack/react-router";
import { Lobby } from "../pages/Lobby";

type Search = {
  LobbyID: string;
};

export const Route = createFileRoute("/lobby")({
  validateSearch: (search: Record<string, unknown>): Search => {
    return {
      LobbyID: search.LobbyID as string,
    };
  },
  component: Lobby,
});
