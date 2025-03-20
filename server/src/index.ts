import * as dgram from "dgram";
import { decodePacket } from "./core/packets/handle";
import { interpretAction } from "./core/handleActions";
import { sendPacket } from "./core/packets/send";
export const server = dgram.createSocket("udp4");

export const PORT = 12345;
export const HOST = "0.0.0.0";
export const CLIENT_PORT = 9999;

server.on("listening", () => {
  const address = server.address();
  console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

server.on("message", async (message: string, remote: any) => {
  console.log(`Reçu de ${remote.address}:${remote.port} -> ${message}`);

  const decodedMessage = await decodePacket(
    message.toString(),
    remote.address,
    remote.port
  );
  console.log("Message décodé:", decodedMessage);

  if (decodedMessage.ID !== "StroyRun") {
    console.error("ID de paquet invalide");
    await sendPacket({
      ID: "StroyRun",
      action: "NACK",
      playerID: decodedMessage.playerID,
      LobbyID: decodedMessage.LobbyID,
      data: {
        error: "ID de paquet invalide",
      },
      context: {
        senderIp: HOST,
        senderPort: PORT,
        receiverIp: remote.address,
        receiverPort: CLIENT_PORT,
      },
    });

    return;
  }

  await interpretAction(decodedMessage);

  return;
});

server.bind(PORT, HOST, () => {
  console.log(`Serveur UDP démarré sur ${HOST}:${PORT}`);
});
