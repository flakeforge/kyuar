[← Contents](index.md) · [Oʻzbekcha](../uz/bot.md) · [Русский](../ru/bot.md)

# Telegram bot

- [What the bot does](#what-the-bot-does)
- [BotFather setup](#botfather-setup)
- [Commands](#commands)
- [Inline mode](#inline-mode)
- [Private chat](#private-chat)
- [Groups and Guest Chat Mode](#groups-and-guest-chat-mode)
- [Mini App links](#mini-app-links)
- [Webhook and polling](#webhook-and-polling)
- [Languages](#languages)

## What the bot does

The bot is written with grammY in `apps/bot`. In production it runs inside the web app: Telegram calls `POST /api/bot`, and grammY checks the `BOT_WEBHOOK_SECRET` header. In development it runs on its own with long polling.

| Where                     | Makes codes      | Reads codes                                |
| ------------------------- | ---------------- | ------------------------------------------ |
| Inline mode (`@bot text`) | Yes, in 8 themes | —                                          |
| Private chat              | Any text         | Any photo or image file                    |
| Group                     | —                | When mentioned, or with `/scan`            |
| Guest Chat Mode           | —                | When mentioned in a chat the bot is not in |

The handlers are registered in this order in `apps/bot/src/index.ts`: commands, inline, scan.

## BotFather setup

In [@BotFather](https://t.me/BotFather), for your bot:

1. **Main Mini App**: Bot Settings → Configure Mini App → Enable, and set the URL to `APP_URL`. Without it, `t.me/<bot>?startapp` links from groups open nothing.
2. **Inline mode**: `/setinline`, with a short placeholder such as `link or text`.
3. **Guest Chat Mode**: turn it on to read codes in chats where the bot is not a member.
4. **Group privacy** can stay on. With privacy on, the bot still gets messages that mention it and `/scan@bot`. A plain `/scan` is only delivered in some cases, for example when no other bot is active in the group. Turn privacy off if members should always be able to type `/scan`.

The command menu is not set by hand. `just dev` and `just webhook-set` publish it.

## Commands

| Command  | Private chat                                                                                                     | Group                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `/start` | Welcome and an "Open editor" button                                                                              | —                                         |
| `/scan`  | Reads the image in the message or in the replied message; with no image, shows help and an "Open scanner" button | Same, but the button is a `startapp` link |
| `/help`  | How to use the bot                                                                                               | Same                                      |

The menu is published in English (default), Uzbek and Russian with `setMyCommands` and `language_code`.

## Inline mode

`@bot <text>` in any chat returns up to 8 photo results, one per theme. Each result is a JPEG URL to `/api/qr`, because Telegram inline results cannot show SVG. The caption is the text, and an "Edit in kyuar" button opens the Mini App with the same text.

An empty query shows an "Open the kyuar editor" button instead of results. Results are cached for 60 seconds per user.

Text is classified first: an email becomes `mailto:`, a phone number in `+` format becomes `tel:`, and `WIFI:` strings stay as they are.

## Private chat

- **Text.** The bot replies with a QR photo in the default theme and an "Open editor" button that carries the text. Text over one code's capacity gets a short error. Text that starts with `/` is left to the command handlers.
- **Photo or image file.** The bot downloads the file (up to 10 MB), rotates and resizes it with sharp, and decodes it. The reply shows the content type, the content and link warnings. A link gets an "Open link" button, unless its scheme is unsafe. Every result gets a "Style this code" button.

Replies are plain text, so scanned content cannot inject formatting.

## Groups and Guest Chat Mode

In groups and supergroups the bot reads an image only when asked:

- Reply to a photo with `@bot` or `/scan`.
- Add `@bot` or `/scan` to a photo caption.

It ignores everything else, including plain text. It does not make QR codes from group messages.

With **Guest Chat Mode**, a user can mention the bot in a chat it is not in. Telegram sends a `guest_message` update, and the bot answers with `answerGuestQuery`: an article with the scan result. For this, `guest_message` must be in `allowed_updates`. `ALLOWED_UPDATES` in `apps/bot/src/config.ts` already includes it.

## Mini App links

| Link                              | Works in           | Used for                           |
| --------------------------------- | ------------------ | ---------------------------------- |
| `web_app` button to `APP_URL`     | Private chats only | "Open editor", "Open scanner"      |
| `APP_URL?data=<text>`             | Private chats only | Editor with text filled in         |
| `APP_URL?mode=scan`               | Private chats only | Opens on the Scan tab              |
| `t.me/<bot>?startapp=<base64url>` | Everywhere         | "Edit in kyuar", "Style this code" |
| `t.me/<bot>?startapp=scan`        | Everywhere         | "Open scanner" in groups           |

`web_app` buttons fail in groups and channels, so anything that can be forwarded uses `startapp`. Text that does not fit in a start parameter opens the editor empty.

## Webhook and polling

```bash
just webhook-set     # set APP_URL/api/bot, drop pending updates, publish commands
just webhook-info    # show status
just webhook-delete  # remove the webhook (asks first)
just bot             # long polling for development
```

`just bot` refuses to run while a webhook is set. This protects a production bot from a development machine. Use a separate bot for development.

## Languages

`botMessages(language_code)` in `apps/bot/src/i18n.ts` picks English, Uzbek or Russian. Any other language falls back to English. Uzbek uses the letters `ʻ` and `ʼ`, not ASCII quotes.

Next: [Deployment](deployment.md)
