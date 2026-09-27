set dotenv-load := false
set shell := ["bash", "-uc"]
set script-interpreter := ["bash", "-euo", "pipefail"]

root := justfile_directory()
env_targets := "apps/web apps/bot packages/env"

[default]
[private]
list:
    @just --list --unsorted

alias d := dev
alias f := fix
alias c := check

[doc('Install dependencies and wire up environment files')]
[group('setup')]
setup: env install
    @echo ""
    @echo "Setup complete. Fill in .env, then run: just dev"

[doc('Create .env from the example and symlink it into every workspace package')]
[group('setup')]
[script]
env:
    cd "{{ root }}"
    if [ -f .env ]; then
        echo "  .env already exists, keeping it"
    else
        cp .env.example .env
        echo "  created .env from .env.example"
    fi
    for target in {{ env_targets }}; do
        mkdir -p "$target"
        link="$target/.env"
        if [ -L "$link" ]; then
            rm "$link"
        elif [ -e "$link" ]; then
            echo "  $link exists and is not a symlink, skipping" >&2
            continue
        fi
        depth=$(awk -F/ '{print NF}' <<< "$target")
        prefix=$(printf '../%.0s' $(seq 1 "$depth"))
        ln -s "${prefix}.env" "$link"
        echo "  linked $link -> ${prefix}.env"
    done

[doc('Install workspace dependencies and git hooks')]
[group('setup')]
install:
    pnpm install
    pnpm exec lefthook install

[doc('Print a random secret suitable for BOT_WEBHOOK_SECRET')]
[group('setup')]
secret:
    @node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"

[doc('Run the web app and the bot together')]
[group('dev')]
dev:
    pnpm dev

[doc('Run only the Next.js web app on :3000')]
[group('dev')]
web:
    pnpm --filter @kyuar/web dev

[doc('Run only the bot in long-polling mode')]
[group('dev')]
bot:
    pnpm --filter @kyuar/bot dev

[doc('Expose localhost:3000 over HTTPS so Telegram can reach the webhook')]
[group('dev')]
[script]
tunnel:
    if ! command -v cloudflared >/dev/null 2>&1; then
        echo "cloudflared is not installed: brew install cloudflared" >&2
        exit 1
    fi
    token="${CLOUDFLARE_TUNNEL_TOKEN:-}"
    if [ -z "$token" ] && [ -f "{{ root }}/.env" ]; then
        token=$(grep -E '^CLOUDFLARE_TUNNEL_TOKEN=' "{{ root }}/.env" | cut -d= -f2- | tr -d '"' || true)
    fi
    if [ -n "$token" ]; then
        echo "Starting named tunnel"
        cloudflared tunnel run --token "$token"
    else
        echo "CLOUDFLARE_TUNNEL_TOKEN is empty, falling back to a quick tunnel"
        cloudflared tunnel --url http://localhost:3000
    fi

[doc('Apply every automatic fix: oxlint --fix, then oxfmt')]
[group('quality')]
fix:
    pnpm exec oxlint --fix
    pnpm exec oxfmt

[doc('Everything that must pass before work is done')]
[group('quality')]
[parallel]
check: lint format-check typecheck doctor knip

[doc('Lint with oxlint, warnings are errors')]
[group('quality')]
lint:
    pnpm exec oxlint --deny-warnings

[doc('Verify formatting without writing files')]
[group('quality')]
format-check:
    pnpm exec oxfmt --check

[doc('Run tsc --noEmit in every workspace package')]
[group('quality')]
typecheck:
    pnpm -r typecheck

[doc('Run react-doctor on the web app')]
[group('quality')]
doctor:
    pnpm exec react-doctor

[doc('Run unit tests once')]
[group('quality')]
test *args:
    pnpm exec vitest run {{ args }}

[doc('Run unit tests in watch mode')]
[group('quality')]
test-watch *args:
    pnpm exec vitest {{ args }}

[doc('Add shadcn/ui components to packages/ui')]
[group('quality')]
ui-add +names:
    pnpm dlx shadcn@latest add {{ names }} -c apps/web

[doc('Find unused files, exports and dependencies')]
[group('quality')]
knip:
    pnpm exec knip

[doc('Production build of the web app')]
[group('build')]
build:
    pnpm build

[doc('Serve the production build')]
[group('build')]
start:
    pnpm start

[confirm('Delete every node_modules and build output?')]
[doc('Delete node_modules and build output everywhere')]
[group('build')]
clean:
    rm -rf node_modules apps/*/node_modules packages/*/node_modules
    rm -rf apps/*/.next apps/*/dist packages/*/dist

[arg('action', pattern='set|delete|info', help='set points it at APP_URL/api/bot')]
[doc('Manage the Telegram webhook')]
[group('telegram')]
webhook action="info":
    pnpm --filter @kyuar/bot webhook {{ action }}

[doc('Point the Telegram webhook at APP_URL and publish the command menu')]
[group('telegram')]
webhook-set: (webhook "set")

[confirm('Delete the webhook and drop pending updates?')]
[doc('Remove the webhook and drop pending updates')]
[group('telegram')]
webhook-delete: (webhook "delete")

[doc('Show the current webhook status')]
[group('telegram')]
webhook-info: (webhook "info")

[doc('Build the web image')]
[group('docker')]
docker-build:
    docker compose build

[doc('Start the stack in the background')]
[group('docker')]
docker-up:
    docker compose up -d

[doc('Stop and remove the stack')]
[group('docker')]
docker-down:
    docker compose down

[doc('Follow container logs, optionally for one service')]
[group('docker')]
docker-logs service="":
    docker compose logs -f {{ service }}
