# Contributing to SafeHer

How the team works together on Git and GitHub.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Final, stable release only |
| `develop` | Integration branch where finished features are merged |
| `feature/<initial>-<name>` | Your personal working branch |

Examples: `feature/A-backend-auth`, `feature/B-mobile-nav`, `feature/C-services-setup`.

Never commit directly to `main` or `develop`.

## Starting work

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<initial>-<name>
git push -u origin feature/<initial>-<name>
```

## Daily workflow

1. Start the day: `git checkout <your-branch>` and `git pull origin <your-branch>`.
2. Work and commit often (3 to 4 times a day).
3. Before committing, run `git status` and check that only the files you meant to change are listed.
4. End the day: `git push origin <your-branch>`.

## Commit messages

Use a short prefix that says what kind of change it is:

| Prefix | Use for |
|--------|---------|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation only |
| `chore:` | Setup or maintenance |

Examples: `feat: add emergency contacts routes`, `docs: update setup guide`.

## Never commit secrets

Do not commit `.env`, `firebase-key.json`, passwords, tokens, API keys, or connection strings. Do not put real values in `.env.example`.

- Stage files by name (`git add path/to/file`) instead of `git add -A`, so nothing unexpected is included.
- Read `git status` and `git diff` before every commit.
- If a secret is committed by mistake, rotate it immediately. Removing it from the file is not enough because it stays in Git history.

## Pull requests

1. Push your branch and open a pull request on GitHub: base `develop`, compare `<your-branch>`.
2. Write a description: what was implemented, what to test, and any known issues.
3. Assign a reviewer (one of the other two developers).
4. After approval, merge on GitHub, then update your local copy:

```bash
git checkout develop
git pull origin develop
```

## Code review checklist

- Code is readable and follows the project's conventions
- No `console.log` or debug code left in
- Error handling is present
- Complex logic has comments
- No hardcoded values or secrets (use `.env`)
- Commits are logical, not too big and not too small

## Merge conflicts

1. `git fetch origin`
2. `git merge origin/develop` (or rebase, if the team agrees)
3. Open the conflicting files, keep the correct version or combine both, then `git add <file>` and commit.
4. If it gets complicated, stop and ask a teammate before forcing anything.

Do not use `git push --force` on shared branches.