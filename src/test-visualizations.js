/**
 * test-visualizations.js - Test simple des visualisations
 * 
 * Utilisation:
 * 1. Copier ce fichier dans le dossier src/
 * 2. Ajouter un bouton "Test Visualisations" dans index.html
 * 3. Lancer le test
 */

import ResultView from './views/ResultView.js';

/**
 * Lance un test des visualisations avec données de démonstration
 */
function testVisualizations() {
    // Données de test
    const testData = {
        name: 'France (Test)',
        population: '68,500,000',
        year: 2026,
        birthRate: 11.2,
        deathRate: 9.5,
        births: 710000,
        deaths: 620000
    };

    // Créer le conteneur de test
    const container = document.getElementById('results-container');
    if (!container) {
        console.error('Conteneur not found');
        return;
    }

    // Créer une instance de ResultView
    const resultView = new ResultView();

    // Afficher les visualisations
    console.log('🧪 Lancement du test de visualisations...');
    console.log('📊 Données:', testData);

    try {
        resultView.renderVisualizations('results-container', testData);
        console.log('✅ Visualisations créées avec succès!');
    } catch (error) {
        console.error('❌ Erreur lors de la création des visualisations:', error);
    }
}

// Exporter pour utilisation dans console
window.testVisualizations = testVisualizations;

console.log('💡 Pour lancer un test: testVisualizations() dans la console');
