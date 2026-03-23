/**
 * ChartsView.js - Gestion des visualisations graphiques
 * Utilise Chart.js pour afficher les données démographiques
 * 
 * @author API Demo Team
 * @version 1.0.0
 * @requires Chart.js (CDN)
 */

class ChartsView {
    /**
     * Initialise la classe ChartsView
     */
    constructor() {
        this.charts = {};
        this.chartsContainer = null;
        this.initChartContainer();
    }

    /**
     * Crée le conteneur pour les graphiques s'il n'existe pas
     * @private
     */
    initChartContainer() {
        let container = document.getElementById('charts-section');
        if (!container) {
            container = document.createElement('section');
            container.id = 'charts-section';
            container.className = 'charts-section';
            container.innerHTML = `
                <h2>📊 Visualisations Démographiques</h2>
                <div class="charts-grid">
                    <div class="chart-container">
                        <canvas id="populationChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="birthDeathChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="estimatesChart"></canvas>
                    </div>
                </div>
            `;
            const resultsContainer = document.getElementById('results-container');
            if (resultsContainer) {
                resultsContainer.parentNode.insertBefore(container, resultsContainer.nextSibling);
            }
        }
        this.chartsContainer = container;
    }

    /**
     * Affiche/cache la section des graphiques
     * @param {boolean} show - Afficher ou cacher
     */
    toggleChartsVisibility(show = true) {
        if (this.chartsContainer) {
            this.chartsContainer.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Affiche un graphique de population (Pie Chart)
     * @param {Object} data - Données du pays
     * @example
     * renderPopulationChart({
     *     name: 'France',
     *     population: '68,500,000',
     *     year: 2026
     * })
     */
    renderPopulationChart(data) {
        const ctx = document.getElementById('populationChart');
        if (!ctx) return;

        // Détruire le chart précédent pour éviter les conflits
        if (this.charts.population) {
            this.charts.population.destroy();
        }

        const populationValue = parseInt(data.population.replace(/[^0-9]/g, ''));

        this.charts.population = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [`${data.name} (${data.year})`],
                datasets: [{
                    label: 'Population Totale',
                    data: [populationValue],
                    backgroundColor: ['#3498db'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `👥 Population: ${data.population} habitants`,
                        font: { size: 14, weight: 'bold' },
                        padding: 15
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y.toLocaleString('fr-FR');
                                return `${value} habitants`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Affiche un graphique de natalité vs mortalité (Bar Chart)
     * @param {Object} data - Données du pays avec birthRate et deathRate
     * @example
     * renderBirthDeathChart({
     *     name: 'France',
     *     birthRate: 10.69,
     *     deathRate: 8.98
     * })
     */
    renderBirthDeathChart(data) {
        const ctx = document.getElementById('birthDeathChart');
        if (!ctx) return;

        // Détruire le chart précédent
        if (this.charts.birthDeath) {
            this.charts.birthDeath.destroy();
        }

        const birthRate = parseFloat(data.birthRate) || 0;
        const deathRate = parseFloat(data.deathRate) || 0;
        const naturalGrowth = (birthRate - deathRate).toFixed(2);

        this.charts.birthDeath = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['📈 Natalité', '📉 Mortalité'],
                datasets: [{
                    label: 'Taux (pour 1000)',
                    data: [birthRate, deathRate],
                    backgroundColor: [
                        'rgba(39, 174, 96, 0.8)',   // Vert pour natalité
                        'rgba(231, 76, 60, 0.8)'    // Rouge pour mortalité
                    ],
                    borderColor: [
                        'rgb(39, 174, 96)',
                        'rgb(231, 76, 60)'
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `📊 Taux Natalité vs Mortalité (Croissance Naturelle: ${naturalGrowth}‰)`,
                        font: { size: 14, weight: 'bold' },
                        padding: 15
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return context.parsed.x.toFixed(2) + '‰ (pour 1000)';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: Math.max(birthRate, deathRate) + 5,
                        ticks: {
                            callback: (value) => value.toFixed(1) + '‰'
                        }
                    }
                }
            }
        });
    }

    /**
     * Affiche un graphique des estimations annuelles (Births vs Deaths)
     * @param {Object} data - Données du pays avec births et deaths
     * @example
     * renderEstimatesChart({
     *     name: 'France',
     *     births: '640,000',
     *     deaths: '590,000'
     * })
     */
    renderEstimatesChart(data) {
        const ctx = document.getElementById('estimatesChart');
        if (!ctx) return;

        // Détruire le chart précédent
        if (this.charts.estimates) {
            this.charts.estimates.destroy();
        }

        const birthsValue = parseInt(data.births.replace(/[^0-9]/g, ''));
        const deathsValue = parseInt(data.deaths.replace(/[^0-9]/g, ''));
        const netChange = (birthsValue - deathsValue).toLocaleString('fr-FR');

        this.charts.estimates = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['👶 Naissances', '⚰️ Décès'],
                datasets: [{
                    label: 'Nombre annuel estimé',
                    data: [birthsValue, deathsValue],
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.8)',   // Vert clair
                        'rgba(192, 57, 43, 0.8)'    // Marron foncé
                    ],
                    borderColor: [
                        'rgb(46, 204, 113)',
                        'rgb(192, 57, 43)'
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `📅 Estimations Annuelles (Changement Net: ${netChange})`,
                        font: { size: 14, weight: 'bold' },
                        padding: 15
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return context.parsed.y.toLocaleString('fr-FR') + ' habitants';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return value.toLocaleString('fr-FR');
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Affiche tous les graphiques pour un pays
     * @param {Object} data - Données complètes du pays
     */
    renderAllCharts(data) {
        this.toggleChartsVisibility(true);
        this.renderPopulationChart(data);
        this.renderBirthDeathChart(data);
        this.renderEstimatesChart(data);
    }

    /**
     * Supprime tous les graphiques et nettoie les ressources
     * @method
     */
    clearCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                try {
                    this.charts[key].destroy();
                } catch (e) {
                    console.warn(`Erreur lors de la destruction du chart: ${key}`);
                }
            }
        });
        this.charts = {};
    }

    /**
     * Crée un graphique de comparaison multi-pays
     * @param {Array<Object>} countriesData - Tableau de données des pays
     * @param {string} metric - Métrique à comparer: 'population', 'birthRate', 'deathRate'
     * @example
     * renderComparison([
     *     {name: 'France', population: '68000000'},
     *     {name: 'Allemagne', population: '84000000'}
     * ], 'population')
     */
    renderComparisonChart(countriesData, metric = 'population') {
        if (!countriesData || countriesData.length === 0) return;

        const container = this.chartsContainer;
        let comparisonCanvas = document.getElementById('comparisonChart');
        
        if (!comparisonCanvas) {
            const chartDiv = document.createElement('div');
            chartDiv.className = 'chart-container';
            chartDiv.innerHTML = '<canvas id="comparisonChart"></canvas>';
            
            const chartsGrid = container.querySelector('.charts-grid');
            if (chartsGrid) {
                chartsGrid.appendChild(chartDiv);
            }
            comparisonCanvas = document.getElementById('comparisonChart');
        }

        // Détruire le chart précédent
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }

        const labels = countriesData.map(d => d.name);
        let data = [];
        let title = '';
        let color = '#3498db';

        switch(metric) {
            case 'population':
                data = countriesData.map(d => 
                    parseInt(d.population.replace(/[^0-9]/g, ''))
                );
                title = 'Comparaison des Populations';
                color = '#3498db';
                break;
            case 'birthRate':
                data = countriesData.map(d => parseFloat(d.birthRate) || 0);
                title = 'Comparaison des Taux de Natalité (‰)';
                color = '#27ae60';
                break;
            case 'deathRate':
                data = countriesData.map(d => parseFloat(d.deathRate) || 0);
                title = 'Comparaison des Taux de Mortalité (‰)';
                color = '#e74c3c';
                break;
        }

        this.charts.comparison = new Chart(comparisonCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: color,
                    borderRadius: 4,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `🌍 ${title}`,
                        font: { size: 14, weight: 'bold' },
                        padding: 15
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                if (metric === 'population' && value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Exporte un graphique en image PNG
     * @param {string} chartId - ID du canvas du graphique
     * @param {string} filename - Nom du fichier à télécharger
     */
    downloadChartAsImage(chartId, filename = 'chart.png') {
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            console.error(`Canvas avec l'ID ${chartId} non trouvé`);
            return;
        }

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = filename;
        link.click();
    }
}

export default ChartsView;
