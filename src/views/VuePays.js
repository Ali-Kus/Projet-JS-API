export default class VuePays {
  /**
   * Vue responsable du rendu et des interactions UI.
   */
  /**
   * @param {Object} options
   * @param {string} options.idConteneur
   * @param {string} options.selecteurFormulaire
   * @param {string} options.selecteurChamp
   */
  constructor({ idConteneur, selecteurFormulaire, selecteurChamp }) {
    this.conteneur = document.getElementById(idConteneur);
    this.formulaire = document.querySelector(selecteurFormulaire);
    this.champ = this.formulaire?.querySelector(selecteurChamp) ?? null;
    this.boutonEnvoyer =
      this.formulaire?.querySelector(".bouton-submit") ?? null;
    this.listeSuggestions = document.getElementById("suggestions-pays");
    this.historique = this.chargerHistorique();
  }

  /**
   * Charge l'historique des recherches et met a jour la datalist.
   * @returns {string[]}
   */
  chargerHistorique() {
    const historique = localStorage.getItem("historiquePays");
    if (!this.listeSuggestions) {
      return [];
    }
    if (!historique) {
      this.listeSuggestions.innerHTML = "";
      return [];
    }
    try {
      const donnees = JSON.parse(historique);
      const liste = Array.isArray(donnees) ? donnees : [];
      this.listeSuggestions.innerHTML = liste
        .map((item) => `<option value="${item}"></option>`)
        .join("");
      return liste;
    } catch {
      this.listeSuggestions.innerHTML = "";
      return [];
    }
  }

  /**
   * Enregistre une recherche dans l'historique et met a jour les suggestions.
   * @param {string} valeur
   * @returns {void}
   */
  enregistrerSuggestion(valeur) {
    const valeurNettoyee = valeur.trim();
    if (!valeurNettoyee) return;

    const existe = this.historique.some(
      (item) => item.toLowerCase() === valeurNettoyee.toLowerCase(),
    );
    if (existe) return;

    this.historique.unshift(valeurNettoyee);
    this.historique = this.historique.slice(0, 8);
    localStorage.setItem("historiquePays", JSON.stringify(this.historique));
    this.chargerHistorique();
  }

  /**
   * Lie l'envoi du formulaire a un gestionnaire.
   * @param {(valeur: string) => void} gestionnaire
   * @returns {void}
   */
  bindSubmit(gestionnaire) {
    if (!this.formulaire) {
      console.error("Formulaire introuvable dans le DOM.");
      return;
    }

    // SPECIAL: desactive le bouton si le champ est vide (UX demandee).
    const mettreAJourBouton = () => {
      if (!this.boutonEnvoyer) {
        return;
      }
      const valeur = this.champ ? this.champ.value.trim() : "";
      this.boutonEnvoyer.disabled = valeur.length === 0;
    };

    mettreAJourBouton();

    if (this.champ) {
      this.champ.addEventListener("input", mettreAJourBouton);
    }

    this.formulaire.addEventListener("submit", (event) => {
      event.preventDefault();
      const valeur = this.champ ? this.champ.value.trim() : "";
      this.enregistrerSuggestion(valeur);
      gestionnaire(valeur);
    });
  }

  /**
   * Affiche un pays dans la zone de rendu.
   * @param {import("../models/Pays.js").default} pays
   * @returns {void}
   */
  renderCountry(pays) {
    if (!this.conteneur) {
      console.error("Conteneur de rendu introuvable dans le DOM.");
      return;
    }

    this.conteneur.innerHTML = `
      <div class="div1 drapeau">
        ${pays.urlDrapeau ? `<img src="${pays.urlDrapeau}" alt="Drapeau de ${pays.nom}" />` : ""}
      </div>
      <div class="div2 information">
        <p>${pays.nom}</p>
        <p>Population : ${pays.population?.toLocaleString?.() ?? "Non disponible"}</p>
        <p>Capitale : ${pays.capitale}</p>
        <p>Region : ${pays.region}</p>
        <p>Langues : ${pays.langues}</p>
        <p>Monnaie : ${pays.monnaies}</p>
        <p>Superficie : ${pays.superficie ? pays.superficie.toLocaleString() + " km2" : "Non disponible"}</p>
        <p>Domaine internet : ${pays.domaineInternet}</p>
        <p>Densite : ${pays.population && pays.superficie ? (pays.population / pays.superficie).toFixed(2) + " hab/km2" : "Non disponible"}</p>
      </div>
      <div class="div3">
        <p>Population (2000)</p>
        <p>${pays.population2000?.toLocaleString?.() ?? "Non disponible"}</p>
      </div>
      <div class="div4">
        <p>PIB (2000)</p>
        <p>${pays.pib2000 ? "$" + pays.pib2000.toLocaleString() : "Non disponible"}</p>
      </div>
      <div class="div5">
        ${pays.urlBlason ? `<img src="${pays.urlBlason}" alt="Blason de ${pays.nom}" />` : ""}
      </div>
      <div class="div6">
        <p>Esperance de vie (2000)</p>
        <p>${pays.esperanceVie2000 ? pays.esperanceVie2000.toFixed(1) + " ans" : "Non disponible"}</p>
      </div>
      <div class="div7">
        <p>Source</p>
        <p>World Bank</p>
      </div>
      <div class="div8">8</div>
      <div class="div9">
        <p>UCDP - Type</p>
        <p>${pays.ucdpTitre ?? "Non disponible"}</p>
      </div>
      <div class="div11">
        <p>UCDP - Lieu</p>
        <p>${pays.ucdpLieu ?? "Non disponible"}</p>
      </div>
      <div class="div12">
        <p>UCDP - Morts</p>
        <p>${pays.ucdpMorts ?? "Non disponible"}</p>
      </div>
    `;
  }
}
