# Builds the website's menu page (menu.html) from the one menu: Garden/menu/build.py (the picture menu).
# Names, descriptions, prices, veg marks, heat, allergens, sections and deals all come from there,
# so a dish or price is changed once, in build.py, and both menus follow.
#   usage (from Website/):  python3 src/menu-sync.py
# Dish photos: the website keeps its own photo for a dish when it has one (assets/menu/*.webp, matched by name);
# picture-menu photos are converted for dishes that have none. build.py itself is only read, never written.
import html, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MENU_DIR = os.path.join(ROOT, '..', 'Garden', 'menu')
PAGE = os.path.join(ROOT, 'menu.html')

# ---- run build.py's data and page composition, with card/rows/sh swapped for recorders, stopping before it writes anything
src = open(os.path.join(MENU_DIR, 'build.py'), encoding='utf-8').read()
src = src[:src.index('def b64(')]                                   # stop before images are embedded and index.html is written
REC = []
hook = '''
def card(img,name,sub,price,tag='',ar='3/2',span=6):
    REC.append(('card',dict(img=img,name=name,desc=sub,price=price,tag=tag))); return f'\\x00{len(REC)-1}\\x00'
def rows(items,cols=2):
    REC.append(('rows',[dict(name=n,desc=d,price=p) for n,d,p in items])); return f'\\x00{len(REC)-1}\\x00'
def sh(title,small,lede='',sub=False):
    REC.append(('sh',dict(title=title,small=small,lede=lede,sub=sub))); return f'\\x00{len(REC)-1}\\x00'
'''
src = src.replace('# ---- food face ----', hook + '# ---- food face ----', 1)
ns = {'REC': REC, '__name__': 'menu_sync'}
cwd = os.getcwd(); os.chdir(MENU_DIR)
try: exec(compile(src, 'build.py', 'exec'), ns)
finally: os.chdir(cwd)
VEG, AL, HEAT, body = ns['VEG'], ns['AL'], ns['HEAT'], ns['body']

# the wok "hero" card is hand-written in build.py: read it into a dish
hero = ns['hero']
hv = re.findall(r'<span>([^<]+?) <b>(\d+)</b></span>', hero)
REC.append(('card', dict(img=re.search(r'img/([\w-]+)\.jpg', hero).group(1), name=re.search(r'</i>([^<]+)</h3>', hero).group(1).strip(),
    desc=re.search(r'<p>(.*?)</p>', hero, re.S).group(1).strip() + ' ' + ' · '.join(f'{a.lower()} {b}' for a, b in hv),
    price='', tag=re.search(r'class="tag[^"]*">([^<]+)<', hero).group(1))))
body = body.replace(hero, f'\x00{len(REC)-1}\x00')

def text(s): return html.unescape(re.sub(r'<[^>]+>', ' ', s)).replace(' ', ' ').strip()
def clean(s): return re.sub(r'\s+', ' ', text(s)).strip()

# ---- walk the page in order: sections, headings, cards, rows and deal bands
# classes the picture menu hides on screen (CSS rules like .x{display:none} outside its print rules), so print-only copies are skipped
SCREEN_HIDDEN = set(re.findall(r'^\.([\w-]+)\{display:none\}', ns['PRINT'].split('@page')[0], re.M)) | set(re.findall(r'\.([\w-]+)\{display:none\}', ns['PRINT'].split('@page')[0]))
SCREEN_HIDDEN -= {'band'}
SECS = []   # [{'id','title','small','lede','items':[...]}]
for sid, inner in re.findall(r'<section class="sec[^"]*" id="(\w+)">(.*?)</section>', body, re.S):
    cur = None
    for m in re.finditer(r'\x00(\d+)\x00|<div class="(band[^"]*)"[^>]*>(.*?)</div>', inner, re.S):
        if m.group(1) is not None:
            kind, d = REC[int(m.group(1))]
            if kind == 'sh':
                cur = dict(id=f'm-{re.sub(r"[^a-z]+", "-", clean(d["title"]).lower()).strip("-")}', title=clean(d['title']), small=clean(d['small']), lede=clean(d['lede']), items=[])
                SECS.append(cur)
            elif kind == 'card': cur['items'].append(dict(d, kind='dish', photo=True))
            else: cur['items'] += [dict(x, kind='dish', photo=False) for x in d]
        else:
            if set(m.group(2).split()) & SCREEN_HIDDEN: continue            # print-only copies (hidden on the phone menu)
            band = re.sub(r'<s>(.*?)</s>', r'(usually \1)', m.group(3))   # crossed-out regular prices
            strong = clean(''.join(re.findall(r'<strong>(.*?)</strong>', band, re.S)))
            rest = clean(re.sub(r'<strong>.*?</strong>', '', band, flags=re.S))
            item = dict(kind='note', title=strong, desc=rest)
            if cur is None: continue
            cur['items'].insert(0, item) if not cur['items'] else cur['items'].append(item)

