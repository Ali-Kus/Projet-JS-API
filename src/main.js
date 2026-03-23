/**
 * Point d'entrée de l'application - main.js
 * 
 * Responsabilités:
 * - Charger les dépendances (modules ES6)
 * - Initialiser le contrôleur principal
 * - Démarrer l'application quand le DOM est prêt
 */

import AppController from './controllers/AppController.js';

/**
 * Initialise l'application quand le DOM est complètement chargé
 */
document.addEventListener('DOMContentLoaded', () => {
    // Créer une instance unique du contrôleur
    const app = new AppController();

    // Rendre l'instance globale pour debug si nécessaire
    if (process.env.NODE_ENV === 'development') {
        window.censusApp = app;
    }

    console.log('📱 Application Census chargée avec succès!');
});

