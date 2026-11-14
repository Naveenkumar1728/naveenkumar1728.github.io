# naveenkumar1728.github.io

Personal page of Naveen Kumar Palani. Plain HTML, CSS and JavaScript; no build step.
GitHub Pages serves the `main` branch as it is.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | All the text. Each section starts with a `<!-- ===== N. NAME ===== -->` comment. |
| `assets/css/style.css` | Design. Colours are tokens at the top (`:root`, then dark mode). |
| `assets/js/main.js` | Theme toggle, fade-in on scroll, research-tree lines. The page still works without it. |
| `assets/img/` | Photo in two sizes (`naveen-480.webp`, `naveen-960.webp`) and `og-1200x630.jpg`, the picture shown in WhatsApp/LinkedIn link previews. Icons (`favicon.*`, `icon-*.png`, `apple-touch-icon.png`) sit in the top folder. |

## Common edits

**Add a demo video or repo link (December).** In `index.html`, find `id="proto-sage"` or `id="proto-nyrel"`.
Inside `<div class="card__links">`, remove the `<!--` and `-->` around a line and paste the URL:

```html
<a class="btn btn--sm" href="https://youtu.be/..." rel="noopener">Watch demo</a>
<a class="btn btn--sm" href="https://github.com/Naveenkumar1728/..." rel="noopener">Code</a>
```

Then delete that card's `<span class="tag tag--soon">Demos coming December 2026</span>`.
The links row stays hidden until it holds at least one link.

**Change a paper's status.** In the Research section, edit the text of `<span class="status ...">`
and its class: `status--prep` (amber), `status--planned` (grey), `status--done` (green).
If a paper gets published, you can then add a link or DOI inside its node.

**Change the photo.** Replace the files in `assets/img/` with square images using the same names.

**Google Search Console.** The verification tag is the `google-site-verification` line near the top of
`index.html`. Keep it there, or Google will drop the verification.

**Sitemap.** `sitemap.xml` lists the page for Google. When you make a substantial content change,
update its `<lastmod>` date (YYYY-MM-DD). `robots.txt` allows all crawlers and points to the sitemap.

**Illustrations.** The three research illustrations (framework placeholder: a stack of pages, Sage "shrinking edge", Nyrel "Who made you?")
sit in `index.html` under comments starting `ILLUSTRATION:`. Labels, counts and captions are plain text there;
the point-and-thread drawings are generated SVG, so ask Claude to regenerate them rather than editing by hand.

**Footer date.** Update "Last updated November 2026" at the bottom of `index.html` whenever you edit.

## Publishing changes

```bash
git add -A
git commit -m "Update page"
git push
```

The live site updates about a minute after the push.
