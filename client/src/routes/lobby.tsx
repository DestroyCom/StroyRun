import { createFileRoute } from "@tanstack/react-router";
import { Lobby } from "../pages/Lobby";
import { PacketPayload } from "src/types";

type Search = {
  LobbyID: string;
  playerData: NonNullable<PacketPayload["data"]>["players"];
};

export const Route = createFileRoute("/lobby")({
  validateSearch: (search: Record<string, unknown>): Search => {
    return {
      LobbyID: search.LobbyID as string,
      playerData: search.playerData as NonNullable<
        PacketPayload["data"]
      >["players"],
    };
  },
  component: Lobby,
});
