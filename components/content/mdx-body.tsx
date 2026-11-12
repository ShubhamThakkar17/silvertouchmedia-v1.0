import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";

const components = {
  h2: (p: ComponentProps<"h2">) => <h2 className="mt-12 font-display text-3xl font-medium tracking-tight" {...p} />,
  h3: (p: ComponentProps<"h3">) => <h3 className="mono-label mt-10 text-coral" {...p} />,
  p: (p: ComponentProps<"p">) => <p className="mt-5 text-lg leading-relaxed text-current/80" {...p} />,
  ul: (p: ComponentProps<"ul">) => <ul className="mt-5 space-y-3 text-lg" {...p} />,
  li: (p: ComponentProps<"li">) => (
    <li className="relative pl-6 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:size-2 before:rounded-full before:bg-coral" {...p} />
  ),
  strong: (p: ComponentProps<"strong">) => <strong className="font-medium text-current" {...p} />,
  a: (p: ComponentProps<"a">) => <a className="underline decoration-coral underline-offset-4" {...p} />,
};

/** Renders trusted MDX from /content. JS expressions stay blocked (next-mdx-remote default). */
export function MdxBody({ source }: { source: string }) {
  return (
    <div className="max-w-3xl">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
