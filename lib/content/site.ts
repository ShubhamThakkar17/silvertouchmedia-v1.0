import "server-only";
import { cache } from "react";
import { loadIndustries, loadServices } from "./collections";

/** Cached server accessors for the non-channel collections. */
export const getServices = cache(loadServices);
export const getService = (slug: string) => getServices().find((s) => s.slug === slug);
export const getIndustries = cache(loadIndustries);
export const getIndustry = (slug: string) => getIndustries().find((i) => i.slug === slug);
