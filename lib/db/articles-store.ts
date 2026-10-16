import fs from "fs";
import path from "path";
import { Article } from "@/types/article";
import { initialArticles } from "@/lib/data/articles";
import { neon } from "@neondatabase/serverless";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "published-articles.json");

// In-memory cache for serverless environments where disk writes might be ephemeral
let memoryArticles: Article[] = [];
let neonTableInitialized = false;

function getNeonClient() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!dbUrl) return null;
  try {
    return neon(dbUrl);
  } catch (err) {
    console.warn("Could not initialize Neon client:", err);
    return null;
  }
}

async function ensureNeonTable(sql: any) {
  if (neonTableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        read_time TEXT,
        author TEXT,
        author_avatar TEXT,
        date TEXT,
        cover_image TEXT,
        excerpt TEXT,
        meta_description TEXT,
        body TEXT NOT NULL,
        tags JSONB,
        likes INT DEFAULT 0,
        claps INT DEFAULT 0,
        bookmarked BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        comments JSONB DEFAULT '[]'::jsonb,
        status TEXT DEFAULT 'published',
        sources JSONB DEFAULT '[]'::jsonb,
        seo_keywords JSONB DEFAULT '[]'::jsonb,
        generated_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    neonTableInitialized = true;
  } catch (err) {
    console.warn("Could not ensure Neon articles table:", err);
  }
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create data directory, using memory store:", err);
  }
}

function readStoredArticles(): Article[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ARTICLES_FILE)) {
      const data = fs.readFileSync(ARTICLES_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading published-articles.json:", err);
  }
  return memoryArticles;
}

function writeStoredArticles(articles: Article[]): boolean {
  memoryArticles = articles;
  try {
    ensureDataDir();
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn("Error writing published-articles.json (using memory):", err);
    return false;
  }
}

/**
 * Get all articles:
 * Checks Neon Cloud Postgres if DATABASE_URL is configured,
 * otherwise falls back seamlessly to local JSON file & initialArticles.
 */
export async function getAllArticles(): Promise<Article[]> {
  const sql = getNeonClient();
  let dynamicArticles: Article[] = [];

  if (sql) {
    try {
      await ensureNeonTable(sql);
      const rows = (await sql`SELECT * FROM articles ORDER BY created_at DESC`) as any[];
      dynamicArticles = rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category,
        readTime: r.read_time || "6 MIN READ",
        author: r.author || "Elena Rostova",
        authorAvatar: r.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
        date: r.date,
        coverImage: r.cover_image,
        excerpt: r.excerpt,
        metaDescription: r.meta_description,
        body: r.body,
        tags: Array.isArray(r.tags) ? r.tags : [],
        likes: r.likes || 0,
        claps: r.claps || 0,
        bookmarked: Boolean(r.bookmarked),
        featured: Boolean(r.featured),
        comments: Array.isArray(r.comments) ? r.comments : [],
        status: r.status || "published",
        sources: Array.isArray(r.sources) ? r.sources : [],
        seoKeywords: Array.isArray(r.seo_keywords) ? r.seo_keywords : [],
        generatedBy: r.generated_by,
      }));
    } catch (err) {
      console.warn("Failed fetching from Neon Postgres, using file fallback:", err);
      dynamicArticles = readStoredArticles();
    }
  } else {
    dynamicArticles = readStoredArticles();
  }
  
  // Combine, giving priority to dynamic articles if duplicate IDs exist
  const combinedMap = new Map<string | number, Article>();
  
  // 1. Initial articles
  initialArticles.forEach((a) => {
    combinedMap.set(a.id, a);
  });
  
  // 2. Dynamic articles (can override or add)
  dynamicArticles.forEach((a) => {
    combinedMap.set(a.id, a);
  });

  const list = Array.from(combinedMap.values());
  // Sort descending by ID or date
  return list.sort((a, b) => {
    const idA = typeof a.id === "number" ? a.id : parseInt(String(a.id).replace(/\D/g, "")) || 0;
    const idB = typeof b.id === "number" ? b.id : parseInt(String(b.id).replace(/\D/g, "")) || 0;
    return idB - idA;
  });
}

