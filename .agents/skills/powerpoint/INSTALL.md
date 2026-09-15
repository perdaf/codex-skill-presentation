# PowerPoint Skill V4.6.1 candidate — installation et diagnostic

Cette couche opérationnelle installe une source physique unique de la skill. Codex et Antigravity utilisent chacun un lien symbolique vers le dossier cloné :

```text
repository/.agents/skills/powerpoint
                │
          SOURCE UNIQUE
            ┌───┴───┐
            ▼       ▼
         Codex   Antigravity
```

Les cibles sont :

- Codex : `~/.codex/skills/powerpoint`
- Antigravity : `~/.gemini/config/skills/powerpoint`

Aucune copie indépendante n'est créée. Le script ne supprime jamais automatiquement un vrai fichier ou dossier existant et ne remplace un mauvais symlink qu'après confirmation interactive.

## Nouvelle machine

```bash
git clone <REPOSITORY_URL>
cd <repository>/.agents/skills/powerpoint
chmod +x install.sh
./install.sh
```

L'installation valide la source, détecte Node/npm, installe uniquement les dépendances déclarées dans `package.json`, puis configure les deux runtimes. Avec un lockfile compatible, elle utilise `npm ci`; sinon, `npm install`.

Elle n'installe jamais Homebrew, LibreOffice, Swift, Firefox ou Chrome, ne modifie aucun profil shell et n'utilise pas `sudo`.

## Modes

Diagnostic en lecture seule :

```bash
./install.sh --check
```

Codex uniquement :

```bash
./install.sh --codex-only
```

Antigravity uniquement :

```bash
./install.sh --antigravity-only
```

Aide :

```bash
./install.sh --help
```

`--check` ne crée ni dossier, ni symlink, ni environnement virtuel, et n'installe rien. Son code de sortie vaut `0` uniquement lorsque les éléments obligatoires et les runtimes demandés sont prêts. Une dépendance optionnelle absente produit un avertissement.

## Dépendances

Obligatoires :

- Node.js 18 ou plus récent ;
- npm ;
- les dépendances déclarées par la skill, actuellement `pptxgenjs@4.0.1` ;
- pour la validation visuelle Web, au moins Firefox ou un navigateur compatible Chromium.

Optionnelles :

- LibreOffice, utilisé par `scripts/render-presentation.js` pour convertir PPTX en PDF ;
- Swift sur macOS, utilisé par le même script pour convertir le PDF en PNG ;
- Python 3 et PyYAML : aucun script Python n'est actuellement utilisé par la skill ;
- Chrome reste optionnel lorsque Firefox fournit le chemin de rendu Web.

Le moteur Web final reste autonome et hors ligne. Le navigateur détecté sert au rendu et à l'inspection, pas au fonctionnement réseau de la présentation.

### PyYAML et les validateurs externes

L'installateur vérifie le frontmatter de `SKILL.md` sans Python. Il ne crée donc pas `.venv/` et ne modifie jamais le Python système.

Si un validateur externe tel que `quick_validate.py` exige PyYAML, utiliser un environnement local :

```bash
cd <repository>/.agents/skills/powerpoint
python3 -m venv .venv
./.venv/bin/python -m pip install PyYAML
./.venv/bin/python <CHEMIN_DU_VALIDATEUR>/quick_validate.py .
```

`.venv/` est ignoré par Git. N'utilisez pas `sudo pip`.

## Mise à jour

La source est versionnée avec Git. Dans le dépôt :

```bash
git pull
cd .agents/skills/powerpoint
./install.sh --check
```

Les deux runtimes voient immédiatement la nouvelle source grâce aux symlinks. Une nouvelle session Codex ou Antigravity peut être nécessaire si le runtime a mis en cache la définition de la skill.

## Versions stables

Lister et inspecter les versions disponibles :

```bash
git tag --list "powerpoint-*"
git show <tag>
```

Avant de changer de version, vérifier que le dépôt ne contient pas de travail non enregistré :

```bash
git status
```

Pour examiner ou utiliser temporairement une version stable sans réécrire l'historique :

```bash
git switch --detach <tag>
cd .agents/skills/powerpoint
./install.sh
```

Pour revenir à la branche suivie :

```bash
git switch <branche>
cd .agents/skills/powerpoint
./install.sh --check
```

Ces commandes ne suppriment pas l'historique. Git refusera normalement le changement de branche si des modifications locales risquent d'être écrasées.

## Désinstallation

Vérifier d'abord que chaque chemin est bien un symlink :

```bash
ls -ld "$HOME/.codex/skills/powerpoint"
ls -ld "$HOME/.gemini/config/skills/powerpoint"
```

Puis supprimer uniquement les symlinks, jamais le dépôt source :

```bash
if [ -L "$HOME/.codex/skills/powerpoint" ]; then unlink "$HOME/.codex/skills/powerpoint"; fi
if [ -L "$HOME/.gemini/config/skills/powerpoint" ]; then unlink "$HOME/.gemini/config/skills/powerpoint"; fi
```

## Dépannage

### Codex et Antigravity voient des versions différentes

Lancer `./install.sh --check`. Le Doctor affiche la version et le chemin canonique de chaque runtime. Les deux chemins doivent être identiques au chemin `Source`. Un mauvais symlink n'est remplacé qu'en relançant l'installation de façon interactive et en confirmant son remplacement.

### `invalid SKILL.md` ou frontmatter YAML manquant

`SKILL.md` doit commencer par `---`, contenir `name: powerpoint` et `description: ...`, puis fermer le frontmatter par une seconde ligne `---`. Restaurer le fichier depuis Git ou revenir à un tag stable.

### Node ou npm absent

Installer une version maintenue de Node.js compatible avec macOS, puis relancer `./install.sh`. L'installateur n'installe jamais Node ou npm lui-même.

### PyYAML absent

PyYAML n'est pas requis par la skill actuelle. Il ne bloque que les validateurs Python externes qui l'importent. Utiliser la procédure `.venv/` ci-dessus si ce validateur est nécessaire.

### LibreOffice absent

La génération PPTX reste disponible, mais `scripts/render-presentation.js` ne peut pas produire le PDF et les PNG de contrôle. Installer LibreOffice séparément, sans attendre que l'installateur le fasse.

### Navigateur de validation absent

Installer séparément Firefox ou un navigateur compatible Chromium. Firefox suffit : Chrome n'est pas obligatoire. Sans navigateur pris en charge, la validation visuelle Web n'est pas prête.

### Symlink cassé ou incorrect

Le Doctor affiche le chemin existant, sa cible et la cible souhaitée. Pour un symlink incorrect, relancer `./install.sh` dans un terminal interactif et confirmer son remplacement. Pour un vrai fichier ou dossier, le déplacer manuellement avant de relancer ; le script ne le supprime jamais.

### Installation répétée

`./install.sh` est idempotent. Une deuxième exécution doit afficher les deux symlinks en `OK` et laisser la source ainsi que les liens inchangés.
