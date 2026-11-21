/**
 * Which deployment this build is. The dev site (dev branch, dev API) sets
 * `SITE_ENV=dev`; production leaves it unset. Vercel preview builds are never
 * indexable either.
 */
export const isIndexable = (process.env.SITE_ENV ?? "production") === "production" && process.env.VERCEL_ENV !== "preview";
