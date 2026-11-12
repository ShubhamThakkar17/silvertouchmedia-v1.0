import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { setChannelImage } from "./frontmatter-edit";

const src = `---
slug: radio
heroImage: /images/brand/a.webp
cardImage: /images/brand/a-1024.webp
imageIsConcept: true
funnel: { awareness: 4, consideration: 3, conversion: 2, loyalty: 3 }
---

Body text.
`;

describe("setChannelImage", () => {
  it("swaps image lines, adds a credit and keeps everything else", () => {
    const out = setChannelImage(src, {
      heroImage: "/images/channels/radio/2.webp",
      cardImage: "/images/channels/radio/2-1024.webp",
      imageIsConcept: false,
      credit: { photographer: "A \"Quoted\" Name", url: "https://unsplash.com/photos/x", provider: "Unsplash", licence: "Unsplash License" },
    });
    const { data, content } = matter(out);
    expect(data.heroImage).toBe("/images/channels/radio/2.webp");
    expect(data.imageIsConcept).toBe(false);
    expect(data.imageCredit.photographer).toBe('A "Quoted" Name');
    expect(data.funnel).toEqual({ awareness: 4, consideration: 3, conversion: 2, loyalty: 3 });
    expect(out).toContain("funnel: { awareness: 4");
    expect(content.trim()).toBe("Body text.");
  });

  it("replaces an existing credit instead of duplicating it", () => {
    const pick = {
      heroImage: "/x.webp",
      cardImage: "/x-1024.webp",
      imageIsConcept: false,
      credit: { photographer: "One", url: "https://pexels.com/1", provider: "Pexels" as const, licence: "Pexels License" },
    };
    const twice = setChannelImage(setChannelImage(src, pick), { ...pick, credit: { ...pick.credit, photographer: "Two" } });
    expect(twice.match(/imageCredit:/g)).toHaveLength(1);
    expect(matter(twice).data.imageCredit.photographer).toBe("Two");
  });

  it("removes the credit when reverting to a brand image", () => {
    const withCredit = setChannelImage(src, {
      heroImage: "/x.webp",
      cardImage: "/x-1024.webp",
      imageIsConcept: false,
      credit: { photographer: "One", url: "https://pexels.com/1", provider: "Pexels", licence: "Pexels License" },
    });
    const back = setChannelImage(withCredit, { heroImage: "/b.webp", cardImage: "/b-1024.webp", imageIsConcept: true });
    expect(matter(back).data.imageCredit).toBeUndefined();
    expect(matter(back).data.imageIsConcept).toBe(true);
  });
});
