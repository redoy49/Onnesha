export interface Comment {
  id: string;
  name: string;
  time: string;
  text: string;
  avatar?: string;
}

export interface Author {
  name: string;
  avatar: string;
  role?: string;
  bio?: string;
}

export interface Article {
  id: number | string;
  slug: string;
  title: string;
  category: "UX Design" | "AI & Prompts" | "Coding & Tech" | "Web Development" | "Brand Strategy" | "Marketing" | string;
  readTime: string;
  author: string;
  authorAvatar: string;
  date: string;
  coverImage: string;
  excerpt: string;
  body: string;
  tags: string[];
  likes: number;
  claps: number;
  bookmarked: boolean;
  comments: Comment[];
  featured?: boolean;
  status?: "published" | "draft";
  sources?: { title: string; url: string }[];
  seoKeywords?: string[];
  metaDescription?: string;
  generatedBy?: string;
}

export type CategoryFilter = "All" | "AI & Prompts" | "Coding & Tech" | "UX Design" | "Web Development" | "Saved";
export type LayoutMode = "list" | "grid";