FOOD = ['m-dim-sum-bao', 'm-from-the-wok', 'm-soups-salads', 'm-mains', 'm-something-sweet']
DRINKS = ['m-beer', 'm-cocktails', 'm-zero-proof', 'm-whisky', 'm-vodka', 'm-wine']
by = {s['id']: s for s in SECS}
missing = [k for k in FOOD + DRINKS if k not in by] + [s['id'] for s in SECS if s['id'] not in FOOD + DRINKS]
if missing: sys.exit(f'menu-sync: section names changed in build.py, update FOOD/DRINKS: {missing}')

# ---- photos: keep the website's own photo for a dish, else convert the picture-menu photo
page = open(PAGE, encoding='utf-8').read()
PHOTO = {html.unescape(a).lower(): s for s, a in re.findall(r'<img class="dish-img" src="(assets/menu/[\w-]+\.webp)" alt="([^"]+?), (?:plated|served)"', page)}
# dishes renamed in build.py keep the photo they had under their old name
RENAMED = {'pink panchayat': 'assets/menu/coconuthigh.webp', 'tingle all the way': 'assets/menu/sichuan.webp', 'yak attack': 'assets/menu/soju.webp',
           'lychee lemon-gras': 'assets/menu/lychee.webp', 'tam-tam margarita': 'assets/menu/margarita.webp', 'somaek bomb': 'assets/menu/somaek.webp'}
def photo(d):
    key = clean(d['name']).lower()
    if key in PHOTO: return PHOTO[key]
    if key in RENAMED and os.path.exists(os.path.join(ROOT, RENAMED[key])): return RENAMED[key]
    if d.get('photo'):
        out = f'assets/menu/pm-{d["img"]}.webp'
        if not os.path.exists(os.path.join(ROOT, out)):
            im = Image.open(os.path.join(MENU_DIR, 'img', d['img'] + '.jpg')).convert('RGB')
            w, h = im.size; t = 478 / 640                                  # crop to the website's 4:3-ish dish frame
            if h / w > t: nh = int(w * t); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
            else: nw = int(h / t); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
            im.resize((640, 478), Image.LANCZOS).save(os.path.join(ROOT, out), 'WEBP', quality=80, method=6)
        return out
    return None

# ---- markup in the website's own classes
CHILLI = '<svg viewBox="0 0 12 16" aria-hidden="true"><path d="M7.5 1.2c.3 1-.1 1.8-.9 2.3 2.4.6 3.6 2.6 3.2 5.4-.5 3.3-3.3 6.1-7.6 6.5-.7.1-1-.6-.4-1 2.5-1.6 3.4-3.9 3.2-6.2-.1-1.6.6-3.2 2-4.1-.4-.6-.4-1.4.1-2 .2-.4.4-.6.4-.9z"/></svg>'
DIET = {'v': ('diet-veg', 'Vegetarian'), 'nv': ('diet-nonveg', 'Non-vegetarian'), 'vn': ('diet-both', 'Veg or non-veg')}
E = lambda s: html.escape(s, quote=True)
def marks(name):
    out = ''
    if name in VEG:
        c, t = DIET[VEG[name]]; out += f'<span class="diet {c}" title="{t}"><span class="sr">{t}</span></span>'
    h = HEAT.get(name, 0)
    if h: out += f'<span class="heat" title="Heat {h} of 3"><span class="sr">Heat {h} of 3</span>{CHILLI * h}</span>'
    return out
