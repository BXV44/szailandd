# 🤖 SzailandBot — discord.gg/szailand

Bot Discord complet avec modération avancée, système de licences, commandes fun & utilitaires.

---

## 🚀 Mise en ligne sur Railway (via GitHub)

### Étape 1 — Mettre le projet sur GitHub

Ouvre un terminal dans le dossier du bot et exécute **ces 6 commandes** dans l'ordre :

```bash
git init
git add .
git commit -m "🤖 Initial commit – SzailandBot"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/TON_REPO.git
git push -u origin main
```

> Remplace `TON_USERNAME` et `TON_REPO` par ton vrai nom d'utilisateur et le nom de ton repo GitHub.
> Si tu n'as pas encore créé le repo, va sur https://github.com/new, crée-le (sans README), puis reviens ici.

---

### Étape 2 — Déployer sur Railway

1. Va sur **https://railway.app** et connecte-toi avec GitHub
2. Clique **New Project → Deploy from GitHub repo**
3. Sélectionne ton repo
4. Va dans l'onglet **Variables** et ajoute :

| Clé | Valeur |
|-----|--------|
| `TOKEN` | Le token de ton bot Discord |
| `CLIENT_ID` | L'ID de ton application Discord |

5. Railway va détecter `railway.toml` et lancer `node index.js` automatiquement ✅

---

### Étape 3 — Déployer les commandes slash (une seule fois)

Dans Railway, va dans **Settings → Deploy** et ajoute temporairement comme commande de démarrage :
```
node deploy-commands.js && node index.js
```
Lance le déploiement, puis remets `node index.js` une fois les slash déployées.

Ou plus simple : lance ça en local une fois avec ton `.env` rempli :
```bash
node deploy-commands.js
```

---

## 🔒 Système de Licences

Le bot ne fonctionne que sur les serveurs licenciés.  
**Rejoins discord.gg/szailand pour activer le bot sur ton serveur !**

Les owners gèrent les licences via :
- `+license add <guildid>`
- `+license remove <guildid>`
- `+license list`

---

## 📝 Commandes

### 🛡️ Modération (permissions mod requises)
| Commande | Description |
|----------|-------------|
| `+ban @user [raison]` | Bannir |
| `+kick @user [raison]` | Expulser |
| `+mute @user 10m [raison]` | Timeout (s/m/h/d) |
| `+unmute @user` | Retirer timeout |
| `+unban <ID>` | Débannir |
| `+warn @user <raison>` | Avertissement |
| `+warns @user` | Voir warns |
| `+clearwarns @user` | Effacer warns |
| `+clear <1-100>` | Supprimer messages |
| `+slowmode <sec>` | Slowmode |
| `+lock` / `+unlock` | Verrouiller salon |
| `+addrole` / `+removerole` | Gérer rôles |
| `+nick @user [surnom]` | Changer surnom |
| `+say <message>` | Faire parler le bot |

### ℹ️ Info
`+userinfo` `+serverinfo` `+botinfo` `+avatar` `+ping`

### 🔧 Utilitaires
`+help` `+poll` `+remind` `+calc`

### 🎉 Fun
`+8ball` `+coinflip` `+roll` `+rps` `+pp` `+roast`

### 👑 Owner only
`+license` `+eval` `+announce` `+setstatus` `+guilds` `+shutdown`

---

## 🤖 Auto-Modération
- **Anti-Raid** : alerte si 8+ joins en 10s
- **3 warns** → timeout 1h automatique
- **5 warns** → ban automatique
- **Logs** dans `#mod-logs`
- **Bienvenue** dans `#bienvenue`

---

*discord.gg/szailand*
