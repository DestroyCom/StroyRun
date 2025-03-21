export type PacketPayload = {
  ID: "StroyRun";
  action:
    | "CreateLobby"
    | "JoinLobby"
    | "WaitingInLobby"
    | "Ready"
    | "Start"
    | "Progress"
    | "PassFinishLine"
    | "End"
    | "ACK"
    | "NACK"
    | "error";
  playerID: string;
  LobbyID: string;
  data?: {
    percentageCompleted?: number;
    winnerId?: string;
    secondsElapsed?: number;
    error?: string;
    players?: {
      username: string;
      isReady: boolean;
    }[];
  };
  context: {
    senderIp: string;
    senderPort: number;
    receiverIp: string;
    receiverPort: number;
  };
};
