import type { MetadataRoute } from "next";
import { isIndexable } from "@/lib/site-env";

/** The dev and preview sites duplicate the real one, so they block all crawlers. */
export default function robots(): MetadataRoute.Robots {
  return isIndexable ? { rules: { userAgent: "*", allow: "/" } } : { rules: { userAgent: "*", disallow: "/" } };
}
