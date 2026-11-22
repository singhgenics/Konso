---
name: Konso
description: Pre-launch site for Konso, Pan Asian Kitchen | Bar, Cavelossim. A dark bottle-green room where the food is the only light.
colors:
  bottle-green: "#06180D"
  ground-edge: "#041209"
  ground-pool: "#103E20"
  bar-scrim: "rgba(5,28,10,.92)"
  steam-cream: "#F2E8D2"
  quiet-cream: "#CFC4A8"
  gold-foil: "#D89D3C"
  gold-highlight: "#F0BE62"
typography:
  display:
    fontFamily: "Prata, Georgia, serif"
    fontSize: "clamp(52px, 7vw, 120px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  display-poster:
    fontFamily: "Prata, Georgia, serif"
    fontSize: "clamp(88px, 15vw, 240px)"
    fontWeight: 400
    lineHeight: 0.85
    letterSpacing: "-0.03em"
  display-place:
    fontFamily: "Prata, Georgia, serif"
    fontSize: "clamp(64px, 15.4vw, 260px)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  headline-dish:
    fontFamily: "Prata, Georgia, serif"
    fontSize: "clamp(64px, 11.5vw, 200px)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Prata, Georgia, serif"
    fontSize: "clamp(40px, 5vw, 80px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Prata, Georgia, serif"
    fontSize: "clamp(20px, 1.7vw, 26px)"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(16px, 1.15vw, 18px)"
    fontWeight: 400
    lineHeight: 1.65
  body-lead:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.65
  label:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    letterSpacing: "0.18em"
  label-tab:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.14em"
rounded:
  focus: "2px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 3.2vw, 48px)"
  bar-y: "18px"
  nav-gap: "clamp(18px, 2.4vw, 40px)"
  glass-gap: "clamp(12px, 2.4vw, 40px)"
components:
  menu-tab:
    backgroundColor: "{colors.gold-foil}"
    textColor: "{colors.bottle-green}"
    typography: "{typography.label-tab}"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  menu-tab-hover:
    backgroundColor: "{colors.gold-highlight}"
    textColor: "{colors.bottle-green}"
  nav-link:
    textColor: "{colors.steam-cream}"
    typography: "{typography.label}"
    padding: "10px 0"
  nav-link-hover:
    textColor: "{colors.gold-highlight}"
  sound-toggle:
    textColor: "{colors.steam-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "44px"
  top-bar-solid:
    backgroundColor: "{colors.bar-scrim}"
    padding: "18px {spacing.gutter}"
  poster-caption:
    textColor: "{colors.gold-highlight}"
    typography: "{typography.body-lead}"
  glass-caption:
    textColor: "{colors.steam-cream}"
    typography: "{typography.title}"
  menu-link:
    textColor: "{colors.gold-highlight}"
    typography: "{typography.body-lead}"
---

# Design System: Konso

## Overview

**Creative North Star: "The Dark Green Room"**

A deep bottle-green room where the food is the only light. Every screen holds one lit thing (a dish, a drink, a wok in flame) and its name in gold foil, set the way a poster sets a title. The page is short and nearly wordless: the food, the clips and the names do the talking, and the visitor leaves through one door, the gold Menu tab to the revolving menu.

The room is a fixed raster ground, not a flat fill: an emerald light pool over near-black bottle green, carrying the brand wallpaper's paper grain (assets/v2/img/ground.webp, made in code by src/v2/ground.py; a portrait cut, ground-sm.webp, takes over below a 4:5 aspect ratio). Content scrolls over it while the light stays put, like light in a room. Photographs and Veo clips are either cut-outs or feathered into this ground with alpha masks, so nothing sits in a box.

The world refuses the category default of a photo hero with "Book a table", menu cards and prices. There are no cards, no panels, no shadows and no price figures anywhere.

**Key Characteristics:**
- One fixed emerald-pool ground with paper grain; no section changes the background.
- Prata display set in raster gold foil for names; cream Prata for section headings.
- Food and drink in saturated colour, cut out or mask-feathered, never boxed or framed.
- One gold solid on the page: the Menu tab.
- Motion is scroll-driven, transform and opacity only, and fully reducible.

## Colors

A two-temperature palette: cool, near-black greens for the room, warm cream and gold for everything that speaks.

