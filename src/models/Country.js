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
    #apiKey = ''; // Optionnel: définissez votre clé via setApiKey()

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
    async getCountryData(countryName, year = new Date().getFullYear()) {
        try {
            // Obtenir le code GENC du pays
            const countryCode = this.#getCountryCode(countryName);

            if (!countryCode) {
                throw new Error(`Pays "${countryName}" non trouvé. Veuillez vérifier l'orthographe.`);
            }

            const currentYear = new Date().getFullYear();
            const startYear = 1950;

            const snapshotVars = ['NAME', 'YR', 'POP', 'BIRTHS', 'DEATHS', 'GR', 'TFR', 'CBR', 'CDR'];
            const seriesVars = ['NAME', 'YR', 'POP', 'GR', 'TFR', 'CDR'];

            const snapshotTable = await this.#fetchTable({
                countryCode,
                variables: snapshotVars,
                time: String(year)
            });

            const seriesTable = await this.#fetchTable({
                countryCode,
                variables: seriesVars,
                time: `from ${startYear} to ${currentYear}`
            });

            const pyramidTable = await this.#fetchTable({
                countryCode,
                variables: ['NAME', 'YR', ...this.#getAgeSexVariables()],
                time: String(year)
            });

            const snapshot = this.#parseSingleRow(snapshotTable, countryName);
            const series = this.#parseSeries(seriesTable);
            const agePyramid = this.#parseAgePyramid(pyramidTable);

            const populationValue = parseInt(snapshot.POP || '0', 10);
            const birthsValue = parseInt(snapshot.BIRTHS || '0', 10);
            const deathsValue = parseInt(snapshot.DEATHS || '0', 10);

            if (!populationValue) {
                throw new Error(`Aucune donnée de population disponible pour "${countryName}".`);
            }

            const computedBirthRate = populationValue ? (birthsValue / populationValue) * 1000 : 0;
            const computedDeathRate = populationValue ? (deathsValue / populationValue) * 1000 : 0;

            const birthRate = snapshot.CBR !== undefined && snapshot.CBR !== '' ? parseFloat(snapshot.CBR) : parseFloat(computedBirthRate.toFixed(2));
            const deathRate = snapshot.CDR !== undefined && snapshot.CDR !== '' ? parseFloat(snapshot.CDR) : parseFloat(computedDeathRate.toFixed(2));

            return {
                name: snapshot.NAME || countryName,
                population: this.#formatPopulation(populationValue),
                year: parseInt(snapshot.YR || String(year), 10),
                birthRate,
                deathRate,
                births: this.#formatPopulation(birthsValue),
                deaths: this.#formatPopulation(deathsValue),
                growthRate: snapshot.GR !== undefined && snapshot.GR !== '' ? parseFloat(snapshot.GR) : undefined,
                tfr: snapshot.TFR !== undefined && snapshot.TFR !== '' ? parseFloat(snapshot.TFR) : undefined,
                series,
                agePyramid
            };
        } catch (error) {
            // Gestion spécifique des erreurs réseau
            if (error instanceof TypeError) {
                throw new Error('Erreur de connexion : Impossible de joindre l\'API Census.gov. Vérifiez votre connexion internet.');
            }
            throw error;
        }
    }

    /**
     * Retourne une liste de pays disponibles pour l'auto-complétion.
     * Basée sur le mapping interne (noms normalisés → codes GENC).
     *
     * @returns {Array<{name: string, code: string}>}
     */
    getAllCountries() {
        const toDisplayName = (normalizedName) => {
            return normalizedName
                .split(' ')
                .filter(Boolean)
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
        };

        const seen = new Set();
        const countries = [];

        for (const [name, code] of Object.entries(this.#countryCodeMap)) {
            const displayName = toDisplayName(name);
            const key = `${displayName}|${code}`;
            if (seen.has(key)) continue;
            seen.add(key);
            countries.push({ name: displayName, code });
        }

        countries.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
        return countries;
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
    async #fetchTable({ countryCode, variables, time }) {
        const params = new URLSearchParams({
            get: variables.join(','),
            'for': `genc standard countries and areas:${countryCode}`,
            time
        });

        if (this.#apiKey && this.#apiKey.trim().length > 0) {
            params.set('key', this.#apiKey.trim());
        }

        const url = `${this.#baseURL}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Aucune donnée disponible pour ce pays/année.');
            }
            throw new Error(`Erreur API Census: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    #parseTable(data) {
        if (!Array.isArray(data) || data.length < 2) {
            throw new Error('Format de réponse API invalide');
        }

        const headers = data[0];
        const rows = data.slice(1);

        return rows.map(values => {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            return row;
        });
    }

    #parseSingleRow(tableData, countryName) {
        const rows = this.#parseTable(tableData);
        if (!rows.length) {
            throw new Error(`Aucune donnée disponible pour "${countryName}".`);
        }
        return rows[0];
    }

    #parseSeries(tableData) {
        const rows = this.#parseTable(tableData)
            .map(r => ({
                year: parseInt(r.YR || r.time, 10),
                pop: r.POP !== undefined ? parseInt(r.POP, 10) : null,
                gr: r.GR !== undefined && r.GR !== '' ? parseFloat(r.GR) : null,
                tfr: r.TFR !== undefined && r.TFR !== '' ? parseFloat(r.TFR) : null,
                cdr: r.CDR !== undefined && r.CDR !== '' ? parseFloat(r.CDR) : null
            }))
            .filter(r => Number.isFinite(r.year))
            .sort((a, b) => a.year - b.year);

        return {
            years: rows.map(r => r.year),
            populations: rows.map(r => (Number.isFinite(r.pop) ? r.pop : null)),
            growthRates: rows.map(r => (Number.isFinite(r.gr) ? r.gr : null)),
            tfrRates: rows.map(r => (Number.isFinite(r.tfr) ? r.tfr : null)),
            deathRates: rows.map(r => (Number.isFinite(r.cdr) ? r.cdr : null))
        };
    }

    #getAgeSexVariables() {
        const ageKeys = [
            '0_4', '5_9', '10_14', '15_19', '20_24', '25_29', '30_34', '35_39',
            '40_44', '45_49', '50_54', '55_59', '60_64', '65_69', '70_74', '75_79',
            '80_84', '85_89', '90_94', '95_99', '100_'
        ];

        const vars = [];
        for (const key of ageKeys) {
            vars.push(`MPOP${key}`);
            vars.push(`FPOP${key}`);
        }
        return vars;
    }

    #parseAgePyramid(tableData) {
        const row = this.#parseSingleRow(tableData, '');

        const buckets = [
            { label: '0-4', keys: ['0_4'] },
            { label: '5-9', keys: ['5_9'] },
            { label: '10-14', keys: ['10_14'] },
            { label: '15-19', keys: ['15_19'] },
            { label: '20-24', keys: ['20_24'] },
            { label: '25-29', keys: ['25_29'] },
            { label: '30-34', keys: ['30_34'] },
            { label: '35-39', keys: ['35_39'] },
            { label: '40-44', keys: ['40_44'] },
            { label: '45-49', keys: ['45_49'] },
            { label: '50-54', keys: ['50_54'] },
            { label: '55-59', keys: ['55_59'] },
            { label: '60-64', keys: ['60_64'] },
            { label: '65-69', keys: ['65_69'] },
            { label: '70-74', keys: ['70_74'] },
            { label: '75-79', keys: ['75_79'] },
            { label: '80+', keys: ['80_84', '85_89', '90_94', '95_99', '100_'] }
        ];

        const ageGroups = buckets.map(b => b.label);
        const males = [];
        const females = [];

        for (const bucket of buckets) {
            let m = 0;
            let f = 0;
            for (const key of bucket.keys) {
                const mVal = parseInt(row[`MPOP${key}`] || '0', 10);
                const fVal = parseInt(row[`FPOP${key}`] || '0', 10);
                m += Number.isFinite(mVal) ? mVal : 0;
                f += Number.isFinite(fVal) ? fVal : 0;
            }
            males.push(-m);
            females.push(f);
        }

        return { ageGroups, males, females };
    }

    /**
     * Parse la réponse de l'API Census.gov
     * 
     * @param {Array} data - Données brutes de l'API
     * @param {string} countryName - Nom du pays (pour affichage)
     * @returns {Object} Objet formaté { name, population, year, birthRate, deathRate }
     * @private
     */
    // #parseResponse supprimé: remplacé par #parseTable/#parseSingleRow

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

