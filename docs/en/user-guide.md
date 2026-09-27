[← Contents](index.md) · [Oʻzbekcha](../uz/user-guide.md) · [Русский](../ru/user-guide.md)

# User guide

For people who make and read QR codes with kyuar. No technical knowledge needed.

- [Three ways to make a code](#three-ways-to-make-a-code)
- [The editor](#the-editor)
- [Colors](#colors)
- [Logo and picture](#logo-and-picture)
- [Share and download](#share-and-download)
- [Reading codes](#reading-codes)
- [Reading codes in groups](#reading-codes-in-groups)
- [Link warnings](#link-warnings)
- [Tips for a code that always scans](#tips-for-a-code-that-always-scans)

## Three ways to make a code

1. **In any chat.** Type `@kyuarbot` and a link or text. Pick one of the colored codes that appear, and it is sent to the chat.
2. **In the bot chat.** Send the bot any text: a link, a phone number such as `+998901234567`, an email address. It replies with a code.
3. **In the editor.** Tap "Open editor" in the bot chat, or the button under any kyuar code. The editor is where you change colors and shapes.

## The editor

The code sits at the top. Type or paste text into the field under it, and the code updates as you type. When you scroll down, the code gets smaller but stays in view.

Each row opens a panel with choices:

| Row              | What it changes                                                      |
| ---------------- | -------------------------------------------------------------------- |
| Color            | Ready themes, or your own colors                                     |
| Border           | Empty space around the code: none, small, standard, large            |
| Corners          | Roundness of the background corners                                  |
| Pixels           | Shape of the small squares that hold the data                        |
| Corner frames    | Shape of the three big corner squares                                |
| Corner dots      | Shape of the dot inside each corner square                           |
| Alignment marks  | The small squares in larger codes, drawn like pixels or like corners |
| Error correction | How much damage the code survives. Higher is safer but denser        |
| Logo             | An image in the center                                               |
| Picture          | A photo drawn with the code itself                                   |

"Surprise me" picks a random style. If you do not like it, tap "Undo".

## Colors

- **Themes**: 12 ready color pairs that always scan.
- **Custom**: pick one main color, and kyuar makes the background and all other parts from it, with enough contrast to scan. "Dark background" flips it to light pixels on a dark background.
- **Advanced**: set the color of each part yourself, as a solid color or a gradient. If you change the main color afterwards, your per-part colors are replaced.

The color picker shows "Scans well" or "Too low to scan" as you move it.

## Logo and picture

- **Logo**: choose an image, then set its size. Error correction switches to maximum, because the logo covers part of the code.
- **Picture**: choose a photo. The code is drawn with tiny dots so the photo shows through. Adjust dot size and contrast until both the photo and the code are clear.

## Share and download

- **Share** (in Telegram): pick a chat, and the code is sent as a photo with a "Make your own" button.
- **Download**: choose a format.

| Format       | Best for                                         |
| ------------ | ------------------------------------------------ |
| PNG, 1024 px | Chats, screens, websites                         |
| PNG, 2048 px | Printing                                         |
| SVG          | Design tools and large prints; sharp at any size |

## Reading codes

Switch to **Scan** at the bottom of the editor.

- **Use camera**: opens the Telegram camera. Point it at a code.
- **From a photo**: pick a photo or a screenshot with a code in it.

The result shows what the code holds and the actions for it:

| Content           | Actions                                         |
| ----------------- | ----------------------------------------------- |
| Link              | Open link, copy                                 |
| Wi-Fi             | Network name, password, security; copy password |
| Contact           | Name, phone, email, organization                |
| Email, phone, SMS | The address or number and the message           |
| Location          | Open map                                        |
| Text              | Copy                                            |

"Make my own version" opens the same content in the editor. The last 20 scans are kept under "Recent scans". Inside Telegram they follow your account across devices.

You can also send a photo of a code straight to the bot chat, and it replies with what the code holds.

## Reading codes in groups

Add the bot to the group, then:

- reply to a photo with `@kyuarbot` or `/scan`, or
- write `@kyuarbot` in a photo's caption.

The bot replies to that photo with the result. It does not react to other messages.

If the bot is not in the group, you can still mention `@kyuarbot` in a reply to a photo. This works when the bot's Guest Chat Mode is on.

## Link warnings

kyuar checks every scanned link and warns when something looks wrong:

| Warning              | What it means                                                   |
| -------------------- | --------------------------------------------------------------- |
| Not a web link       | It could run something on your device. kyuar never opens it     |
| Not encrypted (http) | Others on the network can see or change the page                |
| Short link           | You cannot see where it really goes                             |
| Lookalike address    | Letters imitate another site's name, a common trick in phishing |
| Bare IP address      | The link has no site name                                       |
| Login and password   | The link carries a login and password                           |

A link with a warning asks for a second tap before it opens.

## Tips for a code that always scans

- Keep strong contrast. Dark pixels on a light background scan best.
- Keep a border. "Small" is the minimum for most phones.
- Short text makes a simpler code. Use a link instead of a long text.
- Check the "Scan test" under the code. It tests the design small, blurred and in dim light.
- Test a printed code with two different phones before printing many.

[← Contents](index.md)
