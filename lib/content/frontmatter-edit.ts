/**
 * Line-level edits to MDX frontmatter. Used by the dev-only image picker so a pick
 * changes only the image lines and keeps the rest of the file exactly as written
 * (a full YAML round-trip would reflow comments and flow-style maps).
 */
export type ImagePick = {
  heroImage: string;
  cardImage: string;
  imageIsConcept: boolean;
  credit?: { photographer: string; url: string; provider: "Unsplash" | "Pexels"; licence: string };
};

const q = (s: string) => JSON.stringify(s);

export function setChannelImage(mdx: string, pick: ImagePick): string {
  const m = mdx.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error("No frontmatter block found");
  let fm = m[1];

  const setLine = (key: string, value: string) => {
    const re = new RegExp(`^${key}:.*$`, "m");
    fm = re.test(fm) ? fm.replace(re, `${key}: ${value}`) : `${fm}\n${key}: ${value}`;
  };
  setLine("heroImage", pick.heroImage);
  setLine("cardImage", pick.cardImage);
  setLine("imageIsConcept", String(pick.imageIsConcept));

  // Drop any existing imageCredit block (the key line plus its indented children).
  fm = fm.replace(/^imageCredit:.*\n(?:[ \t]+.*\n?)*/m, "");
  if (pick.credit) {
    const block = [
      "imageCredit:",
      `  photographer: ${q(pick.credit.photographer)}`,
      `  url: ${q(pick.credit.url)}`,
      `  provider: ${pick.credit.provider}`,
      `  licence: ${q(pick.credit.licence)}`,
    ].join("\n");
    fm = fm.replace(/^(imageIsConcept:.*)$/m, `$1\n${block}`);
  }
  return mdx.replace(m[0], `---\n${fm.replace(/\n+$/, "")}\n---\n`);
}
