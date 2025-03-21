#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{net::UdpSocket, thread, time::Duration};
use tauri::{AppHandle, Manager, Emitter};

#[tauri::command]
fn send_udp_message(message: String) -> Result<String, String> {
    let game_server_addr = "192.168.34.114";
    let game_server_port = 12345;

    let socket = UdpSocket::bind("0.0.0.0:0")
        .map_err(|e| format!("Impossible de binder le socket UDP local: {}", e))?;
    let server_addr = format!("{}:{}", game_server_addr, game_server_port);
    
     socket
        .set_read_timeout(Some(Duration::from_millis(200)))
        .map_err(|e| format!("Impossible de configurer le timeout: {}", e))?;
    
    socket
        .send_to(message.as_bytes(), server_addr)
        .map_err(|e| format!("Erreur lors de l'envoi: {}", e))?;
    
    let mut buf = [0u8; 1024];
    match socket.recv_from(&mut buf) {
        Ok((received_len, src)) => {
            let response = String::from_utf8_lossy(&buf[..received_len]).to_string();
            Ok(format!("Réponse reçue depuis {} -> {}", src, response))
        }
        Err(e) => Err(format!("Aucune réponse reçue ou erreur: {}", e)),
    }
}

fn start_udp_listener(app_handle: AppHandle) -> thread::JoinHandle<()> {
    thread::spawn(move || {
        let listener_socket = UdpSocket::bind("0.0.0.0:9999")
            .expect("Impossible de binder le socket d'écoute sur le port 9999");
        
         listener_socket
             .set_read_timeout(Some(Duration::from_millis(200)))
             .ok();

        let mut buf = [0u8; 1024];
        loop {
            match listener_socket.recv_from(&mut buf) {
                Ok((received_bytes, src_addr)) => {
                    let msg = String::from_utf8_lossy(&buf[..received_bytes]).to_string();
                    println!("[UDP Listener] Reçu de {} -> {}", src_addr, msg);
                    
                    // Récupère la fenêtre principale (label "main")
                    let window = app_handle.get_webview_window("main").unwrap();
                    window.emit("udp-message", Some(msg.clone())).unwrap_or_else(|e| {
                        eprintln!("Erreur lors de l'émission de l'événement udp-message: {}", e);
                    });
                    println!("Événement udp-message émis avec succès: {}", msg);
                }
                Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    // Timeout atteint, aucun paquet reçu dans ce laps de temps
                }
                Err(e) => eprintln!("Erreur de réception UDP: {}", e),
            }
            // Petite pause pour éviter un spin loop à 200% CPU
            thread::sleep(Duration::from_millis(200));
        }
    })
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Cloner l'AppHandle pour le passer au thread
            let handle_clone = app.handle().clone();
            start_udp_listener(handle_clone);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![send_udp_message])
        .run(tauri::generate_context!())
        .expect("Erreur au lancement de l'application Tauri");
}
