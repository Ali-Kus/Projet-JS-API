/**
 * Classe AppController - Contrôleur principal de l'application
 * 
 * Responsabilités:
 * - Orchestrer les interactions utilisateur
 * - Synchroniser les données du modèle avec les vues
 * - Gérer les actions de recherche et d'ajout aux favoris
 * - Mettre à jour les vues en fonction des changements de modèle
 * - Gestionnaire centralisé de la logique métier
 */

import DataModel from '../models/Country.js';
import StorageModel from '../models/Storage.js';
import DomView from '../views/MainView.js';

class AppController {
    /**
     * Instances des modèles
     * @type {DataModel}
     * @private
     */
    #dataModel;

    /**
     * @type {StorageModel}
     * @private
     */
    #storageModel;

    /**
     * Instance de la vue
     * @type {DomView}
     * @private
     */
    #view;

    /**
     * Constructeur du contrôleur
     * Initialise les modèles et la vue
     */
    constructor() {
        this.#dataModel = new DataModel();
        this.#storageModel = new StorageModel();
        this.#view = new DomView();

        this.init();
    }

    /**
     * Initialise l'application
     * Met en place les listeners et affiche les données initiales
     * @private
     */
    init() {
        // Afficher les favoris au démarrage
        this.refreshFavoritesList();

        // Attacher les listeners pour la recherche
        this.attachSearchListener();
        this.attachFavoritesListeners();
    }

    /**
     * Attache le listener pour les recherches utilisateur
     * @private
     */
    attachSearchListener() {
        // Utiliser le système de callback du view pour gérer les recherches
        const searchInput = document.getElementById('input-search');
        const searchBtn = document.getElementById('btn-search');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !searchBtn?.disabled) {
                    this.handleSearch();
                }
            });
        }
    }

    /**
     * Gère la recherche d'un pays
     * @private
     */
    async handleSearch() {
        const searchTerm = this.#view.getSearchInput();

        if (!searchTerm) {
            this.#view.showError('Veuillez entrer un nom de pays');
            return;
        }

        // Afficher le loader
        this.#view.toggleLoader(true);
        this.#view.hideError();

        try {
            // Récupérer les données de l'API
            const countryData = await this.#dataModel.getCountryData(searchTerm);

            // Vérifier si le pays est en favori
            const isFav = this.#storageModel.isFav(countryData.name);

            // Afficher les résultats avec les callbacks appropriés
            this.#view.renderResults(
                countryData,
                isFav,
                (countryName, currentIsFav) => this.toggleFavorite(countryName, currentIsFav),
                (countryName) => this.searchByCountry(countryName)
            );

            // Effacer le champ de recherche
            this.#view.clearSearchInput();
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            this.#view.showError(error.message || 'Une erreur est survenue lors de la recherche.');
            this.#view.showNoResults();
        } finally {
            // Masquer le loader
            this.#view.toggleLoader(false);
        }
    }

    /**
     * Bascule le statut de favori d'un pays
     * 
     * @param {string} countryName - Nom du pays
     * @param {boolean} currentIsFav - Statut actuel (favori ou non)
     * @private
     */
    toggleFavorite(countryName, currentIsFav) {
        if (currentIsFav) {
            // Demander une confirmation avant de supprimer
            const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${countryName}" des favoris ?`);
            if (confirmed) {
                this.#storageModel.removeFav(countryName);
                this.#view.updateStarIcon(false, (name, isFav) => 
                    this.toggleFavorite(name, isFav)
                );
                this.refreshFavoritesList();
            }
        } else {
            // Ajouter aux favoris
            this.#storageModel.addFav(countryName);
            this.#view.updateStarIcon(true, (name, isFav) => 
                this.toggleFavorite(name, isFav)
            );
            this.refreshFavoritesList();
        }
    }

    /**
     * Attache les listeners pour les favoris (suppression, clic)
     * @private
     */
    attachFavoritesListeners() {
        // Les listeners sont attachés dynamiquement dans renderFavorites
        // car la liste change fréquemment
    }

    /**
     * Met à jour l'affichage de la liste des favoris
     * @private
     */
    refreshFavoritesList() {
        const favs = this.#storageModel.getFavs();

        this.#view.renderFavorites(
            favs,
            (countryName) => this.searchByCountry(countryName),
            (countryName) => this.removeFavoriteWithConfirm(countryName)
        );
    }

    /**
     * Lance une recherche pour un pays à partir des favoris
     * 
     * @param {string} countryName - Nom du pays à rechercher
     * @private
     */
    searchByCountry(countryName) {
        // Remplir le champ de recherche avec le nom du pays
        const searchInput = document.getElementById('input-search');
        if (searchInput) {
            searchInput.value = countryName;
            searchInput.dispatchEvent(new Event('input'));
        }

        // Lancer la recherche
        this.handleSearch();
    }

    /**
     * Supprime un favori avec confirmation
     * 
     * @param {string} countryName - Nom du pays à supprimer
     * @private
     */
    removeFavoriteWithConfirm(countryName) {
        const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${countryName}" des favoris ?`);
        if (confirmed) {
            this.#storageModel.removeFav(countryName);
            this.refreshFavoritesList();
        }
    }

    /**
     * Retourne l'instance de la vue (pour les tests)
     * 
     * @returns {DomView} L'instance de la vue
     */
    getView() {
        return this.#view;
    }

    /**
     * Retourne l'instance du modèle de données (pour les tests)
     * 
     * @returns {DataModel} L'instance du modèle
     */
    getDataModel() {
        return this.#dataModel;
    }

    /**
     * Retourne l'instance du modèle de stockage (pour les tests)
     * 
     * @returns {StorageModel} L'instance du modèle
     */
    getStorageModel() {
        return this.#storageModel;
    }
}

export default AppController;

