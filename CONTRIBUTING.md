# Contributing to kyuar

Thanks for helping. This file covers the workflow. The code rules are in
[AGENTS.md](AGENTS.md), and they apply to people too.

## Setup

Requirements and the first run are in
[docs/en/getting-started.md](docs/en/getting-started.md). In short:

```sh
just setup    # .env, dependencies, git hooks
just dev      # web app and bot
```

Use your own development bot. Never commit `.env`.

## Before you open a pull request

```sh
just fix
just check
just test
```

All three must pass. CI runs `just check`, `just test` and a Docker build on
every pull request.

- Bug fixes come with a regression test when the code is testable.
- A new QR shape must pass the decoder test in `packages/qr/src/render.test.ts`.
  A shape that does not scan is removed, not shipped.
- UI text goes into all three locales at once: `apps/web/src/i18n/{en,uz,ru}.ts`
  for the Mini App, `apps/bot/src/i18n.ts` for the bot.
- Code copied or ported from another project is credited in
  `THIRD_PARTY_NOTICES.md` and in the README.

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org).
commitlint checks them in a git hook.

```text
feat(web): add a gradient angle control
fix(bot): reply in groups only when mentioned
```

Scopes: `web`, `bot`, `qr`, `ui`, `shared`, `env`, `docker`, `deps`. Keep the
body short or leave it out. The changelog for each release is generated from
these messages, so write them for a reader.

Pull requests are squash-merged.

## Releases

Push a tag such as `v0.2.0` on `main`. The release workflow builds the notes
from the commits since the previous tag and publishes the GitHub release.

## License

kyuar is licensed under AGPL-3.0-only. By contributing, you agree that your
contribution is licensed under the same terms.
