/**
 * Classe StorageModel - Gestion du LocalStorage pour les favoris
 * 
 * Responsabilités:
 * - Sauvegarder les pays favoris dans le LocalStorage du navigateur
 * - Récupérer la liste des favoris sauvegardés
 * - Ajouter/Supprimer un pays des favoris (sans doublons)
 * - Vérifier si un pays est dans les favoris
 */

class StorageModel {
    /**
     * Clé unique pour le stockage des favoris
     * @type {string}
     * @private
     */
    #STORAGE_KEY = 'census_favs';

    /**
     * Récupère la liste complète des favoris depuis le LocalStorage
     * 
     * @returns {Array<string>} Tableau des noms de pays favoris
     */
    getFavs() {
        try {
            const favs = localStorage.getItem(this.#STORAGE_KEY);
            return favs ? JSON.parse(favs) : [];
        } catch (error) {
            console.error('Erreur lors de la lecture des favoris:', error);
            return [];
        }
    }

    /**
     * Ajoute un pays aux favoris (sans doublons)
     * 
     * @param {string} countryName - Nom du pays à ajouter
     * @returns {boolean} true si l'opération a réussi, false si le pays était déjà en favori
     */
    addFav(countryName) {
        if (typeof countryName !== 'string' || countryName.trim() === '') {
            console.error('Nom de pays invalide');
            return false;
        }

        const favs = this.getFavs();
        const normalizedName = countryName.trim();

        // Vérifier si le pays est déjà en favori
        if (favs.includes(normalizedName)) {
            return false;
        }

        // Ajouter le nouveau favori
        favs.push(normalizedName);

        try {
            localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(favs));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des favoris:', error);
            return false;
        }
    }

    /**
     * Supprime un pays des favoris
     * 
     * @param {string} countryName - Nom du pays à supprimer
     * @returns {boolean} true si l'opération a réussi
     */
    removeFav(countryName) {
        if (typeof countryName !== 'string' || countryName.trim() === '') {
            return false;
        }

        let favs = this.getFavs();
        const initialLength = favs.length;

        // Filtrer le pays à supprimer
        favs = favs.filter(fav => fav !== countryName.trim());

        // Rien n'a changé
        if (favs.length === initialLength) {
            return false;
        }

        try {
            localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(favs));
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du favori:', error);
            return false;
        }
    }

    /**
     * Vérifie si un pays est dans les favoris
     * 
     * @param {string} countryName - Nom du pays à vérifier
     * @returns {boolean} true si le pays est favori
     */
    isFav(countryName) {
        if (typeof countryName !== 'string') {
            return false;
        }
        const favs = this.getFavs();
        return favs.includes(countryName.trim());
    }

    /**
     * Vide complètement les favoris (fonction de nettoyage)
     * 
     * @returns {boolean} true si l'opération a réussi
     */
    clearAllFavs() {
        try {
            localStorage.removeItem(this.#STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Erreur lors du nettoyage des favoris:', error);
            return false;
        }
    }
}

export default StorageModel;

