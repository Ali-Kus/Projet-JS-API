# Projet-JS-API+

Ce projet utilise plusieurs APIs publiques pour recuperer des infos pays.

## Rest Countries API (restcountries.com)

**A quoi ca sert :** informations generales sur les pays.
**Ce que ca peut donner :** nom, drapeau, capitale, region, langues, monnaies, superficie, etc.

Exemples :

- Un pays par nom : https://restcountries.com/v3.1/name/peru
- Nom + drapeau pour tous les pays : https://restcountries.com/v3.1/all?fields=name,flags
- Pays par monnaie : https://restcountries.com/v3.1/currency/EUR

## World Bank API (api.worldbank.org)

**A quoi ca sert :** indicateurs economiques et demographiques.
**Ce que ca peut donner :** population, PIB, esperance de vie, etc.

Exemple :

- Population totale (tous pays, annee 2000) :
  https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2000

## Notes

- Les donnees varient selon les pays et les endpoints.
- Toujours verifier les champs optionnels (certains peuvent etre absents).

https://restcountries.com/v3.1/name/peru

**Population, total**
https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2000
