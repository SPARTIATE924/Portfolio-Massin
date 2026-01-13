# massin

Site déployé (GitHub Pages): https://massin-aliouche.github.io/Portfolio-Massin/

---

## Documentation rapide

### Flux RSS (page `vt.html`)

- Le site agrège des flux RSS côté client et les affiche dans la section **Flux RSS & Actualités**.
- Les flux par défaut inclus : ZDNet (sécurité), The Hacker News, KrebsOnSecurity, Ars Technica.
- Pour ajouter un flux, modifie l'objet `FEEDS` dans `assets/js/main.js` (clé : id, propriété `url`) puis commit/push.
- Limitation CORS : les navigateurs bloquent habituellement les requêtes cross-origin vers certains flux. Le code utilise un proxy public : `https://api.allorigins.win/raw?url=` pour contourner, **mais** ce proxy peut être lent ou indisponible. Pour une solution fiable en production, il est recommandé de déployer un petit proxy côté serveur (Cloudflare Worker, Vercel Function, Netlify Function) qui renverra le contenu RSS.
- Le système met en cache les résultats dans `localStorage` (TTL 10 minutes) pour réduire les appels réseau.

### Thèmes & palettes

- Un **toggle** (soleil/lune) dans l'en-tête bascule entre le thème sombre par défaut et un thème **Bright**. La préférence est sauvegardée dans `localStorage`.
- J'ai ajouté deux **presets de palettes** : **Pastel** et **Vibrant**. Tu peux les choisir via le sélecteur de palettes dans l'en-tête (icônes couleurs). La sélection est persistée dans `localStorage`.
- Techniques : les thèmes/palettes appliquent des variables CSS au `:root` via des classes (`theme-bright`, `theme-pastel`, `theme-vibrant`).

### Déploiement

- Le site est déjà configuré pour GitHub Pages via `.github/workflows/deploy-pages.yml` (publish à chaque push sur `main`).
- Pour **Netlify** : ajout d'un fichier `netlify.toml` (présent dans le dépôt) ; tu peux utiliser un bouton **Deploy to Netlify** (manuellement depuis l'UI Netlify) pour créer un site avec previews branch par branch.

---

## Besoin d'aide ?

Dis-moi si tu veux que j'ajoute d'autres flux par défaut (ex: Le Monde Informatique, ZATAZ) ou que je déploie un proxy serverless pour garantir la disponibilité des RSS (je peux créer un Cloudflare Worker minimal en quelques minutes).
