/**
 * Classe DomView - Gère l'affichage et les interactions DOM
 * 
 * Responsabilités:
 * - Afficher les résultats de la recherche dans le DOM
 * - Gérer le rendu des données de pays
 * - Afficher/masquer les favoris
 * - Gérer l'affichage du loader et des erreurs
 * - Unique point de contact avec le document HTML
 */

class DomView {
    /**
     * Références aux éléments DOM importants
     * @type {Object}
     * @private
     */
    #elements = {
        inputSearch: document.getElementById('input-search'),
        btnSearch: document.getElementById('btn-search'),
        loaderContainer: document.getElementById('bloc-gif-attente'),
        resultsContainer: document.getElementById('results-container'),
        errorContainer: document.getElementById('error-container'),
        errorMessage: document.getElementById('error-message'),
        favoritesList: document.getElementById('favorites-list'),
        emptyFavoritesMsg: document.getElementById('empty-favorites-msg'),
        noResultsMsg: document.getElementById('no-results-msg')
    };

    constructor() {
        // Initialisation des états
        this.currentCountryName = null;
        this.attachEventListeners();
    }

    /**
     * Attache les event listeners pour le formulaire
     * @private
     */
    attachEventListeners() {
        // Activation du bouton quand le champ a du texte
        this.#elements.inputSearch?.addEventListener('input', () => {
            this.updateSearchButtonState();
        });

        // Recherche au clic du bouton
        this.#elements.btnSearch?.addEventListener('click', () => {
            this.getSearchInput();
        });

        // Recherche au clic de la touche Entrée
        this.#elements.inputSearch?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.#elements.btnSearch?.disabled) {
                this.getSearchInput();
            }
        });
    }

    /**
     * Met à jour l'état du bouton de recherche
     * @private
     */
    updateSearchButtonState() {
        const hasText = this.#elements.inputSearch?.value.trim().length > 0;
        if (this.#elements.btnSearch) {
            this.#elements.btnSearch.disabled = !hasText;
        }
    }

    /**
     * Récupère l'entrée de l'utilisateur dans le champ de recherche
     * 
     * @returns {string} La valeur du champ de recherche
     */
    getSearchInput() {
        const input = this.#elements.inputSearch?.value.trim() || '';
        return input;
    }

    /**
     * Efface le champ de recherche
     */
    clearSearchInput() {
        if (this.#elements.inputSearch) {
            this.#elements.inputSearch.value = '';
            this.updateSearchButtonState();
        }
    }

    /**
     * Affiche/masque le loader d'attente
     * 
     * @param {boolean} show - true pour afficher, false pour masquer
     */
    toggleLoader(show) {
        if (!this.#elements.loaderContainer) return;

        if (show) {
            this.#elements.loaderContainer.classList.remove('hidden');
        } else {
            this.#elements.loaderContainer.classList.add('hidden');
        }
    }

    /**
     * Affiche un message d'erreur à l'utilisateur
     * 
     * @param {string} message - Le message d'erreur à afficher
     */
    showError(message) {
        if (!this.#elements.errorContainer || !this.#elements.errorMessage) return;

        this.#elements.errorMessage.textContent = message;
        this.#elements.errorContainer.classList.remove('hidden');

        // Masquer automatiquement après 5 secondes
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    /**
     * Masque le message d'erreur
     * @private
     */
    hideError() {
        if (this.#elements.errorContainer) {
            this.#elements.errorContainer.classList.add('hidden');
        }
    }

    /**
     * Affiche les résultats de la recherche
     * 
     * @param {Object} data - Les données du pays { name, population, year, birthRate, deathRate }
     * @param {boolean} isFav - Si le pays est en favori
     * @param {Function} onStarClick - Callback pour le clic sur l'étoile
     * @param {Function} onFavClick - Callback pour le clic sur le nom (favoris)
     */
    renderResults(data, isFav = false, onStarClick = null, onFavClick = null) {
        if (!this.#elements.resultsContainer) return;

        // Stockage du nom du pays actuel pour le rendu des favoris
        this.currentCountryName = data.name;

        const starSymbol = isFav ? '★' : '☆';
        const starClass = isFav ? 'star-full' : 'star-empty';

        const resultHTML = `
            <div class="result-card">
                <div class="result-info">
                    <div class="result-country-name">${this.#escapeHTML(data.name)}</div>
                    <div class="result-stats">
                        <div class="result-population">
                            Population: <strong>${data.population}</strong> habitants
                        </div>
                        <div class="result-year">Année: ${data.year}</div>
                        ${data.birthRate !== undefined ? `
                        <div class="result-birth-rate">
                            Taux de natalité: <strong>${data.birthRate}‰</strong>
                        </div>
                        ` : ''}
                        ${data.deathRate !== undefined ? `
                        <div class="result-death-rate">
                            Taux de mortalité: <strong>${data.deathRate}‰</strong>
                        </div>
                        ` : ''}
                        ${data.births !== undefined ? `
                        <div class="result-births">
                            Naissances estimées: <strong>${data.births}</strong>
                        </div>
                        ` : ''}
                        ${data.deaths !== undefined ? `
                        <div class="result-deaths">
                            Décès estimés: <strong>${data.deaths}</strong>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="result-actions">
                    <button 
                        class="star-btn ${starClass}" 
                        data-country="${this.#escapeHTML(data.name)}"
                        aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
                        title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
                    >
                        ${starSymbol}
                    </button>
                </div>
            </div>
        `;

        this.#elements.resultsContainer.innerHTML = resultHTML;

        // Attacher le listener au bouton étoile
        if (onStarClick) {
            const starBtn = this.#elements.resultsContainer.querySelector('.star-btn');
            starBtn?.addEventListener('click', (e) => {
                onStarClick(data.name, isFav);
            });
        }

        // Masquer le message "Aucun résultat"
        if (this.#elements.noResultsMsg) {
            this.#elements.noResultsMsg.style.display = 'none';
        }
    }

    /**
     * Affiche un message d'absence de résultats
     */
    showNoResults() {
        if (!this.#elements.resultsContainer || !this.#elements.noResultsMsg) return;

        this.currentCountryName = null;
        this.#elements.resultsContainer.innerHTML = '';
        this.#elements.noResultsMsg.style.display = 'block';
        this.#elements.noResultsMsg.textContent = 'Aucun résultat trouvé';
    }

    /**
     * Met à jour l'icône de l'étoile pour le pays actuel
     * 
     * @param {boolean} isFav - true si le pays est maintenant favori
     * @param {Function} onStarClick - Callback pour les clics futurs
     */
    updateStarIcon(isFav, onStarClick = null) {
        const starBtn = this.#elements.resultsContainer?.querySelector('.star-btn');
        if (!starBtn) return;

        const starSymbol = isFav ? '★' : '☆';
        const newClass = isFav ? 'star-full' : 'star-empty';
        const oldClass = isFav ? 'star-empty' : 'star-full';
        const ariaLabel = isFav ? 'Retirer des favoris' : 'Ajouter aux favoris';

        starBtn.textContent = starSymbol;
        starBtn.classList.remove(oldClass);
        starBtn.classList.add(newClass);
        starBtn.setAttribute('aria-label', ariaLabel);
        starBtn.setAttribute('title', ariaLabel);

        // Réattacher le listener si fourni
        if (onStarClick) {
            starBtn.onclick = null;
            starBtn.addEventListener('click', (e) => {
                if (this.currentCountryName) {
                    onStarClick(this.currentCountryName, isFav);
                }
            });
        }
    }

    /**
     * Affiche la liste des pays favoris dans la sidebar
     * 
     * @param {Array<string>} favoritesList - Liste des pays favoris
     * @param {Function} onFavClick - Callback au clic sur un favori
     * @param {Function} onDeleteClick - Callback au clic sur la croix
     */
    renderFavorites(favoritesList, onFavClick = null, onDeleteClick = null) {
        if (!this.#elements.favoritesList || !this.#elements.emptyFavoritesMsg) return;

        // Si la liste est vide
        if (!favoritesList || favoritesList.length === 0) {
            this.#elements.favoritesList.innerHTML = '';
            this.#elements.emptyFavoritesMsg.style.display = 'block';
            return;
        }

        // Masquer le message vide
        this.#elements.emptyFavoritesMsg.style.display = 'none';

        // Créer les éléments de favori
        const favsHTML = favoritesList
            .map(countryName => `
                <div class="favorites-item" data-country="${this.#escapeHTML(countryName)}">
                    <span class="fav-country-name">${this.#escapeHTML(countryName)}</span>
                    <button 
                        class="fav-delete-btn" 
                        data-country="${this.#escapeHTML(countryName)}"
                        aria-label="Supprimer ${this.#escapeHTML(countryName)} des favoris"
                        title="Supprimer des favoris"
                    >
                        ⨷
                    </button>
                </div>
            `)
            .join('');

        this.#elements.favoritesList.innerHTML = favsHTML;

        // Attacher les listeners
        if (onFavClick) {
            this.#elements.favoritesList.querySelectorAll('.fav-country-name').forEach(elem => {
                elem.style.cursor = 'pointer';
                elem.addEventListener('click', (e) => {
                    const countryName = e.currentTarget.parentElement.dataset.country;
                    onFavClick(countryName);
                });
            });

            // Alternative: clic sur l'item complet
            this.#elements.favoritesList.querySelectorAll('.favorites-item').forEach(elem => {
                elem.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('fav-delete-btn')) {
                        const countryName = elem.dataset.country;
                        onFavClick(countryName);
                    }
                });
            });
        }

        if (onDeleteClick) {
            this.#elements.favoritesList.querySelectorAll('.fav-delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const countryName = btn.dataset.country;
                    onDeleteClick(countryName);
                });
            });
        }
    }

    /**
     * Échappe les caractères HTML pour éviter les injections XSS
     * 
     * @param {string} text - Texte à échapper
     * @returns {string} Texte échappé
     * @private
     */
    #escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Définit un callback pour quand l'utilisateur lance une recherche
     * 
     * @param {Function} callback - Fonction(searchTerm) appelée à la recherche
     */
    onSearch(callback) {
        if (this.#elements.btnSearch) {
            this.#elements.btnSearch.addEventListener('click', () => {
                const searchTerm = this.getSearchInput();
                if (searchTerm) {
                    callback(searchTerm);
                }
            });
        }

        if (this.#elements.inputSearch) {
            this.#elements.inputSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const searchTerm = this.getSearchInput();
                    if (searchTerm) {
                        callback(searchTerm);
                    }
                }
            });
        }
    }
}

export default DomView;
