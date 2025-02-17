const express = require('express');
const axios = require('axios');
const cors=require('cors');
const app = express();
const port = 80;

// Middleware pour parser le JSON
app.use(express.json());
app.use(cors());
// Adresse IP de l'ESP32 (à modifier selon votre configuration)
const esp32IP = "192.168.43.142";

// Fonction pour envoyer une requête POST à l'ESP32
async function sendCommandToESP32(command) {
    try {
        const response = await axios.post(`http://192.168.43.142/esp`, {
            message: command,
        });

        console.log("Réponse de l'ESP32 :", response.data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'envoi à l'ESP32 :", error.message);
        throw new Error("Erreur de communication avec l'ESP32.");
    }
}

// Route pour recevoir la requête du client 1 et envoyer une commande à l'ESP32
app.post("/send", async (req, res) => {
    var clientMessage = req.body.message; // Extraction du message du client
    console.log(req.body);
    
    console.log("Message reçu du client 1 :", clientMessage);
    if (clientMessage === "allume") {
        try {
            const espResponse = await sendCommandToESP32(clientMessage); // Envoi de la commande à l'ESP32
            res.json({ status: "Commande envoyée", espResponse });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } 
    else if (clientMessage === "enteint") {
        try {
            const espResponse = await sendCommandToESP32(clientMessage); // Envoi de la commande à l'ESP32
            res.json({ status: "Commande enteint", espResponse });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } 
    else {
        res.status(400).json({ error: "Commande non reconnue" });
    }
});
 
// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
