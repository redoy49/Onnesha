/**
 * Drizzle ORM Schema Specification for Onnesha Platform
 * Can be connected to Neon, Supabase, or any PostgreSQL instance via Drizzle Kit.
 */
export interface DbArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  authorId: string;
  coverImage: string;
  excerpt: string;
  body: string;
  tags: string[];
  likes: number;
  claps: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbAuthor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  role: string;
}

export interface DbComment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface DbBookmark {
  userId: string;
  articleId: string;
  createdAt: Date;
}
