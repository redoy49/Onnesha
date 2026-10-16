import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/db/articles-store";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArticleReader } from "@/components/article-reader";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Story Not Found | Onnesha",
    };
  }

  return {
    title: `${article.title} | Onnesha`,
    description: article.metaDescription || article.excerpt,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.metaDescription || article.excerpt,
      images: [{ url: article.coverImage }],
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription || article.excerpt,
      images: [article.coverImage],
    },
  };
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Find 2 recommended next stories (prioritize same category)
  const allArticles = await getAllArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => (a.category === article.category ? -1 : 1))
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1 w-full pt-16 sm:pt-20 pb-16">
        <ArticleReader
          article={article}
          relatedArticles={relatedArticles}
          isModal={false}
        />
      </main>
      <Footer />
    </div>
  );
}
