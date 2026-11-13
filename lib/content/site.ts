import "server-only";
import { cache } from "react";
import { loadIndustries, loadInsights, loadServices } from "./collections";

/** Cached server accessors for the non-channel collections. */
export const getServices = cache(loadServices);
export const getService = (slug: string) => getServices().find((s) => s.slug === slug);
export const getIndustries = cache(loadIndustries);
export const getIndustry = (slug: string) => getIndustries().find((i) => i.slug === slug);
export const getInsights = cache(loadInsights);
export const getInsight = (slug: string) => getInsights().find((i) => i.slug === slug);
