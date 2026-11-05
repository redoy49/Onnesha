import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/db/articles-store";
import { Header } from "@/components/header";
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onneshax.vercel.app";
  const canonicalUrl = `${baseUrl}/blog/${encodeURIComponent(article.slug)}`;

  return {
    title: `${article.title} | Onnesha`,
    description: article.metaDescription || article.excerpt,
    authors: [{ name: article.author }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription || article.excerpt,
      images: [{ url: article.coverImage, alt: article.title }],
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      locale: "bn_BD",
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onneshax.vercel.app";
  const articleUrl = `${baseUrl}/blog/${encodeURIComponent(article.slug)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: [article.coverImage],
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: "bn-BD",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Onnesha",
      url: baseUrl,
    },
    citation: (article.sources || []).map((s) => s.url),
    keywords: (article.tags || []).join(", "),
    articleSection: article.category,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        "position": 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        name: article.category,
        item: `${baseUrl}/?category=${encodeURIComponent(article.category)}`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-slate-800 bg-mesh-glow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="pt-6 sm:pt-8 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <ArticleReader
          article={article}
          relatedArticles={relatedArticles}
          isModal={false}
        />
      </main>
    </div>
  );
}
