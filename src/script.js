async function fetchEvents() {
  const resultContainer = document.getElementById("result");
  resultContainer.textContent = "Chargement en cours...";

  // On appelle désormais notre proxy local
  const url = "http://localhost:3000/api/proxy/events";

  try {
    // Plus besoin de passer le token ici, le proxy s'en charge !
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();
    resultContainer.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    resultContainer.textContent = `Erreur lors de l'appel API : ${error.message}`;
  }
}
// 1. La fonction dédiée à l'appel API
// Elle prend le nom du pays en paramètre et gère toute la requête
async function rechercherDonneesPays(nomPays) {
  try {
    console.log(`Recherche en cours pour : ${nomPays}...`);

    const reponse = await fetch(
      `https://restcountries.com/v3.1/name/${nomPays}`,
    );

    if (!reponse.ok) {
      throw new Error(`Pays introuvable (Erreur ${reponse.status})`);
    }

    const donnees = await reponse.json();
    const pays = donnees[0]; // On prend le premier résultat

    console.log("Succès ! Voici les données :", pays);

    // On retourne les données pour pouvoir les utiliser ailleurs
    return pays;
  } catch (erreur) {
    console.error("Erreur lors de l'appel API :", erreur.message);
    // On peut retourner null pour indiquer que la recherche a échoué
    return null;
  }
}

// 2. On cible le formulaire
const formulaire = document.querySelector(".recherche-form");

if (!formulaire) {
  console.error("Formulaire .recherche-form introuvable dans le DOM.");
} else {
  // 3. L'écouteur d'événement (qui est maintenant beaucoup plus propre)
  formulaire.addEventListener("submit", async (event) => {
    event.preventDefault();

    const champTexte = formulaire.querySelector(".champ-texte");
    const paysSaisi = champTexte ? champTexte.value : "";

    // on verifit qu'elle n'est pas vide ou null
    if (!paysSaisi || paysSaisi.trim() === "") {
      console.warn("Veuillez saisir un nom de pays.");
      return;
    }

    // On appelle notre fonction en lui passant la saisie de l'utilisateur
    const resultatPays = await rechercherDonneesPays(paysSaisi);

    // Si la fonction a bien retourné des données, on peut les manipuler ici
    if (resultatPays) {
      console.log(
        `Le drapeau de ${resultatPays.name.common} est :`,
        resultatPays.flags.png,
      );
      // C'est ici qu'on appellera plus tard une autre fonction pour l'affichage
      Rendu(resultatPays);
    }
  });
}

function Rendu(pays) {
  const container = document.getElementById("resultat-pays");
  container.innerHTML = `
            <div class="div1 drapeau">
              <img src="${pays.flags.png}" alt="Drapeau de ${pays.name.common}" />
            </div>
            
          <div class="div2 information" >
          <p>${pays.name.common}</p>
          <p>Population : ${pays.population.toLocaleString()}</p>
          <p>Capitale : ${pays.capital ? pays.capital[0] : "Non disponible"}</p>
          <p>Région : ${pays.region}</p>
          <p>Langues : ${pays.languages ? Object.values(pays.languages).join(", ") : "Non disponible"}</p>
          <p>Monnaie : ${
            pays.currencies
              ? Object.values(pays.currencies)
                  .map((c) => c.name)
                  .join(", ")
              : "Non disponible"
          }</p>
          <p>Superficie : ${pays.area.toLocaleString()} km²</p>
          <p>Domaine internet : ${pays.tld ? pays.tld.join(", ") : "Non disponible"}</p>
          <p>Population : ${pays.population ? pays.population.toLocaleString() : "Non disponible"}</p>
          <p>Densité de population : ${pays.population && pays.area ? (pays.population / pays.area).toFixed(2) + " hab/km²" : "Non disponible"}</p>
          <p>PIB : ${pays.gdp ? "$" + pays.gdp.toLocaleString() : "Non disponible"}</p>
          </div>
          <div class="div3">3</div>
          <div class="div4">4</div>
          <div class="div5">5</div>
          <div class="div6">6</div>
          <div class="div7">7</div>
          <div class="div8">8</div>
          <div class="div9">9</div>
          <div class="div11">11</div>
          <div class="div12">12</div>`;
}
