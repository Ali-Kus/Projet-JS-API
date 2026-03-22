import VuePays from "./views/VuePays.js";
import ControleurPays from "./controllers/ControleurPays.js";

const vue = new VuePays({
  idConteneur: "resultat-pays",
  selecteurFormulaire: ".recherche-form",
  selecteurChamp: ".champ-texte",
});

const controleur = new ControleurPays(vue);
controleur.init();
