[← Содержание](index.md) · [English](../en/getting-started.md) · [Oʻzbekcha](../uz/getting-started.md)

# Начало работы

- [Требования](#требования)
- [Первый запуск](#первый-запуск)
- [Проверка в Telegram](#проверка-в-telegram)
- [Команды на каждый день](#команды-на-каждый-день)
- [Решение проблем](#решение-проблем)

## Требования

- Node.js 24 или новее
- pnpm 11 (версия закреплена в `package.json`)
- [just](https://just.systems)
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) — Telegram работает только с HTTPS, поэтому для локальной проверки нужен туннель
- Docker с Compose — только для стека, похожего на продакшен

## Первый запуск

1. Подготовьте проект:

   ```bash
   just setup
   ```

   Команда создаёт `.env` из `.env.example` (если его нет) и связывает `apps/web/.env`, `apps/bot/.env` и `packages/env/.env` с корневым файлом. Затем она ставит зависимости и git-хуки lefthook.

2. Создайте бота для разработки в [@BotFather](https://t.me/BotFather) и заполните `.env`:

   - `BOT_TOKEN` — токен от BotFather.
   - `BOT_WEBHOOK_SECRET` — не меньше 16 символов. Сгенерируйте его:

     ```bash
     just secret
     ```

   - `BOT_USERNAME` — имя бота без `@`.
   - `APP_URL` — пока `http://localhost:3000`. В следующем разделе он станет адресом туннеля.

   Для разработки используйте отдельного бота. Polling и webhook не могут работать одновременно, поэтому polling рабочего бота отключит его. Поэтому `just bot` не запускается, пока у бота есть webhook.

3. Запустите веб-приложение и бота вместе:

   ```bash
   just dev
   ```

   Веб-приложение работает на `http://localhost:3000`. Бот работает в режиме long polling и публикует меню команд.

## Проверка в Telegram

Mini App, inline-режиму и webhook нужен публичный HTTPS-адрес.

1. Во втором терминале:

   ```bash
   just tunnel
   ```

   Если `CLOUDFLARE_TUNNEL_TOKEN` пустой, открывается быстрый туннель с временным адресом `trycloudflare.com`. С токеном запускается ваш именованный туннель.

2. Укажите адрес туннеля в `APP_URL` и перезапустите `just dev`. `APP_URL` читается во время работы, поэтому пересборка не нужна.

3. Next.js блокирует запросы разработки с неизвестных хостов. Добавьте хост туннеля (без `https://`) в `allowedDevOrigins` в `apps/web/next.config.ts`.

4. Настройте бота в BotFather, как описано в разделе [Telegram-бот → Настройка BotFather](bot.md#настройка-botfather).

Чтобы проверить рабочий путь через webhook вместо polling, остановите `just dev`, запустите `just web`, затем:

```bash
just webhook-set
```

## Команды на каждый день

Запустите `just`, чтобы увидеть все рецепты, сгруппированные по назначению.

| Команда                 | Что делает                                                                        |
| ----------------------- | --------------------------------------------------------------------------------- |
| `just dev` (`just d`)   | Веб-приложение и бот вместе                                                       |
| `just web` / `just bot` | Только одно из них                                                                |
| `just tunnel`           | HTTPS-туннель к `localhost:3000`                                                  |
| `just fix` (`just f`)   | oxlint `--fix`, затем oxfmt                                                       |
| `just check` (`just c`) | Линтер, проверка форматирования, проверка типов, react-doctor и knip, параллельно |
| `just test`             | Юнит-тесты (vitest)                                                               |
| `just ui-add <name>`    | Добавить компонент shadcn/ui в `packages/ui`                                      |
| `just webhook info`     | Статус webhook (`set`, `delete` тоже работают)                                    |
| `just build`            | Продакшен-сборка веб-приложения                                                   |

Перед коммитом `just fix` и `just check` должны проходить. Сообщения коммитов следуют Conventional Commits. commitlint проверяет их в git-хуке, а pre-push запускает `just check` и `just test`.

## Решение проблем

- **Бот пишет, что переменные окружения неверны.** В `.env` не хватает значения, или файл не связан. Запустите `just env` и сверьте имена с `.env.example`.
- **Бот не запускается: "This bot has a webhook".** Ботом владеет другой процесс. Используйте бота для разработки или запустите `just webhook-delete`, если вы действительно хотите забрать его.
- **Mini App открывает пустую страницу в Telegram.** `APP_URL` должен быть HTTPS-адресом туннеля, и в BotFather Main Mini App должен указывать на тот же адрес.
- **Кнопки в группах ничего не делают.** В BotFather не включён Main Mini App, поэтому ссылкам `t.me/<bot>?startapp` некуда вести.

Далее: [Архитектура](architecture.md)
