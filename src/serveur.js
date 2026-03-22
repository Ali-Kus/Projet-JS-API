// Assure-toi d'installer express et cors : npm install express cors
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Autorise ton front-end à communiquer avec ce serveur
app.use(cors());

app.get('/', (req, res) => {
    res.send('Proxy actif. Utilise /api/proxy/events');
});

app.get('/api/proxy/events', async (req, res) => {
    const url = "https://ucdpapi.pcr.uu.se/api/gedevents/25.1?pagesize=1";
    const token = "c74695bee75a6ab2"; // Ton vrai token ici

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-ucdp-access-token': token,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "Erreur de l'API UCDP" });
        }

        const data = await response.json();
        res.json(data); // Renvoie les données au front-end
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur proxy démarré sur http://localhost:${PORT}`);
});