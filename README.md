# Pankaj Shah — Portfolio

Source for [www.pankajshah12.com.np](https://www.pankajshah12.com.np). A static site in plain HTML, CSS and JavaScript — no build step, no framework.

## Structure

```
index.html              All page content (SEO metadata, JSON-LD, every section)
style.css               Design system ("Mithila × systems"): tokens, dark/light themes, pattern bands, layout, motion
script.js               Interactions: dot-field canvas, scroll animations, filters, previews, modal, strip, form
pankaj_shah_2026_cv.pdf Resume linked from the hero, nav and contact section
CNAME                   Custom domain for GitHub Pages
robots.txt, sitemap.xml Search engine hints
assets/
  fonts/                Bricolage Grotesque, Instrument Sans, Geist Mono (subset, self-hosted)
  vendor/               GSAP 3 + ScrollTrigger (self-hosted)
  icons/                Technology icons (Devicon, MIT) + custom SVGs
  img/                  Optimised WebP images, favicon, Open Graph image
media/                  Original full-size photos and certificates (not loaded by the page)
```

## Editing content

- **Text, experience, projects, skills:** edit `index.html` directly. Each project (case study or index row) holds its modal content in a hidden `.project-detail` block; index rows also keep their diagram, tags and links in `<template>` tags.
- **Project filters:** set `data-category` on a `.prow` row (space-separated: `microservices`, `ai`, `fullstack`, `backend`, `streaming`).
- **Roles in the hero rotator:** edit the `data-roles` JSON on `#rotator`.
- **New certificate:** add a 720px and a 1600px WebP to `assets/img/` and copy one of the `#gallery` strip items (`g-land` for landscape, `g-port` for portrait).
- **Contact form:** posts to Web3Forms with the existing access key. Messages arrive at the email registered with that key.

## Local preview

```
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` straight from disk works too, but icons use CSS masks that some browsers block on `file://`.)

## Deploy

Push to the branch GitHub Pages serves from. `CNAME` keeps the custom domain. No build is needed.

## Credits

GSAP by GreenSock (standard no-charge license). Bricolage Grotesque, Instrument Sans and Geist Mono (SIL OFL). Technology icons from Devicon (MIT).
