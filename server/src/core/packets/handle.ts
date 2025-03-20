import { Buffer } from "buffer";
import { PacketPayload } from "../types";
import { separator } from "./create";

//Format of packet: ID:action:playerID:LobbyID:data\n
export async function decodePacket(
  packet: string,
  ipAdress: string,
  port: number
): Promise<PacketPayload> {
  // Decode the packet from ascii
  const decodedPacket = Buffer.from(packet, "ascii").toString("utf-8");

  // Split the packet into parts
  const parts = decodedPacket.split(separator);

  // Create a new payload object
  const payload: PacketPayload = {
    ID: parts[0] as PacketPayload["ID"],
    action: parts[1] as PacketPayload["action"],
    playerID: parts[2] || "null",
    LobbyID: parts[3] || "null",
    context: {
      senderIp: ipAdress,
      senderPort: port,
      receiverIp: "",
      receiverPort: 12345,
    },
  };

  if (parts[4]) {
    try {
      payload.data = JSON.parse(parts[4]);
    } catch (e) {
      console.error("Erreur lors du parsing JSON:", e);
    }
  }

  return payload;
}