def dish(d):
    if d['kind'] == 'note':
        return f'<li class="dish dish-note">\n<div class="dish-body">\n<h4 class="dish-name">{E(d["title"])}</h4>\n<p class="dish-what">{E(d["desc"])}</p>\n</div>\n</li>'
    name = clean(d['name']); words = name.split(' ')
    head = (E(' '.join(words[:-1])) + ' ' if len(words) > 1 else '') + f'<span class="nw">{E(words[-1])}{marks(name)}</span>'
    if d.get('tag'): head += f' <span class="tag">{E("Goa" if d["tag"] == "Konkan touch" else d["tag"])}</span>'
    img = photo(d)
    pic = f'<img class="dish-img" src="{img}" alt="{E(name)}, served" loading="lazy" decoding="async" width="640" height="478">\n' if img else ''
    al = AL.get(name, '')
    alh = f'\n<p class="dish-allergen">Contains: {E(al)}</p>' if al else ''
    desc, price = ns['split_price'](clean(d['desc']), clean(d.get('price', '')))
    if price and ' · ' not in price and not re.search(r'[A-Za-z]{3}', price):      # one price: bold, at the end of the description, same line
        what = f'<p class="dish-what">{E(desc)} <b class="pe">{E(price)}</b></p>'
    else:                                                                          # variants: their own clear line, label then bold number
        opts = ''.join(f'<span>{E(m.group(1).strip())} <b>{E(m.group(2))}</b></span>' if (m := re.match(r'^(.*?)(\d[\d,]*(?: / \d[\d,]*)?)$', x.strip())) and m.group(1).strip() else f'<span><b>{E(x.strip())}</b></span>' for x in price.split(' · ')) if price else ''
        what = f'<p class="dish-what">{E(desc)}</p>' + (f'\n<p class="dish-opts">{opts}</p>' if opts else '')
    return (f'<li class="dish{" has-img" if img else ""}">\n{pic}<div class="dish-body">\n<h4 class="dish-name">{head}</h4>\n'
            f'{what}{alh}\n</div>\n</li>')
def section(s):
    sub = s['small'] + (f' · {s["lede"]}' if s['lede'] else '')
    return (f'<section class="menu-sec" id="{s["id"]}" aria-labelledby="h{s["id"][1:]}">\n<header class="menu-sec-head"><h3 id="h{s["id"][1:]}">{E(s["title"])}</h3><p>{E(sub)}</p></header>\n'
            '<ul class="dish-list">' + '\n'.join(dish(d) for d in s['items']) + '</ul>\n</section>')
def panel(pid, ids):
    secs = [by[i] for i in ids]; total = sum(len(s['items']) for s in secs); col, n = [[], []], 0
    for s in secs: col[0 if n < total / 2 else 1].append(s); n += len(s['items'])
    return (f'<div class="menu-panel" id="panel-{pid}" role="tabpanel" aria-labelledby="tab-{pid}">' +
            ''.join(f'<div class="menu-col">{chr(10).join(section(s) for s in c)}</div>' for c in col if c) + '</div>')

foot = clean(re.search(r'<p class="foot">(.*?)</p>', body, re.S).group(1)).replace('• to ••• spice', 'chillies show the heat')
foot = re.sub(r'\s*veg\s+non-veg\s*·\s*chillies show the heat, one to three\.', ' The marks show veg and non-veg; chillies show the heat, one to three.', foot)
new = (f'{panel("food", FOOD)}\n{panel("drinks", DRINKS)}\n'
       f'<p class="menu-foot">{E(foot)} Allergens still to be confirmed by our chef before opening.</p>')
a = page.index('<div class="menu-body">') + len('<div class="menu-body">')
b = page.rindex('</div>', a, page.rindex('</section>', 0, page.index('</main>')))   # the closing tag of menu-body, found from the end
page = page[:a] + '\n' + new + '\n  ' + page[b:]
open(PAGE, 'w', encoding='utf-8').write(page)
n = sum(len(s['items']) for s in SECS)
print(f'menu-sync: {len(SECS)} sections, {n} lines ({sum(1 for s in SECS for d in s["items"] if d["kind"]=="note")} deals) written to menu.html')

# ---- the home page's menu (index.html, between the menu markers): two-column list, round thumbnails, prices
#      Same data and photos as menu.html; thumbnails are 160 px squares cut from the dish photos.
HOME = os.path.join(ROOT, 'index.html')
THUMBS = os.path.join(ROOT, 'assets', 'menu', 'thumb')
os.makedirs(THUMBS, exist_ok=True)
def thumb(src):
    name = os.path.splitext(os.path.basename(src))[0] + '.webp'
    out = os.path.join(THUMBS, name)
    if not os.path.exists(out):
        im = Image.open(os.path.join(ROOT, src)).convert('RGB'); w, h = im.size; s = min(w, h)
        im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((160, 160), Image.LANCZOS).save(out, 'WEBP', quality=78, method=6)
    return 'assets/menu/thumb/' + name
