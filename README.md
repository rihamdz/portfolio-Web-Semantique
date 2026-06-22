# Portfolio Web Sémantique — Riham Kaddour Bakir

**Cours : Web Sémantique (WSAIR2_2526)**
**Université Sorbonne Paris Nord — Sup Galilée**
**URL du site : [https://rihamdz.github.io/portfolio-Web-Semantique/](https://rihamdz.github.io/portfolio-Web-Semantique/)**

---

## Présentation

Ce portfolio personnel est conçu comme une démonstration concrète des technologies du **Web Sémantique** étudiées en cours. Il ne s'agit pas d'un simple site vitrine : chaque choix technique (format de données, annotation sémantique, multilingue) reflète les compétences acquises lors des travaux pratiques du module WSAIR2.

Le site est entièrement **statique** (HTML + CSS + JavaScript), sans serveur ni base de données. Les données sont stockées dans un fichier XML pivot (`portfolio.xml`) et rendues dynamiquement côté client via le DOM.

---

## Structure des fichiers

```
portfolio-Web-Semantique/
├── index.html          → Page principale avec annotations RDFa 1.1
├── style.css           → Feuille de styles (thème clair/sombre, RTL, responsive)
├── main.js             → Moteur de rendu JS : charge le XML, gère les langues, génère le HTML
├── portfolio.xml       → Source de données multilingue (fr / en / ar)
├── portfolio.dtd       → DTD de validation du XML
├── favicon.ico         → Icône du site
└── README.md           → Ce fichier
```

---

## Technologies du Web Sémantique utilisées

### XML / DTD
Le fichier `portfolio.xml` est la source de vérité unique du portfolio. Sa structure est inspirée du format **TMX 1.4** (Translation Memory eXchange), utilisé en localisation professionnelle : chaque bloc de contenu est identifié par un `id` et décliné par langue dans des balises `<translation lang="xx">`.

Le fichier `portfolio.dtd` valide la structure XML. Validation locale :

```bash
xmllint --dtdvalid portfolio.dtd --noout portfolio.xml
```

### RDFa 1.1
La page `index.html` et le HTML généré par `main.js` sont annotés en **RDFa 1.1**. Les préfixes de vocabulaires sont déclarés dans l'attribut `prefix` de `<html>` :

```html
<html lang="fr" prefix="
  schema: https://schema.org/
  foaf:   http://xmlns.com/foaf/0.1/
  dc:     http://purl.org/dc/elements/1.1/
">
```

Chaque section produit des triplets RDF :

| Section | `typeof` | Propriétés annotées |
|---------|----------|---------------------|
| Hero / Contact | `schema:Person` | `schema:name`, `schema:email`, `schema:telephone`, `schema:sameAs` |
| Expérience | `schema:OrganizationRole` | `schema:roleName`, `schema:description` |
| Projets | `schema:SoftwareSourceCode` | `schema:name`, `schema:description`, `schema:programmingLanguage` |
| TPs Web Sém. | `schema:LearningResource` | `schema:name`, `schema:description` |
| Vidéo | `schema:VideoObject` | `schema:name`, `schema:embedUrl` |

Vérification des triplets extraits : [https://validator.schema.org/](https://validator.schema.org/)

### Schema.org / FOAF / Dublin Core
Trois vocabulaires LOD sont combinés pour maximiser l'interopérabilité :

- **Schema.org** (`schema:`) — principal, optimisé pour les moteurs de recherche
- **FOAF** (`foaf:`) — identité de la personne
- **Dublin Core** (`dc:`) — métadonnées du document (titre, créateur, langue, date)

### Multilingue (fr / en / ar)
Le portfolio est disponible en **trois langues** dont une en alphabet non latin :

| Langue | Code | Direction |
|--------|------|-----------|
| Français | `fr` | LTR |
| English | `en` | LTR |
| العربية | `ar` | RTL (attribut `dir="rtl"` appliqué dynamiquement) |

La langue est stockée dans `localStorage` et restaurée à chaque visite. Tous les textes, y compris les `aria-label` et `title` des éléments interactifs, sont traduits.

### Unicode
Le fichier `portfolio.xml` est encodé en **UTF-8** (déclaré `<?xml version="1.0" encoding="UTF-8"?>`). Il contient des caractères arabes (alphabet non latin), des émojis (drapeaux, icônes de section) et des caractères spéciaux — tous traités sans transcodage grâce à l'encodage natif UTF-8 du navigateur.

---

## Travaux Pratiques mis en valeur

### TP3 — RDF, SPARQL et Corese
Modélisation de l'univers de *La Compagnie des Glaces* en **RDF/XML** :
- 4 classes (`Personnage`, `Ville`, `Train`, `Compagnie`) avec `rdfs:Class`, `rdfs:label`, `rdfs:comment`
- 7 propriétés avec `rdfs:domain` et `rdfs:range`
- 4 individus, 2 compagnies, 4 villes, 3 trains
- Visualisation du graphe en DOT/Graphviz
- 4 requêtes SPARQL dans Corese : `SELECT`, `OPTIONAL`, `FILTER`, `ORDER BY ASC`, tri numérique XSD

### TP4 — XML Schema, XSLT et Unicode
**Exercice 1 — Parlement Européen :**
- Schéma XSD complet (`parlement_europeen.xsd`) : 10 types simples (restrictions, énumérations, regex ISO 639/3166), 9 types complexes, 4 contraintes `xs:key`, 1 `xs:keyref`
- Document XML instance : séance du 14/01/2020, point 14, 8 interlocuteurs, 8 interventions
- Feuille XSLT 1.0 avec 3 clés XSLT pour jointures inter-éléments, rendu HTML fidèle au site europarl.europa.eu

**Exercice 2 — Unicode :**
- Implémentation **manuelle** (sans librairie) des algorithmes d'encodage UCS-4, UTF-8 et UTF-16 BE en Python
- Manipulation de bits (décalages `>>`, masques `&`, `|`)
- Calcul des paires de surrogates UTF-16 pour les points de code > U+FFFF
- Interface web avec coloration différenciée bits de structure / bits de données

### TP5 — RDFa 1.1 et Web Sémantique
Page HTML annotée en **RDFa 1.1** pour 6 personnages de BD franco-belge :
- Multi-vocabulaires : FOAF + Schema.org + DBpedia Ontology + Dublin Core
- Alignement LOD via `owl:sameAs` vers DBpedia (ex. `dbr:Tintin_(character)`)
- Tags de langue sur tous les littéraux (`@fr`, `@en`)
- Types XSD sur les valeurs temporelles (`"1929"^^xsd:gYear`)
- Sérialisation Turtle de vérification (`personnages.ttl`)
- 5 requêtes SPARQL sur l'endpoint DBpedia : `VALUES`, `OPTIONAL`, `FILTER(LANG(?x) = "fr")`, `owl:sameAs` inter-LOD
- Conformité aux bonnes pratiques W3C DWBP

---

## Lancement en local

Le JS utilise `fetch('portfolio.xml')`, ce qui nécessite un serveur HTTP (le protocole `file://` bloque les requêtes fetch par politique CORS).

```bash
# Python 3
python3 -m http.server 8000

# Node.js (si npx disponible)
npx serve .
```

Puis ouvrir : [http://localhost:8000](http://localhost:8000)

---

## Validation

| Technologie | Outil de validation | Statut |
|-------------|---------------------|--------|
| HTML5 | [validator.w3.org](https://validator.w3.org/) | ok |
| CSS3 | [jigsaw.w3.org/css-validator](https://jigsaw.w3.org/css-validator/) | ok |
| XML + DTD | `xmllint --dtdvalid portfolio.dtd --noout portfolio.xml` | ok |
| RDFa / Schema.org | [validator.schema.org](https://validator.schema.org/) | ok|
| Accessibilité | [wave.webaim.org](https://wave.webaim.org/) | ok  |

---

## Hébergement

Le site est déployé via **GitHub Pages** depuis la branche `main` du dépôt `rihamdz/portfolio-Web-Semantique`.

Toute modification poussée sur `main` est automatiquement déployée à l'URL :
[https://rihamdz.github.io/portfolio-Web-Semantique/](https://rihamdz.github.io/portfolio-Web-Semantique/)

---

## Ce qui a été remplacé par rapport à la version PHP initiale  ( pour faire un hbergement simple ) 

| Élément PHP | Remplacement statique |
|-------------|----------------------|
| `config.php` (gestion de langue) | `localStorage` + boutons de langue JS |
| `xml_loader.php` (chargement XML) | `fetch('portfolio.xml')` + `DOMParser` |
| `header.php` / `footer.php` | Intégrés directement dans `index.html` |
| `portfolio.xsl` (transformation) | Rendu dynamique par `main.js` |

---

## Auteure

**Riham Kaddour Bakir**
Étudiante ingénieure — Sup Galilée, Université Sorbonne Paris Nord
Alternance chez GRDF — Chargée de mission Systèmes Informatiques

[LinkedIn](https://www.linkedin.com/in/riham-kaddour-bakir) · [GitHub](https://github.com/riham-kb)
