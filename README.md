# Portfolio statique

Cette version ne contient plus de PHP. Elle fonctionne avec :

- `index.html`
- `style.css`
- `main.js`
- `portfolio.xml`

## Test local
Important : comme le JS utilise `fetch('portfolio.xml')`, il faut lancer un petit serveur local.

```bash
python3 -m http.server 8000
```

Puis ouvrir :

```text
http://localhost:8000
```

## Hébergement
Tu peux héberger ce dossier sur GitHub Pages, Netlify ou Vercel.

## Ce qui a été remplacé
- `config.php` : remplacé par `localStorage` + boutons de langue JS.
- `xml_loader.php` : remplacé par `fetch('portfolio.xml')` + `DOMParser`.
- `header.php` et `footer.php` : intégrés directement dans `index.html`.
- `portfolio.xsl` : non nécessaire dans cette version, car le rendu HTML est fait par `main.js`.
