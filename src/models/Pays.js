export default class Pays {
  /**
   * Cree un modele Pays a partir de valeurs utiles.
   * @param {Object} options
   * @param {string} options.nom
   * @param {string} options.codeIso3
   * @param {string} options.urlDrapeau
   * @param {number|null} options.population
   * @param {string} options.capitale
   * @param {string} options.region
   * @param {string} options.langues
   * @param {string} options.monnaies
   * @param {number|null} options.superficie
   * @param {string} options.domaineInternet
   * @param {number|null} [options.population2000]
   * @param {number|null} [options.pib2000]
   * @param {number|null} [options.esperanceVie2000]
   * @param {string|null} [options.ucdpTitre]
   * @param {string|null} [options.ucdpLieu]
   * @param {number|null} [options.ucdpMorts]
   * @param {string} [options.blason]
   */
  constructor({
    nom,
    codeIso3,
    urlDrapeau,
    population,
    capitale,
    region,
    langues,
    monnaies,
    superficie,
    domaineInternet,
    population2000,
    pib2000,
    esperanceVie2000,
    ucdpTitre,
    ucdpLieu,
    ucdpMorts,
    urlBlason,
  }) {
    this.nom = nom;
    this.codeIso3 = codeIso3;
    this.urlDrapeau = urlDrapeau;
    this.population = population;
    this.capitale = capitale;
    this.region = region;
    this.langues = langues;
    this.monnaies = monnaies;
    this.superficie = superficie;
    this.domaineInternet = domaineInternet;
    this.population2000 = population2000 ?? null;
    this.pib2000 = pib2000 ?? null;
    this.esperanceVie2000 = esperanceVie2000 ?? null;
    this.ucdpTitre = ucdpTitre ?? null;
    this.ucdpLieu = ucdpLieu ?? null;
    this.ucdpMorts = ucdpMorts ?? null;
    this.urlBlason = urlBlason;
  }

  /**
   * Mappe les donnees brutes de l'API vers le modele.
   * @param {Object} donneesApi
   * @returns {Pays}
   */
  static fromApi(donneesApi) {
    console.log("Donnees brutes de l'API :", donneesApi);
    return new Pays({
      nom: donneesApi?.name?.common ?? "Non disponible",
      codeIso3: donneesApi?.cca3 ?? "",
      urlDrapeau: donneesApi?.flags?.png ?? "",
      population: donneesApi?.population ?? null,
      capitale: donneesApi?.capital?.[0] ?? "Non disponible",
      region: donneesApi?.region ?? "Non disponible",
      langues: donneesApi?.languages
        ? Object.values(donneesApi.languages).join(", ")
        : "Non disponible",
      monnaies: donneesApi?.currencies
        ? Object.values(donneesApi.currencies)
            .map((c) => c.name)
            .join(", ")
        : "Non disponible",
      superficie: donneesApi?.area ?? null,
      domaineInternet: donneesApi?.tld
        ? donneesApi.tld.join(", ")
        : "Non disponible",
      urlBlason: donneesApi?.coatOfArms?.svg ?? "",
    });
  }
}
