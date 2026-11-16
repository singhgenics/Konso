---
name: Konso
description: The pre-launch site for Konso (Pan Asian Kitchen | Pub, Cavelossim) in the Konso brand kit only, bottle green, gold foil and cream.
colors:
  bottle-green: "#051C0A"
  konso-green: "#0B2A14"
  gold: "#D89D3C"
  gold-hi: "#F0BE62"
  gold-lo: "#AA7A28"
  cream: "#F2E8D2"
  veg-green: "#2E7D32"
  nonveg-brown: "#8B3A1A"
  chilli: "#B5321C"
gradients:
  gold-foil: "linear-gradient(180deg, #EBB85B, #E2AA4A, #DA9F3E, #D49739, #D19333)"
typography:
  display:
    fontFamily: "Prata, Georgia, serif"
    fontSize: "clamp(4.5rem, 12vw, 9.5rem)"
    fontWeight: 400
    lineHeight: 0.85
    textTransform: uppercase
  headline:
    fontFamily: "Prata, Georgia, serif"
    fontSize: "clamp(1.7rem, 2.4vw, 2.2rem)"
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontWeight: 600
    letterSpacing: "0.16em to 0.18em"
    textTransform: uppercase
  price:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontWeight: 500
    note: "Prata's old-style figures are swapped for Montserrat digits through the PrataN face"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  station: "clamp(56px, 8vw, 120px)"
  touch: "48px"
components:
  button-ink: { backgroundColor: "{colors.bottle-green}", textColor: "{colors.cream}", hover: "gold face, green label" }
  button-hero: { backgroundColor: "{colors.gold}", textColor: "{colors.bottle-green}" }
  button-line: { backgroundColor: transparent, border: "2px currentColor", hover: "green face, cream label" }
  rail: { backgroundColor: "{colors.bottle-green}", logo: "kit wordmark, gold foil, tightly cropped", links: "{colors.cream}" }
  sticker-gold: { background: "{gradients.gold-foil}", textColor: "{colors.bottle-green}", use: "happy hour, Opening soon seal" }
  bill-cream: { backgroundColor: "{colors.cream}", textColor: "{colors.bottle-green}" }
  tag: { backgroundColor: "{colors.gold}", textColor: "{colors.bottle-green}", use: "Goa, Signature, Bestseller" }
  link-on-cream: { textColor: "{colors.bottle-green}", accent: "{colors.gold-lo} arrow and underline" }
  link-on-green: { textColor: "{colors.gold}" }
---

# Design System: Konso

The site wears the Konso brand kit and nothing else (owner's decision, 2026-11-16, after a side-by-side preview against the older room palette). The kit lives in `Garden/web/brand-kit/` (tokens in `konso-tokens.css` and `brand-tokens.json`, logos in `logo/`, fonts in `fonts/`).

How it is built: `assets/site.css` holds layout, components and motion; `assets/brandkit.css`, loaded after it, maps every colour to the kit and removes the old wood and paper textures. Change colours in `brandkit.css`, not in `site.css`.

## Colours

Four kit colours carry the whole site:

- **Bottle green `#051C0A`**: the top rail, hero, footer, the Bar section, the deals and Find us boards, all body text and headings on cream, ink buttons.
- **Konso green `#0B2A14`**: the second green. Tap cards, the story map, the dish cards on the Bar band, the edges of the scene glows.
- **Gold foil `#D89D3C`** (gradient `#EBB85B` to `#D19333`; highlight `#F0BE62`, shadow `#AA7A28`): the wordmark, headings on green, stickers (happy hour, Opening soon), tags, prices on green, the scroll progress bar, the main hero button.
- **Cream `#F2E8D2`**: the page, the paper cards and bills, text on green.

Only three things keep their own colours, on purpose: the green and brown veg / non-veg squares (an FSSAI requirement), and the red chilli heat icons.

**Contrast rule.** Gold on cream is about 3:1, too low for small text. On cream, links are bottle green with a gold-lo arrow and underline; gold text is used only on green, or at display size. Lighthouse accessibility is 100 on both pages (2026-11-16).

## Type

- **Prata** for every heading and station word (STEAM, BAR, WOK, THE MENU), uppercase at display size, sentence case below.
- **Montserrat** for reading text, labels (uppercase, tracked), buttons and prices. Prices use Montserrat digits even inside Prata headings, through the `PrataN` face (Prata's old-style figures read badly as prices).
- The **wordmark is artwork**, never typed: `assets/brand/konso-wordmark-gold.svg` in the hero, the tightly cropped `konso-wordmark-gold-tight.svg` in the rail, and `konso-lockup-gold.svg` (with "Pan Asian Kitchen | Pub") in the footer.

## Page

Order: hero (steaming bao video), headline strip (Dim sum. Bao. Bottled beer. Craft cocktails.), **Steam** (dim sum scene, dim sum cards, bao scene, bao cards), **Bar** (cocktail scene, bottled beer, craft cocktails), deals board, story, wok, garden, Find us. The full menu is its own page, `menu.html`, under Menu in the rail.

## Scroll scenes

Three pinned, full-bleed scenes: a dim sum basket, a bao and a kokum feni sour that pull apart and come together as you scroll, then dissolve into the finished dish. Each has its own kit shade so you feel the move from one to the next: dim sum in deep green with a warm gold glow, bao in the darkest bottle green, the cocktail in Konso green under a stronger gold spotlight. Each scene fades in from the page colour and back out into it (no hard colour cut).

Rules that keep them lag-free (measured 60 fps, no long tasks, desktop and phone):
- Positions are measured on load and resize only; scrolling reads no layout.
- Only `transform` and `opacity` change while scrolling.
- A scene's pictures load only as it comes within about two screens, and it shows once they have all decoded.
- Reduced motion and `?still` show the scenes as static stacks.

## Motion and loading

Motion plays once: cards and photos settle in on first view, lists stagger in, video clips play only while on screen. The hero poster is preloaded; every other video poster is set only as its clip comes near. Lighthouse on a phone profile (2026-11-16): home 95 performance, menu page 95, both 100 accessibility, best practices and SEO.

## Do and don't

- **Do** take every colour from the four kit colours; add a tint of one of them before adding anything new.
- **Do** keep the veg / non-veg marks and chillies in their own colours.
- **Do** use the kit SVG logos; never retype "Konso".
- **Don't** bring back the room palette (brick, burgundy, Goa blue, bougainvillea, cognac) on the website; it belongs to the restaurant's interior.
- **Don't** put small gold text on cream.
- **Don't** animate layout or paint properties in the scroll scenes.

## History

The site began as a red plywood "hoarding" (Cabin East, October 2026), moved to the garden-decor room palette on 2026-10-29, and to the Konso brand kit on 2026-11-16. The old palette notes live in git history; the older rules at the end of `site.css` are overridden by `brandkit.css`, not deleted.
