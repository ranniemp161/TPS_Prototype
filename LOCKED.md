# Finished sections

TJ's rule (5 Oct 2026): once a section is finished it stays finished until he
returns to it deliberately. Work on one thing must not quietly change another.

This replaces the hero only guard. It covers any section on any page.

## What is locked right now
Run `node lab/lockcheck.mjs list` for the live list. At the time of writing:
- care.html: faq (TJ: the FAQ is how he likes it)
- care.html: housekeeping-zones (TJ: keep the housekeeping zones the same)
- care.html and v1.html: site-header and site-footer (TJ, 5 Oct 2026: likes both, universal). Edit site-header.html / site-footer.html and run the sync scripts, after unlocking.

Candidates to lock once TJ has seen and approved them: the homepage hero with
its new header band, the shared header, the care page sections as he finishes
them.

## How it works
A lock is a fingerprint of a section as TJ approved it: its markup and copy,
plus the computed styles of every element inside it, at 1440 and 390 wide, with
animation frozen. Shared CSS means a change made anywhere that reaches a locked
section is caught. A stop hook (G:/My Drive/Agent/.claude/hooks/tps-lock-guard.sh)
runs the check whenever a page, stylesheet or script in this folder changed, and
blocks the turn with the exact differences if a locked section moved.

## Rules for whoever edits this site (Claude, Codex, or a person)
1. Read the list before editing. Do not touch a locked section.
2. If TJ names a locked section to change, run
   `node lab/lockcheck.mjs unlock <page>:<section>` first.
3. Make the change. Show TJ. Only after he approves, run
   `node lab/lockcheck.mjs record <page>:<section> "note"` to lock it again.
4. Never record a lock to make a failure go away. A failure means something
   changed that should not have. Undo the change.
5. When TJ says a section is finished, lock it straight away with `record`.

## Commands
    node lab/lockcheck.mjs list
    node lab/lockcheck.mjs record care.html:faq "note"
    node lab/lockcheck.mjs check
    node lab/lockcheck.mjs unlock care.html:faq
    node lab/lockcheck.mjs release care.html:faq
