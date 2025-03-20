import { Buffer } from "buffer";
import { PacketPayload } from "../types";

export const separator = ":|:";

//Format of packet: ID:action:playerID:LobbyID:data\n
export async function createPacket(payload: PacketPayload) {
  let packet = `${payload.ID}${separator}${payload.action}`;

  // Add the playerID to the packet
  packet += `${separator}${payload.playerID || "null"}`;
  packet += `${separator}${payload.LobbyID || "null"}`;

  if (payload.data) {
    packet += `${separator}${JSON.stringify(payload.data)}`;
  }

  // Add a newline character to the end of the packet
  packet += "\n";

  //Encode the packet to ascii
  const encodedPacket = Buffer.from(packet).toString("ascii");

  return encodedPacket;
}
