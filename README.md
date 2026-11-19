# Konso website

Public site for Konso (Pan Asian Kitchen | Bar), opening soon in Cavelossim, South Goa.
Live at https://singhgenics.github.io/Konso/ (GitHub Pages, `main`, root).

## The site (rebuilt 2026-11-19)

`index.html` is hand-written now (no build step): `assets/v2/konso.css`, `assets/v2/konso.js`, images in `assets/v2/img`, cut-out dishes and ingredients in `assets/v2/cut`, clips in `assets/v2/video`, music in `assets/v2/audio`. **Do not run `src/build.mjs` or `src/patch-scenes.mjs`: they generate the old site and would overwrite this page.** The old full menu page `menu.html` stays in the repo so old links keep working, but nothing links to it; every menu link goes to the revolving menu (singhgenics.github.io/Garden/menu/table/).

Owner's brief: short, not text heavy, the food does the talking; 5 foods and 4 drinks only; no prices; no restaurant renders (the room is not built yet); brand green, gold foil, Prata + Montserrat.

Page: hero (dumpling clip, gold foil headline) → "Toss" (wok-fire clip, Konso Fever) → The line-up (Steamer for two, Bao Down, Konso Fever, K-Pop Wings: each drops in, settles, its ingredients burst out; Steamer and Bao hand over to a live clip once landed) → "Pour" (kokum sour clip) → the bar (4 drinks, glasses crossfade) → Right now at Konso (pick an hour, the dish changes) → Find us → footer lockup. Sound toggle plays a lounge loop (off until tapped).

Motion rules: positions are measured on load/resize only; each frame writes transform and opacity only; no live blur. Measured 2026-11-19 with real wheel scrolling at 2x DPR: 60 fps, p99 16.8 ms, no dropped frames, desktop and phone. Reduced motion shows the same content without travel.

## Making the pictures (src/v2)

