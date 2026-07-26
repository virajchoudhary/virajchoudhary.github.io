# Viraj Choudhary — Neural Portfolio

Phase 1 of a neural-network portfolio built with Next.js, React Three Fiber, custom shaders, and a fully accessible semantic project layer.

## Asset safety

Application code references only `/neural-reference.png`. That runtime file is generated and ignored by Git.

- `assets/neural-reference-public.png` is the committed public fallback.
- `.local-assets/neural-reference-original.png` is an optional, untracked local review master.
- `public/neural-reference.png` is selected at runtime by the asset scripts and is never committed.

The original image must not be committed, pushed, uploaded to a PR, or included in CI artifacts.

## Run locally

Install dependencies:

```bash
npm ci
```

Run the repository using the committed public fallback:

```bash
npm run dev:public
```

Open [http://localhost:3000](http://localhost:3000).

For local review with the protected original image, place it at `.local-assets/neural-reference-original.png`, then run:

```bash
npm run dev
```

Original mode fails clearly if that local-only file is unavailable.

## Validation

```bash
npm ls --all
npm run lint
npm run typecheck
npm run build
npm run build:public
```

`build:public` exports the site and then verifies:

- the exported runtime image exactly matches the public fallback;
- no exported file matches the protected original image;
- no export references an original-master filename;
- prohibited local/runtime assets are not tracked;
- source images are not duplicates;
- exported HTML identifies `data-neural-profile="public"`.

The profile build variable is deliberately strict. Only `NEXT_PUBLIC_NEURAL_PROFILE=original` and `NEXT_PUBLIC_NEURAL_PROFILE=public` are accepted.

## Dependency compatibility notes

All package versions are exact and the committed `package-lock.json` is the reproducibility contract.

- TypeScript is pinned to `6.0.3` instead of the newer `7.0.2` candidate because the `typescript-eslint` version supplied by `eslint-config-next@16.2.12` declares support below TypeScript `6.1`.
- ESLint is pinned to `9.39.5` instead of the newer `10.8.0` candidate because the React and import plugins supplied by `eslint-config-next@16.2.12` declare ESLint 9 peer support.
- Node.js `22.13.0` or newer is required by the selected Next.js and `cross-env` versions. CI uses Node.js `22.18.0`.

No install or validation command uses `--force` or `--legacy-peer-deps`.

## Production preview

After a successful export:

```bash
npm run preview
```

The preview server serves `out/` at [http://localhost:4173](http://localhost:4173).

## Publishing boundaries

This phase does not deploy the site. The public fallback is suitable for CI and PR checks. Public use of the protected original image requires explicit confirmation of usage rights.
