// Proxy UCDP pour eviter les erreurs CORS cote front.
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

// On ne garde que process.env, on supprime le token en clair !
const TOKEN_UCDP = "c74695bee75a6ab2";

if (!TOKEN_UCDP) {
  console.error(
    "ERREUR: Le token UCDP_TOKEN est manquant dans le fichier .env",
  );
  process.exit(1); // Arrête le serveur si le token n'est pas trouvé
}

app.use(cors());

/**
 * Effectue une requete UCDP avec un parametre pays.
 * @param {string} valeurPays
 * @returns {Promise<import("node-fetch").Response>}
 */
const essayerRequete = async (valeurPays) => {
  const url = `https://ucdpapi.pcr.uu.se/api/gedevents/25.1?pagesize=1&country=${encodeURIComponent(
    valeurPays,
  )}`;

  const response = await fetch(url, {
    headers: {
      "x-ucdp-access-token": TOKEN_UCDP,
      Accept: "application/json",
    },
  });

  return response;
};

/**
 * Proxy UCDP avec fallback code ISO3 puis nom.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
app.get("/api/ucdp", async (req, res) => {
  const code = req.query.code || "";
  const nom = req.query.nom || "";

  try {
    let response = null;

    if (code) {
      response = await essayerRequete(code);
    }

    if ((!response || !response.ok) && nom) {
      response = await essayerRequete(nom);
    }

    if (!response || !response.ok) {
      return res.status(response?.status || 400).json({ error: "Erreur UCDP" });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy UCDP demarre sur http://localhost:${PORT}`);
});
