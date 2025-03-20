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
    isReady?: [
      {
        username: string;
      },
    ];
  };
  context: {
    senderIp: string;
    senderPort: number;
    receiverIp: string;
    receiverPort: number;
  };
};