### Primary
- **Gold Foil** (#D89D3C): the one solid accent. Fill of the Menu tab, the skip link and text selection; the fallback colour under the foil raster; the nav underline on hover. Also the base of the foil texture (assets/v2/img/foil.webp, procedural from the kit gold ramp #AA7A28 to #F0BE62 by src/v2/foiltex.py).
- **Gold Highlight** (#F0BE62): hover state of the Menu tab and nav links, the focus ring, and small gold text (poster captions, the revolving-menu link). 10.7:1 on the bottle green, 7.1:1 on the pool.

### Neutral
- **Bottle Green** (#06180D): body background under the ground raster, text on the gold tab, the browser color-scheme anchor.
- **Ground Edge** (#041209) and **Ground Pool** (#103E20): the darkest edge and the brightest emerald of the ground raster. They live in the image, not in CSS; check contrast against the pool, the brightest point text can land on.
- **Bar Scrim** (rgba(5,28,10,.92)): the top bar once the visitor has scrolled past 45% of the hero.
- **Steam Cream** (#F2E8D2): body text, section headings, nav links, dish captions. 15.1:1 on bottle green.
- **Quiet Cream** (#CFC4A8): legal line and secondary text. 10.6:1 on bottle green, 7:1 on the pool.

### Named Rules
**The One Gold Solid Rule.** Gold as a filled shape appears once per screen: the Menu tab. Everywhere else gold is lettering (foil or highlight text) or a 1.5px hover underline.

**The Room Never Changes Rule.** There is one ground for the whole page. Sections do not get their own background colours, cream panels or bands; a cream "find us" panel was tried and removed for this reason.

## Typography

**Display Font:** Prata (with Georgia, serif)
**Body Font:** Montserrat, variable 100-900 (with Helvetica Neue, Arial, sans-serif)

**Character:** Prata is the brand kit's high-contrast didone-leaning serif, used at poster scale with tight negative tracking; Montserrat is the kit's lockup face, quiet in body, tracked and uppercased only for the nav row.

### Hierarchy
- **Hero wordmark**: the kit's gold foil wordmark artwork (konso-wordmark-gold-tight.svg, never retyped) at clamp(220px, 30vw, 540px) wide (62vw on phones), with the lockup descriptor "Pan Asian Kitchen | Bar" beneath it in Montserrat 600, uppercase, 0.32em tracking, gold (13px, 0.24em on phones). Together they are the page h1.
- **Display Poster** (400, clamp(88px, 15vw, 240px), 0.85): the single verb on a poster screen ("Toss", "Pour"), in foil. Phone: 26vw.
- **Display Place** (400, clamp(64px, 15.4vw, 260px), 0.9): the place name in Find us, in foil, as a maps link. Phone: 14.6vw.
- **Headline Dish** (400, clamp(64px, 11.5vw, 200px), 0.88): dish names in the line-up, in foil. Phone: clamp(48px, 15vw, 88px).
- **Headline** (400, clamp(40px, 5vw, 80px), 1): section headings ("The bar") in steam cream. The line-up's heading is the exception: it sits inside the pinned stage, bottom-left at 6svh, at clamp(26px, 2.4vw, 36px), so it never competes with the dish names.
- **Title** (400, clamp(20px, 1.7vw, 26px), 1.2): drink names under the glasses, max 14ch. Phone: 20px.
- **Body** (400, clamp(16px, 1.15vw, 18px), 1.65): the few lines of copy; hero side lines at 16px / 1.7. Lead lines (poster caption, find-us lead, the menu link) at 18px, weight 500-600.
- **Label** (600, 12.5px, 0.18em, uppercase): nav links and the Sound control. The Menu tab is the same style at 13px / 0.14em.

All Prata headings carry kerning and ligatures on, `text-wrap: balance`, and tracking from -0.02em to -0.03em, tighter as the size grows.

### Named Rules
**The Foil Is For Names Rule.** Gold foil lettering (the raster texture clipped to text, with padding so caps and descenders stay inside the gold) is reserved for names: the hero lines, poster verbs, dish names and the place. Section headings and captions stay steam cream. Foil is a raster from the kit ramp, never a CSS gradient.

**The Label Row Rule.** Uppercase tracked Montserrat lives only in the top bar (nav, Sound, Menu tab) and the footer lockup artwork. Body copy, captions and links elsewhere are sentence case.

## Layout

A single full-bleed column of screen-height scenes over the fixed ground. The horizontal gutter is fluid (clamp(16px, 3.2vw, 48px)); vertical rhythm is measured in svh so each scene owns roughly one viewport: hero 100svh, posters 100svh, the line-up a pinned 100svh stage with a runway of 4 × 80svh (4 × 70svh on phones), the bar and Find us padded at 12svh / 8svh and 8svh / 6svh.

- **Top bar:** a three-column grid (1fr auto 1fr): wordmark left, links centred, Sound and Menu right. Fixed, transparent over the hero, scrim after it.
- **Hero:** the wordmark and descriptor centred near the top (9svh); the 16:9 clip below them (76svh tall, starting 24svh down) so the dumpling hangs under the name and the bowl sits at the foot; "Opening soon / Cavelossim, South Goa" bottom-left and hours bottom-right at 9svh from the bottom.
- **Poster:** the clip fills the screen; one word and one caption sit left at max 40% width, vertically centred.
- **The bar:** four glasses in a four-column grid, bottoms on one line (align end), max 1400px, captions centred under each.
- **Find us:** lead line, the place name at full width, the menu link.

One breakpoint, 820px. Below it: the nav links hide (Sound collapses to its equaliser, Menu stays), the hero clip widens to 200vw behind a centred headline and the hours line drops, posters move their word to the top and centre it with the clip in the lower 62%, the glasses go two by two, and Find us centres.

## Elevation & Depth

Flat: there is no box-shadow anywhere. Depth comes from light and layering instead: the ground's light pool, alpha masks that feather every photograph and clip into the ground (radial ellipses for centred subjects, a vertical 0-12-88-100% fade for full-bleed clips), and z-ordered cut-outs. In the line-up the dish sits in front of its name, ingredients burst behind the name, and "far" ingredients are smaller and at 55-60% opacity to read as distance.

### Named Rules
**The Feather, Don't Frame Rule.** A photograph never shows a rectangular edge on the ground: it is a cut-out with transparency, or it is masked to fade into the green.

## Shapes

Almost no geometry of its own; the silhouettes are the food. The only drawn shapes are the pill (999px) for the Menu tab and the Sound control, the 1.5px gold hover underline on nav links, the 3px equaliser bars with 2px ends, and a 2px-radius focus outline. No borders, no dividers, no cards.

## Components

### Buttons
- **Menu tab (primary, the only one):** gold foil fill, bottle-green text, label-tab style, pill shape, 13px 24px padding. Hover: gold highlight and a 2px lift; active: scales to 0.96. Links to the revolving menu.
- **Sound toggle (ghost):** cream label "Sound" beside four 3px equaliser bars at staggered rest heights (40/85/60/100%); 44px minimum target, pill shape. Pressed: the bars animate (1s alternate, staggered delays) and the music fades in to 0.7 volume; it pauses when the tab is hidden. Off until the visitor asks. On phones the word is visually hidden and only the bars show.

### Navigation
- **Top bar:** gold wordmark SVG (44-60px tall, 42px on phones) left; three label-style links centred, gap clamp(18px, 2.4vw, 40px). Hover turns the link gold highlight and draws a 1.5px gold underline from the left (0.45s). The bar takes the scrim after the hero. Anchor links scroll smoothly through Lenis.

### Hero
The gold wordmark is revealed by a clip-path wipe from the bottom (1.1s, cubic-bezier(.23,1,.32,1)), the descriptor rises in 0.5s later; the Veo clip of a dumpling on chopsticks, mask-feathered into the ground, settles from 1.08 over 1.4s. The small top-bar wordmark stays hidden until the visitor has scrolled past 45% of the hero, so the name is never shown twice. A few cut-out ingredients drift at the edges with their own parallax speed and spin.

### Poster
One clip, one word, one caption: a full-screen Veo loop (masked top and bottom) slowly zooms from 1.14 to 1.0 across the scroll; a foil verb and an 18px gold-highlight caption naming the dish or drink. Clips load and play only near the viewport.

### The Line-up (signature)
One pinned 100svh stage on which four dishes take turns, its small cream heading anchored bottom-left. Each dish's foil name rises in, then the cut-out dish drops from above on a spring (stiffness 150, damping 17: a soft bounce on landing, interruptible, the same feel at any scroll speed) with a tilt, crossing the bottom of its name; scroll decides which dish is on, the springs decide how it moves; six of its own ingredients burst outward and spin behind the name; then it slides down and fades on a quicker, bounceless spring (stiffness 260, damping 30) as the next one lands, so the stage is never empty. If a mouse or trackpad visitor stops between two dishes, the page eases (0.8s) to the nearer one; touch scrolling is never steered. Dish clips preload while the line-up is still a screen away. Dishes with a clip hand the still over to the live clip in the same spot once the clip is playing. With reduced motion the stage unpins into a plain stack.

### The Bar
Four cut-out glasses at dish scale (clamp(240px, 46vh, 520px) tall, 30vh on phones), bottoms on one line, each named in Prata title below. Hover lifts a glass 10px and scales it 1.03. A single happy-hour line closes the section.

### Find Us and Footer
The place name in display-place foil links to the map; a gold-highlight "Open the revolving menu" link sits under it. The footer is the gold Konso lockup (wordmark with "Pan Asian Kitchen | Bar") centred at min(70vw, 880px) and a quiet-cream legal line, max 60ch.

### Motion (applies to all components)
One easing for everything, an expo-out curve (cubic-bezier(.16,1,.3,1)). Scroll effects measure positions once on load and resize and then write only transform and opacity (plus a visibility toggle for off-stage dishes) per frame, and skip the frame when the scroll has not moved. Entrances rise 28px and fade, staggered 80ms. Under `prefers-reduced-motion` transitions drop to near zero, entrances show at rest, clips do not autoplay and the line-up unpins.

## Do's and Don'ts

### Do:
- **Do** keep every screen on the one fixed ground (ground.webp, ground-sm.webp on portrait screens) and let sections be transparent over it.
- **Do** set names in Prata gold foil using the foil raster clipped to text, with the .14em / .1em paint-box padding so ascenders and descenders stay gold.
- **Do** cut out dishes and drinks or feather them into the ground with an alpha mask; give drifting ingredients a near and a far size (far at 55-60% opacity).
- **Do** animate with transform and opacity only, measure layout outside the scroll loop, load and play clips only near the viewport, and give every effect a reduced-motion state.
- **Do** keep text at or above the measured contrast: steam cream, quiet cream and gold highlight all clear 7:1 on the brightest pool (#103E20).
- **Do** keep tap targets at 44px or more (the Sound control is 44 × 44 minimum).

### Don't:
- **Don't** add a second gold solid (buttons, badges, bands): the Menu tab is the only one.
- **Don't** give a section its own background colour or a cream panel; the room never changes.
- **Don't** put a photograph in a rectangle, card or frame, and don't add box-shadows.
- **Don't** fake foil with a CSS gradient or set foil on body copy or section headings.
- **Don't** use uppercase tracked labels outside the top bar.
- **Don't** show prices, booking prompts or menu cards; the page links out to the revolving menu instead.

## Restyle, 2026-11-22
Owner's references: the iFoods menu page (dark, small tracked gold labels with a diamond ornament, calm serif headings, two-column priced menu with round thumbnails) and SpiceRoute (cream bands with dark food cards), with the logo's green-on-cream. Smaller type throughout (headings 30-56px, Toss 56-108px).
Order: info strip, sticky header, hero (words left, dumpling video right), cream "Our signatures" (4 dark cards; Steamer and Bao fade from still to their Veo loop), wok Toss video, the full menu (Food/Drinks tabs), the bar (kokum pour video, 4 glasses with prices), cream Visit (hours, Maps, green lockup), footer.
The home menu and every `data-dish` price are written by `python3 src/menu-sync.py` from Garden/menu/build.py: run it after any menu change. No currency symbol (picture-menu rule).

Scroll motion (2026-11-22): GSAP 3.12.5 + ScrollTrigger vendored in assets/v2/vendor, Lenis driven by gsap.ticker. Hero parallax and fade, card photo parallax, Toss zoom-out (pinned under the header on desktop), pour parallax. All scrubbed, transform/opacity only, off under Reduce Motion (gsap.matchMedia). Test with puppeteer emulateMediaFeatures no-preference: headless Chrome on this Mac inherits Reduce Motion.
