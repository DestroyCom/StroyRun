import { Buffer } from "buffer";
import { PacketPayload } from "src/types";
const separator = ":|:";

//Format of packet: ID:action:playerID:LobbyID:data\n
export function createPacket(payload: PacketPayload) {
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

export function decodePacket(
  packet: string,
  ipAdress: string,
  port: number
): PacketPayload {
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

  // console.log("parts4", parts[4]);

  return payload;
}
