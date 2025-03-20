import { CLIENT_PORT, HOST, PORT, server } from "../..";
import { PacketPayload } from "../types";
import { createPacket } from "./create";

export async function sendPacket(payload: PacketPayload) {
  server.send(
    await createPacket(payload),
    CLIENT_PORT,
    payload.context.receiverIp,
    (err) => {
      if (err) {
        console.error("Erreur lors de l'envoi de la réponse:", err);
      } else {
        console.log(`Réponse envoyée à ${payload.context.receiverIp}:${PORT}`);
      }
    }
  );
}
