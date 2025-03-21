export type PacketPayload = {
  ID: "StroyRun";
  action:
    | "CreateLobby"
    | "JoinLobby"
    | "WaitingInLobby"
    | "Ready"
    | "Start"
    | "StarterTiming"
    | "GameState"
    | "PlayerState"
    | "End"
    | "ACK"
    | "NACK"
    | "error";
  playerID: string;
  LobbyID: string;
  data?: {
    percentageCompleted?: number;
    phraseToType?: string;
    winnerId?: string;
    secondsElapsed?: number;
    error?: string;
    countdown?: string;
    personalProgress?: number;
    players?: {
      username: string;
      isReady: boolean;
      playerOnePercentage?: number;
      playerTwoPercentage?: number;
      playerOneStartingTime?: Date;
      playerOneEndingTime?: Date;
      playerTwoStartingTime?: Date;
      playerTwoEndingTime?: Date;
    }[];
    game?: {
      players: {
        [key: string]: {
          percentage: number;
          isWinner: boolean;
          startingTime: Date;
          endingTime: Date;
        };
      };
      context: {
        countdownStart: Date;
        countdownEnd: Date;
      };
    };
  };
  context: {
    senderIp: string;
    senderPort: number;
    receiverIp: string;
    receiverPort: number;
  };
};
