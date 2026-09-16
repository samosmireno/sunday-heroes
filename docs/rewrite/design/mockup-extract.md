# Rebrand mockup: values and assets extracted from the PSD

_Extracted 2026-09-16 from `~/Documents/Sunday Heroes/SundayHeroes.psd` with psd-tools. Input for the frontend session (`13-frontend.md`). Nothing here is a decision; it records what the designer drew._

## The file

- 1920 × 1376 px canvas, 8-bit RGB, fully layered: every screen is a top-level group, every element a vector shape or a text layer. Only the grass texture and the player photo are pixels.
- Four screens: **Homepage**, **Players** (the Group-wide table), **Single player** (the Player page), **Zlatna lopta** (the competition page, an empty shell: a title band, the sticker card, a "Match results" panel and a "Stats" panel with nothing in them).
- Hidden layers worth knowing: an earlier vote callout as a green box with "Thank you for voting! / See your vote" and "You didn't vote! / Vote here" (`assets/starburst-voted.png`), a row of footballs used as a decoration (`assets/balls.png`), and a second sticker card design. The visible starburst has no voted state; the hidden green box is the only drawn one.
- Sizes below are canvas pixels. The screenshots you have seen are the canvas scaled to about 86%.

## Colours

Hex values read from the vector fills and the text runs, grouped by what they paint. Counts are how many shapes use the value.

| Role                                        | Hex                               | Uses        |
| ------------------------------------------- | --------------------------------- | ----------- |
| Sidebar, dark panel green                   | `#07361c`                         | 13          |
| Panel green (stat blocks, Performance)      | `#0c542c`                         | 19          |
| Light green (signed-in box, sticker accent) | `#42af36`                         | 19          |
| Grass base layer (flat, under the noise)    | `#42af36`                         |             |
| Grass as seen (base blended with noise)     | `#2d9724` / `#5cbe50`             |             |
| Mid green (match row tags)                  | `#359560`                         | 6           |
| Panel blue (Competitions, Top Players)      | `#3a3ab0`                         | 39          |
| Navy (table rows, score cells)              | `#091e40`                         | 16          |
| Navy 2, navy 3 (match rows)                 | `#0d2e63` / `#28477a`             | 24 / 25     |
| Deep blue (panel edge)                      | `#071349`                         | 15          |
| Blue dark (active row)                      | `#171775`                         | 2           |
| Orange-red (Latest Matches, sticker frame)  | `#f93a07`                         | 37          |
| Brand red (logo S box, active nav, buttons) | `#ed1c24`                         | 19          |
| Red (match row tags)                        | `#e72b2b`                         | 4           |
| Red dark (skew shadow)                      | `#c22900` / `#c23009`             | 3 / 1       |
| Coral (match row tags)                      | `#f55656`                         | 16          |
| Yellow (logo H box, stars, star band)       | `#f4e937`                         | 18          |
| Yellow light (Fun facts, footballs)         | `#faf15d`                         | 10          |
| Yellow dark (Fun facts edge)                | `#cec311`                         | 2           |
| Off-white (panel body, text on dark)        | `#f7f7f3`                         | 38          |
| Nav text, pale green                        | `#d7e6cc`                         | 16          |
| Muted text (dates, closed votes)            | `#bcc5ce`                         |             |
| Muted text 2 (match rows)                   | `#c7bebe`                         | 8           |
| Black, near-black, charcoal                 | `#000000` / `#161616` / `#212020` | 35 / 8 / 20 |

Pitch lines are `#f7f7f3` shapes at partial opacity over the grass. The grass is a flat `#42af36` layer under a black-and-white noise layer (`assets/grass-noise.png` is a 512 px crop of it, `assets/grass-tile.png` the flat layer); the visible result is the two blended, which is why the sampled greens differ from the fill.

## Type

Six families. Three are commercial and are not in the PSD; the app needs licences or substitutes for them.

| Family                   | Where                                                                                 | Licence     |
| ------------------------ | ------------------------------------------------------------------------------------- | ----------- |
| **Blackoak Std**         | Panel titles (Competitions, Top Players, Fun facts, Stats), the S and H of the logo   | Adobe Fonts |
| **Arial Narrow Bold**    | Big numerals, "Welcome, Cope!", the starburst, Latest Matches, names in tables, ranks | System      |
| **Arial Narrow**         | Sidebar nav, search placeholder                                                       | System      |
| **Arial / Arial Bold**   | Body copy, stat labels, column headers, buttons, the sticker card name                | System      |
| **Galano Grotesque Alt** | Match rows: scores, Home/Away, dates, tags (Medium, SemiBold, Bold)                   | Commercial  |
| **Druk Medium Italic**   | One hidden "Sunday Heroes" wordmark, tracking 270                                     | Commercial  |

