import Pays from "../models/Pays.js";

export default class ControleurPays {
  /**
   * @param {import("../views/VuePays.js").default} vue
   */
  constructor(vue) {
    this.vue = vue;
  }

  /**
   * Recupere un pays par son nom.
   * @param {string} nomPays
   * @returns {Promise<import("../models/Pays.js").default>}
   */
  async fetchCountryByName(nomPays) {
    const reponse = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(nomPays)}`,
    );

    if (!reponse.ok) {
      throw new Error(`Pays introuvable (Erreur ${reponse.status})`);
    }

    const donnees = await reponse.json();
    return Pays.fromApi(donnees[0]);
  }

  /**
   * Recupere un indicateur World Bank pour un pays.
   * @param {string} codeIso3
   * @param {string} indicateur
   * @returns {Promise<number|null>}
   */
  async fetchIndicateurWorldBank(codeIso3, indicateur) {
    if (!codeIso3) {
      return null;
    }

    const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(
      codeIso3,
    )}/indicator/${indicateur}?date=2000&format=json`;

    const reponse = await fetch(url);
    if (!reponse.ok) {
      return null;
    }

    const donnees = await reponse.json();
    const valeur = Array.isArray(donnees) ? donnees[1]?.[0]?.value : null;
    return typeof valeur === "number" ? valeur : null;
  }

  /**
   * Recupere un evenement UCDP pour un pays.
   * @param {string} nomPays
    * @param {string} codeIso3
   * @returns {Promise<{titre: string|null, lieu: string|null, morts: number|null}>}
   */
  async fetchUcdpEvenement(nomPays, codeIso3) {
    const url = `http://localhost:3000/api/ucdp?code=${encodeURIComponent(
      codeIso3 || "",
    )}&nom=${encodeURIComponent(nomPays)}`;

    const reponse = await fetch(url);

    if (!reponse.ok) {
      return { titre: null, lieu: null, morts: null };
    }

    const donnees = await reponse.json();
    const liste =
      donnees?.Result ||
      donnees?.result ||
      donnees?.data ||
      donnees?.Data ||
      [];
    const evenement = Array.isArray(liste) ? liste[0] : null;

    return {
      titre: evenement?.type_of_violence?.toString?.() ?? null,
      lieu: evenement?.country?.toString?.() ?? evenement?.location ?? null,
      morts:
        typeof evenement?.best === "number"
          ? evenement.best
          : typeof evenement?.deaths === "number"
            ? evenement.deaths
            : null,
    };
  }

  /**
   * Branche le controleur sur la vue.
   * @returns {void}
   */
  init() {
    console.log("Initialisation du ControleurPays...");
    this.vue.bindSubmit(async (valeur) => {
      if (!valeur) {
        console.warn("Veuillez saisir un nom de pays.");
        return;
      }

      try {
        const pays = await this.fetchCountryByName(valeur);

        const [population2000, pib2000, esperanceVie2000, ucdpEvenement] =
          await Promise.all([
            this.fetchIndicateurWorldBank(pays.codeIso3, "SP.POP.TOTL"),
            this.fetchIndicateurWorldBank(pays.codeIso3, "NY.GDP.MKTP.CD"),
            this.fetchIndicateurWorldBank(pays.codeIso3, "SP.DYN.LE00.IN"),
            this.fetchUcdpEvenement(pays.nom, pays.codeIso3),
          ]);

        pays.population2000 = population2000;
        pays.pib2000 = pib2000;
        pays.esperanceVie2000 = esperanceVie2000;
        pays.ucdpTitre = ucdpEvenement.titre;
        pays.ucdpLieu = ucdpEvenement.lieu;
        pays.ucdpMorts = ucdpEvenement.morts;

        this.vue.renderCountry(pays);
      } catch (error) {
        console.error("Erreur lors de l'appel API :", error.message);
      }
    });
  }
}