def rupee(s): return s   # no currency symbol, same rule as the picture menu
def home_item(d):
    if d['kind'] == 'note':
        return f'<li class="mi mi--note"><p><strong>{E(d["title"])}</strong> {E(rupee(d["desc"]))}</p></li>'
    name = clean(d['name']); img = photo(d)
    pic = f'<img class="mi__img" src="{thumb(img)}" alt="" width="80" height="80" loading="lazy" decoding="async">' if img else '<span class="mi__img mi__img--k" aria-hidden="true"></span>'
    desc, price = ns['split_price'](clean(d['desc']), clean(d.get('price', '')))
    tag = f'<span class="mi__tag">{E("Goa" if d.get("tag") == "Konkan touch" else d["tag"])}</span>' if d.get('tag') else ''
    one = price and ' · ' not in price and not re.search(r'[A-Za-z]{3}', price)
    opts = ''
    if price and not one:
        parts = []
        for x in price.split(' · '):
            m = re.match(r'^(.*?)(\d[\d,]*(?: / \d[\d,]*)?)$', x.strip())
            parts.append(f'<span>{E(m.group(1).strip().capitalize())} <b>{E(rupee(m.group(2)))}</b></span>' if m and m.group(1).strip() else f'<span><b>{E(rupee(x.strip()))}</b></span>')
        opts = f'<p class="mi__opts">{"".join(parts)}</p>'
    pr = f'<p class="mi__price">{E(rupee(price))}</p>' if one else ''
    return (f'<li class="mi">{pic}<div class="mi__body"><div class="mi__top"><h4 class="mi__name">{E(name)}{marks(name)}</h4>{pr}</div>'
            f'{tag}<p class="mi__desc">{E(desc)}</p>{opts}</div></li>')
def home_sec(s):
    lede = f'<p class="msec__lede">{E(s["lede"])}</p>' if s['lede'] else ''
    return (f'<section class="msec" aria-labelledby="h{s["id"][1:]}"><header class="msec__head"><p class="label">{E(s["small"])}</p>'
            f'<span class="orn" aria-hidden="true"></span><h3 id="h{s["id"][1:]}">{E(s["title"])}</h3>{lede}</header>'
            f'<ul class="mlist">{"".join(home_item(d) for d in s["items"])}</ul></section>')
def home_panel(pid, ids, first):
    return (f'<div class="mpanel" id="mp-{pid}" role="tabpanel" aria-labelledby="mt-{pid}"{"" if first else " hidden"}>'
            + ''.join(home_sec(by[i]) for i in ids) + '</div>')
home = open(HOME, encoding='utf-8').read()
A, B = '<!-- menu:start (written by src/menu-sync.py) -->', '<!-- menu:end -->'
if A in home and B in home:
    block = (f'{A}\n<div class="mtabs" role="tablist" aria-label="Menu">'
             '<button class="mtab" role="tab" id="mt-food" aria-controls="mp-food" aria-selected="true" type="button">Food</button>'
             '<button class="mtab" role="tab" id="mt-drinks" aria-controls="mp-drinks" aria-selected="false" tabindex="-1" type="button">Drinks</button></div>\n'
             f'{home_panel("food", FOOD, True)}\n{home_panel("drinks", DRINKS, False)}\n{B}')
    home = home[:home.index(A)] + block + home[home.index(B) + len(B):]
    # prices shown elsewhere on the page (signature cards, bar glasses) follow the menu: data-dish="<name on the menu>"
    PRICE = {}
    for s in SECS:
        for d in s['items']:
            if d['kind'] == 'note':
                m = re.match(r'^(.*?)\s*·\s*(\d[\d,]*)$', d['title'])
                if m: PRICE[m.group(1).strip().lower()] = m.group(2)
                continue
            desc, price = ns['split_price'](clean(d['desc']), clean(d.get('price', '')))
            nums = re.findall(r'\d[\d,]*', price)
            if not nums: continue
            single = ' · ' not in price and not re.search(r'[A-Za-z]{3}', price)
            PRICE[clean(d['name']).lower()] = price if single else 'from ' + min(nums, key=lambda x: int(x.replace(',', '')))
    def fill(m):
        key = html.unescape(m.group(2)).lower()
        if key not in PRICE: sys.exit(f'menu-sync: data-dish="{m.group(2)}" is not on the menu any more')
        return f'{m.group(1)}{E(PRICE[key])}{m.group(3)}'
    home = re.sub(r'(<(?:p|b)\b[^>]*data-dish="([^"]+)"[^>]*>)[^<]*(</(?:p|b)>)', fill, home)
    open(HOME, 'w', encoding='utf-8').write(home)
    print('menu-sync: home page menu written to index.html')
