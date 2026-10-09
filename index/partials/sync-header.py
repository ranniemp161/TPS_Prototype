#!/usr/bin/env python3
"""Stamp site-header.html into every page, or check that they all match.

    python sync-header.py            write
    python sync-header.py --check    report drift, exit 1 if any

Only the <header class="nav ..." data-nav> element is replaced. If a page has
no veil element after it, one is added. Nothing else in a page is touched, and
a page whose header already matches is not rewritten (so index.html, the source
the partial was taken from, is left byte for byte alone).
"""
import re, sys, pathlib

HERE = pathlib.Path(__file__).resolve().parent
SITE = HERE.parent  # the pages sit one folder up, in index/
CAL = "https://calendly.com/thepostpartumsuite/30min"
VEIL = '<div class="veil" data-veil hidden></div>'

# compact: not used any more. Every page opens with the tall header and folds on scroll
# (TJ, 5 Oct 2026: the tall to short change is universal).
PAGES = {
    "index.html":              dict(brand="#content", enquire="#programmes", compact=False),
    "what-we-do.html":            dict(brand="index.html",  enquire=CAL,           compact=False),
    "programmes.html":      dict(brand="index.html",  enquire=CAL,           compact=False),
    "single-treatments.html": dict(brand="index.html", enquire=CAL,          compact=False),
    "about.html":           dict(brand="index.html",  enquire=CAL,           compact=False),
    "who-comes-into-your-home.html":      dict(brand="index.html",  enquire=CAL,           compact=False),
    "build-your-programme.html":       dict(brand="index.html",  enquire=CAL,           compact=False),
    "faqs.html":           dict(brand="index.html",  enquire=CAL,           compact=False),
}

raw = (HERE / "site-header.html").read_text(encoding="utf-8")
PARTIAL = re.sub(r"^<!--.*?-->\n", "", raw, count=1, flags=re.S).rstrip("\n")
HDR = re.compile(r'<header class="nav[^"]*" data-nav[^>]*>.*?</header>', re.S)

def render(cfg):
    return (PARTIAL.replace("{{SCROLLED}}", " is-scrolled" if cfg["compact"] else "")
                   .replace("{{BRAND}}", cfg["brand"]).replace("{{ENQUIRE}}", cfg["enquire"]))

def main():
    check = "--check" in sys.argv
    bad = 0
    for name, cfg in PAGES.items():
        p = SITE / name
        s = p.read_text(encoding="utf-8")
        m = HDR.search(s)
        if not m:
            print(f"{name:26s} NO HEADER FOUND"); bad += 1; continue
        want = render(cfg)
        same = m.group(0) == want
        has_veil = VEIL in s
        if same and has_veil:
            print(f"{name:26s} ok"); continue
        if check:
            print(f"{name:26s} DRIFT" + ("" if has_veil else " (no veil)")); bad += 1; continue
        new = s[:m.start()] + want + s[m.end():]
        if VEIL not in new:
            i = new.index(want) + len(want)
            new = new[:i] + "\n\n" + VEIL + new[i:]
        p.write_text(new, encoding="utf-8", newline="\n")
        print(f"{name:26s} written")
    sys.exit(1 if (check and bad) else 0)

main()