/**
 * Find an article by its unique slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug) || null;
}

/**
 * Check if a title or slug is already taken (to prevent repeated or duplicate articles)
 */
export async function isSlugOrTitleTaken(title: string, slug: string): Promise<boolean> {
  const all = await getAllArticles();
  const cleanTitle = title.trim().toLowerCase();
  const cleanSlug = slug.trim().toLowerCase();

  return all.some(
    (a) => a.slug.toLowerCase() === cleanSlug || a.title.trim().toLowerCase() === cleanTitle
  );
}

/**
 * Save a newly published or generated article to the persistent store
 * (Inserts to Neon Cloud Postgres if configured, and caches to local JSON)
 */
export async function saveArticle(article: Article): Promise<Article> {
  const sql = getNeonClient();

  if (sql) {
    try {
      await ensureNeonTable(sql);
      const articleId = String(article.id);
      await sql`
        INSERT INTO articles (
          id, slug, title, category, read_time, author, author_avatar,
          date, cover_image, excerpt, meta_description, body,
          tags, likes, claps, bookmarked, featured, comments,
          status, sources, seo_keywords, generated_by
        ) VALUES (
          ${articleId}, ${article.slug}, ${article.title}, ${article.category},
          ${article.readTime || "6 MIN READ"}, ${article.author}, ${article.authorAvatar},
          ${article.date}, ${article.coverImage}, ${article.excerpt},
          ${article.metaDescription || article.excerpt.slice(0, 155)}, ${article.body},
          ${JSON.stringify(article.tags || [])}, ${article.likes || 0}, ${article.claps || 0},
          ${article.bookmarked || false}, ${article.featured || false}, ${JSON.stringify(article.comments || [])},
          ${article.status || "published"}, ${JSON.stringify(article.sources || [])},
          ${JSON.stringify(article.seoKeywords || [])}, ${article.generatedBy || "AI Agent"}
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          read_time = EXCLUDED.read_time,
          body = EXCLUDED.body,
          excerpt = EXCLUDED.excerpt,
          meta_description = EXCLUDED.meta_description,
          tags = EXCLUDED.tags,
          status = EXCLUDED.status,
          sources = EXCLUDED.sources,
          seo_keywords = EXCLUDED.seo_keywords,
          generated_by = EXCLUDED.generated_by
      `;
    } catch (err) {
      console.warn("Failed saving to Neon, fallback to file store:", err);
    }
  }

  // Always write to local JSON store as well
  const stored = readStoredArticles();
  const existingIndex = stored.findIndex((a) => a.id === article.id || a.slug === article.slug);
  if (existingIndex >= 0) {
    stored[existingIndex] = article;
  } else {
    stored.unshift(article);
  }

  writeStoredArticles(stored);
  return article;
}

/**
 * Delete an article by ID
 */
export async function deleteArticle(id: number | string): Promise<boolean> {
  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureNeonTable(sql);
      const strId = String(id);
      await sql`DELETE FROM articles WHERE id = ${strId}`;
    } catch (err) {
      console.warn("Failed deleting from Neon:", err);
    }
  }

  const stored = readStoredArticles();
  const filtered = stored.filter((a) => a.id !== id);
  writeStoredArticles(filtered);
  return true;
}

/**
 * Promote a draft article to published live status
 */
export async function publishArticle(id: number | string): Promise<Article | null> {
  const all = await getAllArticles();
  const article = all.find((a) => a.id === id || String(a.id) === String(id));
  if (!article) return null;

  article.status = "published";
  await saveArticle(article);
  return article;
}

/**
 * Check cloud database status
 */
export function getDatabaseStatus(): { type: "neon" | "local"; connected: boolean } {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  return {
    type: dbUrl ? "neon" : "local",
    connected: Boolean(dbUrl),
  };
}
