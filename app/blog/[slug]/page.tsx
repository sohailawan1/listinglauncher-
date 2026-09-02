import type { Metadata } from "next";
import Link from "next/link";
import { getPost, blogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const paragraphs = post.content.split(/\n\n+/);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/blog" className="text-xs font-semibold text-brand-600 hover:underline">
        ← All posts
      </Link>
      <span className="mt-5 inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
        {post.category}
      </span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-ink-500">
        {new Date(post.publishedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        · {post.readMinutes} min read
      </p>
      <article className="prose prose-stone mt-8 max-w-none text-ink-700">
        {paragraphs.map((p, i) => {
          if (p.startsWith("## ")) {
            return (
              <h2 key={i} className="mt-8 text-xl font-bold text-ink-900">
                {p.replace(/^## /, "")}
              </h2>
            );
          }
          if (p.startsWith("```")) {
            return (
              <pre key={i} className="my-4 overflow-x-auto rounded-2xl bg-ink-900 p-4 text-xs text-ink-100">
                <code>{p.replace(/```/g, "")}</code>
              </pre>
            );
          }
          if (p.startsWith("- ") || p.startsWith("• ")) {
            const items = p.split("\n").map((l) => l.replace(/^[-•]\s*/, "").trim());
            return (
              <ul key={i} className="my-4 space-y-2">
                {items.map((it, j) => (
                  <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                    {it}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="my-4 text-sm leading-relaxed text-ink-700">
              {renderInline(p)}
            </p>
          );
        })}
      </article>

      <div className="mt-12 rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50 to-amber-50 p-6 text-center">
        <p className="text-sm font-semibold text-ink-900">Try ListingLauncher free</p>
        <p className="mt-1 text-xs text-ink-600">Generate a platform-perfect listing in 10 seconds.</p>
        <Link
          href="/generate"
          className="mt-4 inline-flex rounded-full bg-ink-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
        >
          Open the generator
        </Link>
      </div>
    </main>
  );
}

function renderInline(text: string): React.ReactNode {
  // Bold via **, inline code via `, link via [text](url).
  const parts: React.ReactNode[] = [];
  let buf = "";
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        if (buf) parts.push(buf);
        buf = "";
        parts.push(<strong key={i} className="font-semibold text-ink-900">{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        if (buf) parts.push(buf);
        buf = "";
        parts.push(<code key={i} className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[12px] text-ink-800">{text.slice(i + 1, end)}</code>);
        i = end + 1;
        continue;
      }
    }
    if (text.startsWith("[", i)) {
      const close = text.indexOf("]", i);
      const paren = text.indexOf("(", close);
      const end = text.indexOf(")", paren);
      if (close !== -1 && paren === close + 1 && end !== -1) {
        if (buf) parts.push(buf);
        buf = "";
        const label = text.slice(i + 1, close);
        const url = text.slice(paren + 1, end);
        const isInternal = url.startsWith("/");
        parts.push(
          isInternal ? (
            <Link key={i} href={url} className="font-semibold text-brand-600 underline">
              {label}
            </Link>
          ) : (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="font-semibold text-brand-600 underline">
              {label}
            </a>
          )
        );
        i = end + 1;
        continue;
      }
    }
    buf += text[i];
    i++;
  }
  if (buf) parts.push(buf);
  return parts.length ? parts : text;
}
