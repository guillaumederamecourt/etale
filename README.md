# Étale

Prévisions vent et vagues par spot, avec marée et coefficient, pour le kitesurf, le wingfoil et le surf. App web mobile-first, installable sur l'écran d'accueil (PWA).

- Vent multi-modèles (AROME/ARPEGE, ICON, IFS, UKMO, GFS) : médiane, direction moyenne, accord entre modèles.
- Vagues, période et houle.
- Heures de pleine et basse mer au spot, coefficient calculé à Brest.
- Note par heure (0 à 3) et meilleur créneau selon les réglages de chaque spot et de chaque sport.
- Compte facultatif (Supabase) pour synchroniser ses spots entre appareils.

## Installation

Node 22 ou plus récent.

```bash
npm install
cp .env.example .env   # facultatif : sans Supabase, l'app fonctionne en local
npm run dev
```

`npm run build` produit le site statique dans `dist/`.

## Configuration Supabase (facultatif)

Sans les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, l'app fonctionne entièrement en local : les spots sont gardés dans le navigateur et l'onglet Compte l'indique.

1. Créer un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** : exécuter `supabase/schema.sql` (table `spots`, RLS activée, une politique par opération limitée à `auth.uid() = user_id`).
3. **Authentication → Sign In / Providers → Email** : activer le fournisseur Email et la connexion par code (OTP). Longueur du code : 6.
4. **Authentication → Emails → Magic Link** : remplacer le lien par le code dans le modèle, par exemple :

   ```html
   <h2>Ton code Étale</h2>
   <p>Saisis ce code dans l'app : <strong>{{ .Token }}</strong></p>
   ```

   L'app n'utilise pas de lien magique : dans une PWA iOS, le lien s'ouvrirait dans Safari et non dans l'app installée.
5. **Authentication → URL Configuration** : ajouter l'URL GitHub Pages (`https://<utilisateur>.github.io/etale/`) en Site URL et dans les Redirect URLs.
6. **Project Settings → API** : copier l'URL du projet et la clé `anon` publique dans `.env` :

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

Synchronisation : à la connexion, les spots du compte sont chargés et les spots locaux (hors exemples) absents du compte y sont ajoutés. Ensuite chaque modification est envoyée immédiatement (upsert), une suppression supprime la ligne, l'ordre est stocké dans la colonne `position`.

## Déploiement (GitHub Pages)

Le workflow `.github/workflows/deploy.yml` construit et publie le site à chaque push sur `main`.

1. **Settings → Pages → Build and deployment → Source** : choisir « GitHub Actions ».
2. **Settings → Secrets and variables → Actions → Variables** : créer `SUPABASE_URL` et `SUPABASE_ANON_KEY` (variables, pas secrets : la clé anon est publique et protégée par la RLS). Sans elles, le site est déployé en mode local.
3. Pousser sur `main` ou lancer le workflow à la main (onglet Actions).

Le build utilise une base relative (`./`), le site fonctionne donc sous n'importe quel sous-chemin.

## Sources des données

Toutes les données viennent d'[Open-Meteo](https://open-meteo.com) (sans clé) :

- **Vent** : `api.open-meteo.com/v1/forecast`, modèles Météo-France (AROME/ARPEGE), DWD ICON, ECMWF IFS, Met Office UKMO et NOAA GFS, en nœuds. AROME ne couvre qu'environ 4,5 jours : au-delà, la médiane se fait sur les modèles restants. L'« accord » est l'écart entre le modèle le plus fort et le plus faible (≤ 4 nd bon, ≤ 8 nd moyen, au-delà faible).
- **Lever et coucher du soleil** : même API ; les notes ne sont données que de jour (lever − 30 min à coucher + 30 min).
- **Vagues, houle et niveau d'eau** : `marine-api.open-meteo.com/v1/marine`. Si le point du spot tombe sur la terre pour le modèle, l'app essaie des décalages de 0,05° à 0,2° et retient le premier point en mer.
- **Coefficient** : série du niveau d'eau toutes les 15 min à Brest. Pour chaque pleine mer, marnage = hauteur de PM − moyenne des basses mers voisines, coefficient = 16,85 × marnage, arrondi. Le modèle est en avance d'environ 50 min à Brest, les heures sont décalées en conséquence. Écart constaté : ± 4 par rapport à l'annuaire SHOM.
- **Recherche de lieux** : `geocoding-api.open-meteo.com`.

Les réponses sont gardées en cache dans le navigateur (30 min pour le vent, 60 min pour les données marines).

## Limites

- Les horaires de marée viennent d'un modèle global : hors de Brest, ils peuvent être décalés de 30 à 60 min par rapport à l'annuaire. Compare une fois avec [maree.shom.fr](https://maree.shom.fr) et renseigne la « correction horaire » du spot.
- Les hauteurs d'eau sont données par rapport au niveau moyen, pas au zéro des cartes.
- Le coefficient est une estimation calculée, pas le coefficient officiel du SHOM.
- **Étale n'est pas un outil de navigation.** Pour la sécurité en mer, utiliser les sources officielles (SHOM, Météo-France, bulletins côtiers).
