/**
 * Classe DataModel - Gestion des appels API Census.gov
 * 
 * Responsabilités:
 * - Récupérer les données de population depuis l'API Census.gov IDB
 * - Formater les données brutes en objet standardisé
 * - Gérer les erreurs d'API (pays inexistant, connexion, etc.)
 * - Mapper les noms de pays vers les codes GENC (Geographic Names Encoding)
 */

class DataModel {
    /**
     * URL de base de l'API Census IDB
     * @type {string}
     * @private
     */
    #baseURL = 'https://api.census.gov/data/timeseries/idb/5year';

    /**
     * Clé API Census.gov (à configurer)
     * @type {string}
     * @private
     */
    #apiKey = 'c13a0b64696991de9074a35f7e15d26599845bfc'; // À remplacer par une clé réelle depuis https://www.census.gov/data/developers/api-key.html

    /**
     * Mapping des noms de pays vers codes GENC (ISO 3166-1 alpha-2)
     * Cet objet contient les codes pour les pays les plus courants
     * @type {Object}
     * @private
     */
    #countryCodeMap = {
        'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'andorra': 'AD',
        'angola': 'AO', 'antigua': 'AG', 'argentina': 'AR', 'armenia': 'AM',
        'australia': 'AU', 'austria': 'AT', 'azerbaijan': 'AZ', 'bahamas': 'BS',
        'bahrain': 'BH', 'bangladesh': 'BD', 'barbados': 'BB', 'belarus': 'BY',
        'belgium': 'BE', 'belize': 'BZ', 'benin': 'BJ', 'bhutan': 'BT',
        'bolivia': 'BO', 'bosnia': 'BA', 'botswana': 'BW', 'brazil': 'BR',
        'brunei': 'BN', 'bulgaria': 'BG', 'burkina': 'BF', 'burundi': 'BI',
        'cambodia': 'KH', 'cameroon': 'CM', 'canada': 'CA', 'cape verde': 'CV',
        'central african': 'CF', 'chad': 'TD', 'chile': 'CL', 'china': 'CN',
        'colombia': 'CO', 'comoros': 'KM', 'congo': 'CG', 'costa rica': 'CR',
        'côte': 'CI', 'ivory coast': 'CI', 'croatia': 'HR', 'cuba': 'CU',
        'cyprus': 'CY', 'czech': 'CZ', 'denmark': 'DK', 'djibouti': 'DJ',
        'dominica': 'DM', 'dominican': 'DO', 'ecuador': 'EC', 'egypt': 'EG',
        'el salvador': 'SV', 'equatorial': 'GQ', 'eritrea': 'ER', 'estonia': 'EE',
        'eswatini': 'SZ', 'swaziland': 'SZ', 'ethiopia': 'ET', 'fiji': 'FJ',
        'finland': 'FI', 'france': 'FR', 'gabon': 'GA', 'gambia': 'GM',
        'georgia': 'GE', 'germany': 'DE', 'ghana': 'GH', 'greece': 'GR',
        'grenada': 'GD', 'guatemala': 'GT', 'guinea': 'GN', 'guinea-bissau': 'GW',
        'guyana': 'GY', 'haiti': 'HT', 'honduras': 'HN', 'hong kong': 'HK',
        'hungary': 'HU', 'iceland': 'IS', 'india': 'IN', 'indonesia': 'ID',
        'iran': 'IR', 'iraq': 'IQ', 'ireland': 'IE', 'israel': 'IL',
        'italy': 'IT', 'jamaica': 'JM', 'japan': 'JP', 'jordan': 'JO',
        'kazakhstan': 'KZ', 'kenya': 'KE', 'kiribati': 'KI', 'korea': 'KR',
        'north korea': 'KP', 'south korea': 'KR', 'kosovo': 'XK', 'kuwait': 'KW',
        'kyrgyzstan': 'KG', 'laos': 'LA', 'latvia': 'LV', 'lebanon': 'LB',
        'lesotho': 'LS', 'liberia': 'LR', 'libya': 'LY', 'liechtenstein': 'LI',
        'lithuania': 'LT', 'luxembourg': 'LU', 'macao': 'MO', 'madagascar': 'MG',
        'malawi': 'MW', 'malaysia': 'MY', 'maldives': 'MV', 'mali': 'ML',
        'malta': 'MT', 'marshall': 'MH', 'mauritania': 'MR', 'mauritius': 'MU',
        'mexico': 'MX', 'micronesia': 'FM', 'moldova': 'MD', 'monaco': 'MC',
        'mongolia': 'MN', 'montenegro': 'ME', 'morocco': 'MA', 'mozambique': 'MZ',
        'myanmar': 'MM', 'burma': 'MM', 'namibia': 'NA', 'nauru': 'NR',
        'nepal': 'NP', 'netherlands': 'NL', 'new zealand': 'NZ', 'nicaragua': 'NI',
        'niger': 'NE', 'nigeria': 'NG', 'norway': 'NO', 'oman': 'OM',
        'pakistan': 'PK', 'palau': 'PW', 'palestine': 'PS', 'panama': 'PA',
        'papua': 'PG', 'paraguay': 'PY', 'peru': 'PE', 'philippines': 'PH',
        'poland': 'PL', 'portugal': 'PT', 'qatar': 'QA', 'romania': 'RO',
        'russia': 'RU', 'rwanda': 'RW', 'saint kitts': 'KN', 'saint lucia': 'LC',
        'saint vincent': 'VC', 'samoa': 'WS', 'san marino': 'SM',
        'sao tome': 'ST', 'saudi arabia': 'SA', 'senegal': 'SN', 'serbia': 'RS',
        'seychelles': 'SC', 'sierra leone': 'SL', 'singapore': 'SG', 'slovakia': 'SK',
        'slovenia': 'SI', 'solomon': 'SB', 'somalia': 'SO', 'south africa': 'ZA',
        'south sudan': 'SS', 'spain': 'ES', 'sri lanka': 'LK', 'sudan': 'SD',
        'suriname': 'SR', 'sweden': 'SE', 'switzerland': 'CH', 'syria': 'SY',
        'taiwan': 'TW', 'tajikistan': 'TJ', 'tanzania': 'TZ', 'thailand': 'TH',
        'timor-leste': 'TL', 'east timor': 'TL', 'togo': 'TG', 'tonga': 'TO',
        'trinidad': 'TT', 'tunisia': 'TN', 'turkey': 'TR', 'turkmenistan': 'TM',
        'tuvalu': 'TV', 'uganda': 'UG', 'ukraine': 'UA', 'united arab': 'AE',
        'uae': 'AE', 'united kingdom': 'GB', 'uk': 'GB', 'united states': 'US',
        'usa': 'US', 'america': 'US', 'uruguay': 'UY', 'uzbekistan': 'UZ',
        'vanuatu': 'VU', 'vatican': 'VA', 'venezuela': 'VE', 'vietnam': 'VN',
        'yemen': 'YE', 'zambia': 'ZM', 'zimbabwe': 'ZW'
    };

    /**
     * Récupère les données de population d'un pays depuis l'API Census.gov
     * 
     * @param {string} countryName - Nom du pays (ex: 'France', 'United States')
     * @returns {Promise<{name: string, population: string, year: number, birthRate: number, deathRate: number}>}
     * @throws {Error} Erreur si le pays n'existe pas ou erreur réseau
     */
    async getCountryData(countryName) {
        try {
            // Obtenir le code GENC du pays
            const countryCode = this.#getCountryCode(countryName);

            if (!countryCode) {
                throw new Error(`Pays "${countryName}" non trouvé. Veuillez vérifier l'orthographe.`);
            }

            // Construire l'URL de requête
            const url = this.#buildQueryURL(countryCode);

            // Faire l'appel API
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Aucune donnée disponible pour "${countryName}".`);
                }
                throw new Error(`Erreur API Census: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Parser et formater les résultats
            const formattedData = this.#parseResponse(data, countryName);

            return formattedData;
        } catch (error) {
            // Gestion spécifique des erreurs réseau
            if (error instanceof TypeError) {
                throw new Error('Erreur de connexion : Impossible de joindre l\'API Census.gov. Vérifiez votre connexion internet.');
            }
            throw error;
        }
    }

    /**
     * Obtient le code GENC (ISO 3166-1) d'un pays à partir de son nom
     * 
     * @param {string} countryName - Nom du pays
     * @returns {string|null} Code GENC ou null
     * @private
     */
    #getCountryCode(countryName) {
        const normalized = countryName.toLowerCase().trim();

        // Recherche exacte
        if (this.#countryCodeMap[normalized]) {
            return this.#countryCodeMap[normalized];
        }

        // Recherche partielle
        for (const [key, code] of Object.entries(this.#countryCodeMap)) {
            if (key.includes(normalized) || normalized.includes(key)) {
                return code;
            }
        }

        return null;
    }

    /**
     * Construit l'URL de requête à l'API Census.gov
     * 
     * @param {string} countryCode - Code GENC du pays
     * @returns {string} URL complète de la requête
     * @private
     */
    #buildQueryURL(countryCode) {
        // Variables principales : Population (POP), Birth Rate (BIRTHS), Death Rate (DEATHS)
        const variables = ['NAME', 'POP', 'BIRTHS', 'DEATHS'];
        const year = 2026; // Année actuelle

        const params = new URLSearchParams({
            get: variables.join(','),
            YR: year,
            'for': `genc standard countries and areas:${countryCode}`,
            key: this.#apiKey
        });

        return `${this.#baseURL}?${params.toString()}`;
    }

    /**
     * Parse la réponse de l'API Census.gov
     * 
     * @param {Array} data - Données brutes de l'API
     * @param {string} countryName - Nom du pays (pour affichage)
     * @returns {Object} Objet formaté { name, population, year, birthRate, deathRate }
     * @private
     */
    #parseResponse(data, countryName) {
        // L'API retourne un tableau avec headers en première ligne
        if (!Array.isArray(data) || data.length < 2) {
            throw new Error('Format de réponse API invalide');
        }

        const headers = data[0];
        const values = data[1];

        // Créer un objet avec les en-têtes et valeurs
        const result = {};
        headers.forEach((header, index) => {
            result[header] = values[index];
        });

        // Extraire et formater les données
        const populationValue = parseInt(result['POP'] || '0', 10);
        const birthsValue = parseInt(result['BIRTHS'] || '0', 10);
        const deathsValue = parseInt(result['DEATHS'] || '0', 10);

        if (populationValue === 0) {
            throw new Error(`Aucune donnée de population disponible pour "${countryName}".`);
        }

        // Calculer les taux (pour 1000 habitants)
        const birthRate = ((birthsValue / populationValue) * 1000).toFixed(2);
        const deathRate = ((deathsValue / populationValue) * 1000).toFixed(2);

        return {
            name: result['NAME'] || countryName,
            population: this.#formatPopulation(populationValue),
            year: 2026,
            birthRate: parseFloat(birthRate),
            deathRate: parseFloat(deathRate),
            births: this.#formatPopulation(birthsValue),
            deaths: this.#formatPopulation(deathsValue)
        };
    }

    /**
     * Formate un nombre de population avec séparateurs de milliers
     * 
     * @param {number} population - Nombre de population
     * @returns {string} Population formatée (ex: "1 234 567")
     * @private
     */
    #formatPopulation(population) {
        if (typeof population !== 'number' || population < 0) {
            return '0';
        }
        return population.toLocaleString('fr-FR');
    }

    /**
     * Définit une clé API personnalisée. À appeler si vous avez votre propre clé.
     * Obtenez-la à: https://www.census.gov/data/developers/api-key.html
     * 
     * @param {string} apiKey - Clé API Census.gov
     */
    setApiKey(apiKey) {
        if (typeof apiKey === 'string' && apiKey.trim().length > 0) {
            this.#apiKey = apiKey.trim();
        }
    }
}

export default DataModel;

