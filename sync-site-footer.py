#!/usr/bin/env python3
"""Stamp site-footer.html into every page, or check that they all match.

    python sync-site-footer.py            write
    python sync-site-footer.py --check    report drift, exit 1 if any

Replaces the page's existing <footer ...> element (or inserts one straight
after </main> if the page has none), and makes sure site-footer.css is linked.
"""
import re, sys, pathlib

HERE = pathlib.Path(__file__).resolve().parent
PAGES = ["v1.html", "care.html", "programmes.html", "single-treatments.html",
         "about.html", "specialist.html", "programme.html", "index.html"]
LINK = '<link rel="stylesheet" href="site-footer.css" />'

raw = (HERE / "site-footer.html").read_text(encoding="utf-8")
PARTIAL = re.sub(r"^<!--.*?-->\n", "", raw, count=1, flags=re.S).rstrip("\n")
FOOT = re.compile(r'<footer\b[^>]*>.*?</footer>', re.S)
CSS = re.compile(r'<link rel="stylesheet" href="[^"]+\.css" />(?![\s\S]*<link rel="stylesheet" href="[^"]+\.css" />)')

def main():
    check = "--check" in sys.argv
    bad = 0
    for name in PAGES:
        p = HERE / name
        s = p.read_text(encoding="utf-8")
        new = s
        m = FOOT.search(new)
        if m:
            new = new[:m.start()] + PARTIAL + new[m.end():]
        else:
            i = new.index("</main>") + len("</main>")
            new = new[:i] + "\n\n" + PARTIAL + new[i:]
        if LINK not in new:
            c = CSS.search(new)
            new = new[:c.end()] + "\n" + LINK + new[c.end():]
        if new == s:
            print(f"{name:26s} ok"); continue
        if check:
            print(f"{name:26s} DRIFT"); bad += 1; continue
        p.write_text(new, encoding="utf-8", newline="\n")
        print(f"{name:26s} written")
    sys.exit(1 if (check and bad) else 0)

main()