Effective pixel sizes at the 1920 canvas (font size × the layer's transform):

| Element                               | Font                     | px    | Colour                                           |
| ------------------------------------- | ------------------------ | ----- | ------------------------------------------------ |
| Stat block numeral                    | Arial Narrow Bold        | 66    | `#f7f7f3`                                        |
| Page title ("Welcome, Cope!", "Cope") | Arial Narrow Bold        | 62    | `#3a3ab0` over a `#000000` offset copy           |
| Starburst copy                        | Arial Narrow Bold        | 41–52 | `#f7f7f3`                                        |
| Panel title, slab                     | Blackoak Std             | 29–30 | `#000000` on blue and yellow, `#f7f7f3` on green |
| Panel title, condensed                | Arial Narrow Bold        | 42    | `#f7f7f3`                                        |
| Sidebar nav item                      | Arial Narrow             | 31    | `#d7e6cc`                                        |
| Table name cell, rank                 | Arial Narrow Bold        | 25    | `#f7f7f3`, `#000000`                             |
| Table numerals                        | Arial Bold               | 25–28 | `#f7f7f3`                                        |
| Match row score, Home/Away, status    | Galano Grotesque Alt     | 28    | `#c7bebe`, `#f3e9e9`                             |
| Match row date and tag                | Galano Grotesque Alt     | 17    | `#c7bebe`                                        |
| Stat block label                      | Arial                    | 16–22 | `#f7f7f3`                                        |
| Body copy                             | Arial                    | 19–20 | `#000000`                                        |
| Column header                         | Arial                    | 17–19 | `#000000` on white, `#f7f7f3` on black           |
| Button label                          | Arial                    | 20    | `#f7f7f3`                                        |
| Sticker card name                     | Arial Narrow Bold        | 20    | `#000000`                                        |
| Logo "Sunday / Heroes"                | Arial Bold, tracking −25 | 23    | `#faf15d` / `#f93a07`                            |

## Layout and geometry

- **Sidebar** 285 px wide, `#07361c`, with a 1 px light edge. Logo block at (36, 47) to (252, 261). Nav items are 49 px tall; the active item is a full-width `#ed1c24` bar with a 12 px off-white tab at the left edge. "Add new Competition" is a 253 × 46 red bar; the signed-in box is a 288 × 88 light-green bar pinned to the bottom of the nav.
- **Content column** runs from x 406 to x 1801: a 121 px gutter after the sidebar. Two panel columns on the home page, 406–970 and 1012–1790, so a 42 px gap.
- **Panel** = a title bar plus a body, with a 12 px black or off-white tab at the left edge and a black offset shadow down and right.
- **Stat block**: 250 × 68, a solid number cell and a label cell split by a parallelogram edge skewed **21.5° from vertical**.
- **Match row**: 770 × 75, split into skewed cells at **15° to 18°**; the cell with the score is white in the active row.
- **Table row** (Top Players, Players page): the name cell is a parallelogram at **14.6°**, the rank cell a square, numerals on a `#091e40` bar.
- **Star band**: 1056 × 43, yellow stars on `#0c542c` (home) or red stars on `#faf15d` (Player and competition pages).
- **Sticker card**: 315 × 433 exported upright; on the canvas it is rotated about 4°, with an off-white card behind it as a shadow and a diagonal blue ribbon for the date.
- **Starburst**: 238 × 211, `#ed1c24` over a `#000000` offset copy, rotated text.

## Assets

All in `assets/`, PNG with transparency, at canvas size.

| File                      | What                                                 |
| ------------------------- | ---------------------------------------------------- |
| `logo.png`                | The SH logo with stars and the wordmark, 216 × 214   |
| `sticker-card.png`        | The player sticker with photo, ribbon and name plate |
| `star-band.png`           | The yellow star band from the home page              |
| `starburst-not-voted.png` | "You didn't vote!"                                   |
| `starburst-voted.png`     | The hidden earlier voted state, green box            |
| `stat-blocks-row.png`     | The four home page stat blocks                       |
| `button-add.png`          | "Add new Competition"                                |
| `balls.png`               | The hidden row of footballs                          |
| `grass-tile.png`          | The flat grass layer, 512 px crop                    |
| `grass-noise.png`         | The noise layer over it, same crop                   |
| `background-full.png`     | Grass, noise and pitch lines composited, full canvas |

Rendered screens are in `screens/`, one PNG per top-level group at 1920 × 1376.

## What the PSD does not give

- **Vectors.** Every shape is a vector in the file, but the export is raster. Resolved by the frontend session: every one of the 435 shapes is a solid-colour vector with a 1 px black stroke and no layer effects (the offset shadows are duplicate black shapes), so `tools/psd-to-svg.py` exports them as SVG from a throwaway venv with psd-tools; `assets/star.svg`, `star-band.svg`, `starburst.svg` and `logo-shapes.svg` are its output. The one thing a path export cannot carry is live text, the logo's S and H (Blackoak Std) and the wordmark, so the logo is `assets/logo.svg`, a trace of `logo.png` cleaned to the palette tokens and accepted as final. The parallelograms and bands are CSS.
- **Fonts.** Blackoak Std, Galano Grotesque Alt and Druk are not embedded. Settled in `13-frontend.md`: Ultra for Blackoak, Archivo Narrow for both Arial Narrow and Galano, the system sans for body copy; Druk dropped with the hidden wordmark.
- **A phone layout.** Nothing in the file is narrower than 1920.
- **New screens.** The four screens follow the current app's structure. See the frontend session for what changes.
