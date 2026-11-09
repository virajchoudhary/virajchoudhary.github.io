# Viraj Choudhary's portfolio

[Live website](https://virajchoudhary.github.io/)

A compact personal portfolio with selected software and research projects,
open-source contributions, notes, and an approved resume. Project pages
distinguish personal contributions, team results, and local-only work.

## Repository contents

This repository contains the published static HTML, CSS, JavaScript, and assets.
There is no package installation or application build step for these files.

- `index.html` is the homepage.
- `work/` contains the project index and case studies.
- `open-source/`, `notes/`, `about/`, and `resume/` contain the other pages.
- `assets/site.css` defines typography, spacing, and light and dark themes.
- `assets/site.js` handles section navigation, embedded media, and the resume viewer.
- `assets/theme.js` handles theme preference and the short theme transition.
- `robots.txt`, `sitemap.xml`, and `404.html` support crawling and missing pages.

The embedded GridShift video is an original visualization of recorded results,
not footage of a deployed application.

## Local preview

Serve the repository root so root-relative links resolve:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Check both themes, project links, keyboard focus,
the resume popup, and embedded media controls before publishing changes.

## Publishing

GitHub Pages publishes `main` from the repository root. A push to this branch
can update the live website. `.nojekyll` keeps these files as static output.

Keep audit reports, development files, credentials, unpublished data, and
unapproved media outside this repository. Preserve a Git reference before
updating the published files; use a revert commit for rollback rather than
rewriting shared history.

Kesten is the working brand for the historical `stock-predictor-system`
project. Its case-study URL retains `stock-workspace` for stable links. The
newer application remains a local continuation; the portfolio does not claim
trading returns or a production deployment.

## Third-party notices

The self-hosted Inter font uses the
[SIL Open Font License](licenses/INTER.txt).
[Lucide icon notices](licenses/LUCIDE.txt) and
[Jake's Resume attribution](licenses/LICENSE-JAKE.txt) are included separately.
These notices do not assign a blanket license to portfolio content,
research data, or other repositories.
