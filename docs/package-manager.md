# Package manager

Deployments (including Vercel) use **pnpm** because the repo includes `pnpm-lock.yaml`.

After any change to `package.json` or new dependencies, run **`pnpm install`** at the repo root and commit the updated **`pnpm-lock.yaml`**. Using only `npm install` updates `package-lock.json` but leaves the pnpm lockfile stale, which breaks CI installs that use a frozen lockfile.

The repo may still contain `package-lock.json` from earlier workflows; treat **`pnpm-lock.yaml` as the source of truth** for reproducible installs.
