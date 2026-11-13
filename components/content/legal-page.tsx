import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { brand, copy } from "@/brand";
import { MdxBody } from "./mdx-body";

export function readLegal(slug: "privacy" | "terms") {
  const { data, content } = matter(fs.readFileSync(path.join(process.cwd(), "content/legal", `${slug}.mdx`), "utf8"));
  return { title: String(data.title), updated: String(data.updated), body: content.trim() };
}

/** Privacy / terms page shell; text lives in content/legal/*.mdx. */
export function LegalPage({ slug }: { slug: "privacy" | "terms" }) {
  const doc = readLegal(slug);
  return (
    <>
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1100px] px-4 pb-14 pt-36 md:px-8 md:pt-44">
          <h1 className="display-xl">{doc.title}</h1>
          <p className="mono-label mt-6 text-paper/55">
            {copy.legal.updated}: {doc.updated}
          </p>
        </div>
      </section>
      <article className="bg-paper text-ink">
        <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8 md:py-24">
          <MdxBody source={doc.body} />
          <div className="mt-12 max-w-3xl rounded-[var(--brand-radius-card)] bg-paper-2 p-6">
            <h2 className="mono-label text-ink/65">{copy.contactPage.eyebrow}</h2>
            <p className="mt-2 text-lg">
              {brand.name}, {brand.address.display}
              <br />
              <a href={`mailto:${brand.contact.email}`} className="underline underline-offset-4">
                {brand.contact.email}
              </a>{" "}
              · <a href={`tel:${brand.contact.phoneE164}`}>{brand.contact.phone}</a>
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
