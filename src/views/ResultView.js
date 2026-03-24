/**
 * ResultView.js - Affichage des visualisations graphiques complexes
 * Utilise Chart.js pour créer des graphiques démographiques professionnels
 * 
 * Graphiques affichés:
 * 1. Pyramide des Âges (Age Pyramid) - Stacked Bar Chart horizontal
 * 2. Évolution de la Population (Population Evolution) - Line Chart (1950-2026)
 * 3. Taux de Croissance Annuel (Annual Growth Rate) - Line Chart (optionnel)
 * 4. Taux de Fécondité Total (Total Fertility Rate) - Line Chart (optionnel)
 * 
 * @author TP University - JavaScript Architecture MVC
 * @version 2.0.0
 * @requires Chart.js (CDN)
 */

class ResultView {
    /**
     * Stocke les instances Chart.js pour destruction ultérieure
     * @type {Object}
     * @private
     */
    #charts = {};

    /**
     * Conteneur principal des visualisations
     * @type {HTMLElement}
     * @private
     */
    #visualsContainer = null;

    /**
     * Constructeur de ResultView
     */
    constructor() {
        this.#charts = {};
    }

    /**
     * Vérifie que les séries nécessaires existent (données API)
     * @private
     */
    #hasSeries(data) {
        return Boolean(data && data.series && Array.isArray(data.series.years));
    }

    /**
     * Méthode principale pour afficher toutes les visualisations
     * 
     * Crée et affiche les 4 graphiques démographiques en MVC pattern.
     * Détruit les graphiques précédents pour éviter les fuites mémoire.
     * 
     * @param {string} containerId - ID du conteneur parent
     * @param {Object} data - Données du pays
     * @param {string} data.name - Nom du pays
     * @param {string} data.population - Population totale (formatée)
     * @param {number} [data.year=2026] - Année courante
     * @param {number} [data.birthRate] - Taux de natalité (optionnel)
     * @param {number} [data.deathRate] - Taux de mortalité (optionnel)
     * 
     * @returns {void}
     * 
     * @example
     * const resultView = new ResultView();
     * resultView.renderVisualizations('results-container', {
     *     name: 'France',
     *     population: '68,500,000',
     *     year: 2026,
     *     birthRate: 11.2,
     *     deathRate: 9.5
     * });
     */
    renderVisualizations(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Conteneur #${containerId} introuvable`);
            return;
        }

        // Détruire les graphiques existants
        this.#destroyAllCharts();

        // Créer la structure HTML complète pour les visualisations
        this.#createVisualizationsStructure(container, data);

        // Afficher les graphiques principaux
        this.#renderAgePyramid(data);
        // Initialiser les onglets (Population / Croissance / Fécondité)
        this.#initializeTabs(data);
    }



    /**
     * Crée la structure HTML pour les visualisations
     * @private
     */
    #createVisualizationsStructure(container, data) {
        const displayYear = (data.year ?? new Date().getFullYear());

        const html = `
            <div class="visualizations-section">
                <div class="visualization-header">
                    <h2> Analyse Démographique - ${data.name} (${displayYear})</h2>
                </div>

                <div class="visualizations-main">
                    <!-- Pyramide des Âges -->
                    <div class="chart-wrapper chart-pyramid">
                        <div class="chart-title">
                            <h3>Pyramide des Âges (${displayYear})</h3>
                        </div>
                        <div class="chart-canvas">
                            <canvas id="agePyramidChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Onglets pour les graphiques optionnels -->
                <div class="visualizations-tabs">
                    <div class="tabs-header">
                        <button class="tab-btn active" data-tab="population">
                             Population
                        </button>
                        <button class="tab-btn" data-tab="growth">
                             Taux de Croissance
                        </button>
                        <button class="tab-btn" data-tab="fertility">
                             Taux de Fécondité
                        </button>
                        <button class="tab-btn" data-tab="mortality">
                            Taux de Mortalité
                        </button>
                    </div>

                    <!-- Contenu des onglets -->
                    <div id="tab-population" class="tab-content active">
                        <div class="chart-wrapper chart-evolution">
                            <div class="chart-title">
                                <h3>Évolution de la Population</h3>
                                <p class="chart-subtitle">Historique et projections (1950-auj.)</p>
                            </div>
                            <div class="chart-canvas">
                                <canvas id="populationEvolutionChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div id="tab-growth" class="tab-content">
                        <div class="chart-wrapper">
                            <div class="chart-title">
                                <h3>Taux de Croissance Annuel (%)</h3>
                                <p class="chart-subtitle">Pourcentage de changement annuel de la population</p>
                            </div>
                            <div class="chart-canvas">
                                <canvas id="growthRateChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div id="tab-fertility" class="tab-content">
                        <div class="chart-wrapper">
                            <div class="chart-title">
                                <h3>Taux de Fécondité Total (TFR)</h3>
                                <p class="chart-subtitle">Nombre moyen d'enfants par femme</p>
                            </div>
                            <div class="chart-canvas">
                                <canvas id="fertilityRateChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div id="tab-mortality" class="tab-content">
                        <div class="chart-wrapper">
                            <div class="chart-title">
                                <h3>Taux de Mortalité (‰)</h3>
                                <p class="chart-subtitle">Décès pour 1 000 habitants (CDR)</p>
                            </div>
                            <div class="chart-canvas">
                                <canvas id="deathRateChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Attacher les listeners aux onglets
        this.#attachTabListeners();
    }

    /**
     * Affiche la Pyramide des Âges
     * @private
     */
    #renderAgePyramid(data) {
        const ctx = document.getElementById('agePyramidChart');
        if (!ctx) return;

        const pyramidData = data.agePyramid;
        if (!pyramidData || !Array.isArray(pyramidData.ageGroups)) return;

        // Affichage inversé: 0-4 en bas, âges élevés en haut
        const ageGroups = [...pyramidData.ageGroups].reverse();
        const males = [...pyramidData.males].reverse();
        const females = [...pyramidData.females].reverse();

        this.#charts.agePyramid = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ageGroups,
                datasets: [
                    {
                        label: 'Hommes',
                        data: males,
                        backgroundColor: '#3498db',
                        borderColor: '#2980b9',
                        borderWidth: 0.5,
                        barPercentage: 0.9
                    },
                    {
                        label: 'Femmes',
                        data: females,
                        backgroundColor: '#e74c3c',
                        borderColor: '#c0392b',
                        borderWidth: 0.5,
                        barPercentage: 0.9
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            padding: 15,
                            font: { size: 12, weight: 'bold' }
                        }
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            callback: function(value) {
                                return Math.abs(value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        });
    }

    /**
     * Affiche l'Évolution de la Population
     * @private
     */
    #renderPopulationEvolution(data) {
        const ctx = document.getElementById('populationEvolutionChart');
        if (!ctx) return;

        if (!this.#hasSeries(data)) return;
        const evolutionData = {
            years: data.series.years,
            populations: data.series.populations
        };

        this.#charts.populationEvolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: evolutionData.years,
                datasets: [{
                    label: 'Population Totale',
                    data: evolutionData.populations,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#27ae60'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            padding: 15,
                            font: { size: 12, weight: 'bold' }
                        }
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000).toFixed(0) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialise les onglets pour les graphiques optionnels
     * @private
     */
    #initializeTabs(data) {
        // Les 3 graphiques sont pré-rendus (le conteneur actif est "Population")
        this.#renderPopulationEvolution(data);
        this.#renderGrowthRateChart(data);
        this.#renderFertilityRateChart(data);
        this.#renderDeathRateChart(data);
    }

    /**
     * Affiche le Taux de Mortalité (CDR)
     * @private
     */
    #renderDeathRateChart(data) {
        const ctx = document.getElementById('deathRateChart');
        if (!ctx) return;

        if (!this.#hasSeries(data)) return;
        const deathRates = data.series.deathRates;
        if (!Array.isArray(deathRates)) return;

        const mortalityData = {
            years: data.series.years,
            rates: deathRates
        };

        this.#charts.deathRate = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mortalityData.years,
                datasets: [{
                    label: 'Taux de mortalité (‰)',
                    data: mortalityData.rates,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#e74c3c'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            padding: 15,
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + '‰';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Affiche le Taux de Croissance Annuel
     * @private
     */
    #renderGrowthRateChart(data) {
        const ctx = document.getElementById('growthRateChart');
        if (!ctx) return;

        if (!this.#hasSeries(data)) return;
        const growthData = {
            years: data.series.years,
            rates: data.series.growthRates
        };

        this.#charts.growthRate = new Chart(ctx, {
            type: 'line',
            data: {
                labels: growthData.years,
                datasets: [{
                    label: 'Taux de Croissance (%)',
                    data: growthData.rates,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#f39c12'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            padding: 15,
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Affiche le Taux de Fécondité Total
     * @private
     */
    #renderFertilityRateChart(data) {
        const ctx = document.getElementById('fertilityRateChart');
        if (!ctx) return;

        if (!this.#hasSeries(data)) return;
        const fertilityData = {
            years: data.series.years,
            rates: data.series.tfrRates
        };

        this.#charts.fertilityRate = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fertilityData.years,
                datasets: [{
                    label: 'Taux de Fécondité (enfants/femme)',
                    data: fertilityData.rates,
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#9b59b6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            padding: 15,
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 8,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Attache les listeners pour la navigation entre onglets
     * @private
     */
    #attachTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');

                // Retirer la classe active de tous les onglets
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Ajouter la classe active au bouton cliqué et son contenu
                button.classList.add('active');
                document.getElementById(`tab-${tabName}`).classList.add('active');

                // Redessiner le graphique pour s'adapter au conteneur
                if (tabName === 'population' && this.#charts.populationEvolution) {
                    setTimeout(() => this.#charts.populationEvolution.resize(), 100);
                } else if (tabName === 'growth' && this.#charts.growthRate) {
                    setTimeout(() => this.#charts.growthRate.resize(), 100);
                } else if (tabName === 'fertility' && this.#charts.fertilityRate) {
                    setTimeout(() => this.#charts.fertilityRate.resize(), 100);
                } else if (tabName === 'mortality' && this.#charts.deathRate) {
                    setTimeout(() => this.#charts.deathRate.resize(), 100);
                }
            });
        });
    }

    // Générateurs supprimés: les graphes utilisent désormais les données API.

    /**
     * Détruit tous les graphiques Chart.js existants
     * @private
     */
    #destroyAllCharts() {
        Object.values(this.#charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.#charts = {};
    }

    /**
     * Détruit toutes les ressources du ResultView
     */
    destroy() {
        this.#destroyAllCharts();
    }
}

export default ResultView;