All in the Flow project **Konso Website v2** (id in `src/v2/PROJECT_ID`), nano-2.1, free.
- `src/v2/run.sh [id]`: generates the stills (prompts in `jobs.txt`, `scenes.txt`, `style-dish.txt`, `style-drink.txt`; dish jobs use the old menu photo as the single reference). Takes land in `src/v2/raw` (git-ignored).
- `src/v2/cut.py`: cuts a dish out of its green studio ground (rembg isnet + a "not the green ground" mask so plates and baskets stay) and bakes a soft contact shadow; `ing` mode splits the ingredient flat-lay into pieces. Needs a Python with `rembg[cpu]` and `scipy`.
- `src/v2/vid.sh <id> <frame>`: Veo Lite loop (same start and end frame = seamless), ~10 credits; prompts in `vprompts.txt`. Steamer and Bao start frames are the cut-out on the ground image, so the clip matches the page.
- `src/v2/ground.py`: the background (emerald light pool on bottle green with the brand wallpaper's paper grain). `src/v2/foiltex.py`: the gold foil texture for display type, from the kit's gold ramp.
- Upscales: `gflow image upscale` only finds recent images in a busy project (older tiles are not loaded); 0.102.1 still fails on them. Clips were upscaled to 1080p with `gflow video upscale`.
- Music: ElevenLabs Music v2.5 lounge instrumental (take A of two, both checked for vocals), level-matched into `assets/v2/audio/konso.mp3`.

Pictures are styled renders of real menu dishes and say so in the footer. Replace them with real photos on the same green backdrop once the kitchen is cooking: each is one file.

## Older notes (previous site)

Static HTML/CSS/JS, no runtime build. `index.html` is generated; edit `src/template.html`.

## Rebuild

```sh
node src/build.mjs        # menu + web images -> index.html
```

The full menu, prices and dish photos come from the live menu in the Dream repo
(`food.html`, `drinks.html`) through `../Garden/web/menu/src/menu-data.mjs` and `../Garden/web/menu/img/plating`.
Run the build after any menu change.

Website copy rules, enforced in `src/build.mjs` (SCRUB): never mention Kolkata, Tangra or City of Joy; happy hour reads 12–6.

## Images

- `assets/plates/`: hero pieces (logo cut from the brand kit, menu photos, Flow textures).
- `assets/flow/`: Flow scenes (wok fire, steamer stack, tap pour, garden at dusk, beach).
- `src/gen-images.sh [job]`: regenerates Flow pictures, free nano2, all in the Flow project **Website**
  (id in `src/flow/PROJECT_ID`, prompts in `src/flow/*.txt`). Delete an output to redo it.

The garden picture is an artist's impression and is labelled as one on the page.

## Design

- `PRODUCT.md`: product facts and constraints.
- `DESIGN.md`: the visual system (the hoarding: red plywood, pasted cream bills, Alfa Slab One).
- `.impeccable/mocks/decision/`: the three direction comps; `hoarding.jpg` was chosen.

## Story section

`#story` tells the Calcutta-to-Goa history (copy in `src/template.html`; facts and caveats in `PRODUCT.md`). Its three illustrations (`calcutta`, `cabin`, `cart` in `src/gen-images.sh`) are Flow images in the Website project and are captioned as illustrations. `assets/site.js` sets the map step from the chapter in view; `?still` shows the finished page.

## The moat sections

Page order: hero, moat strip, Steam (dim sum, bao), Bar (cocktail scene, bottled beer, craft cocktails; no draught beer, 2026-11-16), deals, story, wok, garden, find us.

The full menu (Food / Drinks tabs) is its own page, `menu.html` (2026-11-16), listed in the rail's Menu drop-down as "Full menu" next to the Picture menu; every "see the menu" link goes there. `src/split-menu.mjs` cuts it out of the built `index.html` (`src/build.mjs` runs it last; the template still holds the menu section). Dish and drink cards are pulled from the live menu by name in `src/template.html` (`{{Name|img}}` etc.); the counts in the moat strip are live (`{{#dimsum}}`). Four extra Flow scenes (`dimsum`, `bao`, `cocktails`, `beers` in `src/gen-images.sh`) are captioned as illustrations.

## Exploded scenes

`x-dimsum`, `x-bao`, `x-cocktail` in `src/gen-images.sh` are Flow exploded views on flat chroma green (prompts in `src/flow/x-*.txt`). `python3 src/explode/slice.py [name]` keys the green out and cuts each into five transparent layers (`assets/explode/`, layout in `src/explode/*.json`); `src/build.mjs` writes the scene markup (`{{#explode:name}}`) and `assets/site.js` drives it from scroll.

Each scene also has a `x-<name>-whole` Flow picture (the finished dish, no steam: steam keys to green flecks) that the layers dissolve into; `slice.py` writes it as `assets/explode/<name>-whole.webp`.

Whole-page smooth scrolling is Lenis (self-hosted `assets/lenis.min.js`, v1.1.20), set up at the top of the exploded-views block in `assets/site.js`; it is off for reduced motion and `?still`.

## Wok video

`assets/video/wok-toss.mp4` is a Flow image-to-video clip (Veo Lite, started from `assets/flow/wok-fire.jpg`, prompt in `src/flow/wok-toss.txt`), cut so its last 0.6s dissolves into its first and it loops without a jump (`ffmpeg` xfade, audio dropped, 960 px wide). It plays only while on screen and not under reduced motion. If `gflow video i2v` ends with "no signed media URL", the clip was still made and paid for: `gflow data list videos`, then `gflow data download <media_id>` recovers it free.

`assets/video/cocktail-shake.mp4` is the same kind of clip for the craft cocktails picture (start frame `assets/flow/cocktail-bar.jpg`, prompt `src/flow/cocktail-shake.txt`).

## More Flow video

`src/gen-video.sh [job]` makes the clips (Veo Lite, ~10 credits each, one at a time; prompts `src/flow/v-*.txt`, raw files in `/tmp/vids`). Encode as loops with the same ffmpeg xfade recipe, 800 px wide (480 for portrait), into `assets/video/`: `dimsum-pleat`, `bao-steam`, `beer-trio`, `garden-dusk`, `noodle-cart`, plus `wok-toss` and `cocktail-shake`. Each plays only while on screen.

The Draught section opens with the cocktail scene (2026-11-16): a kokum feni sour pulled apart into garnish, egg-white foam, the ruby pour, ice and the coupe, coming together as you scroll (`x-cocktail`, `x-cocktail-whole`). It replaced the scroll-scrubbed beer pour (its frames, `assets/pour/`, are in git history).

Scene motion (`assets/site.js`): positions are measured on load and resize only, so scrolling reads no layout; only transform and opacity change. Each scene fades in from the page colour and back out through its top and bottom padding (`--fade` in `assets/site.css`), and every layer lands before the finished picture fades in, so there is no double image. Measured 2026-11-16: steady 60 fps, no long tasks, desktop and phone.

`src/build.mjs` cannot run at the moment: its menu source (`Garden/web/menu/src/menu-data.mjs`) was removed and the website menu is frozen in `index.html`. To change the scenes, edit `src/build.mjs` (XV) or `src/template.html`, then run `node src/patch-scenes.mjs`, which rewrites only the scenes inside `index.html`.

The hero is `assets/video/hero-bao.mp4` (a steaming bao, 1280 px wide, seamless loop, `hero-bao` image + `herobao` clip in the Flow scripts). The wok-toss clip (`assets/video/wok-toss.mp4`) plays in the wok section further down.

## Brand kit (2026-11-16)

The site is dressed in the Konso brand kit only: `assets/brandkit.css` (loaded after `site.css`) maps every colour to the kit's bottle green #051C0A, Konso green #0B2A14, gold foil #D89D3C and cream #F2E8D2, drops the wood and paper textures, and gives each scroll scene its own kit shade (dim sum: warm gold glow; bao: darkest green; cocktail: stronger gold glow). Logos are the kit SVGs in `assets/brand/` (from `Garden/web/brand-kit/logo/svg`). Only the veg / non-veg marks and the chilli icons keep their own colours. The older palette notes in `DESIGN.md` and the end of `site.css` are overridden, not deleted.

## The menu page follows the picture menu (2026-11-16)

`menu.html` is built from the one menu, `Garden/menu/build.py` (the picture menu): names, descriptions, prices, veg marks, heat, allergen lines, sections and deals. After any menu change:

```sh
python3 src/menu-sync.py     # from Website/: rewrites the dishes in menu.html; build.py is only read
```

The website keeps its own photo for a dish when it has one (`assets/menu/*.webp`, matched by name); dishes without one get the picture-menu photo (`assets/menu/pm-*.webp`). Print-only copies in the picture menu (classes it hides on screen, like `bowl-dim`) are skipped. If a section is renamed in `build.py`, the script stops and asks for the `FOOD` / `DRINKS` lists at its top to be updated. The allergen lines carry the picture menu's note that the chef still has to confirm them.

## Speed

Scene pictures load only as each scene comes near, and below-the-fold video posters are set only as their clip comes near (`assets/site.js`); the hero poster is preloaded. Lighthouse, phone profile, 2026-11-16: home 95 / 100 / 100 / 100, menu 95 / 100 / 100 / 100 (performance, accessibility, best practices, SEO).
