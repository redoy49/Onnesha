import { Article, Author } from "@/types/article";

export const defaultAuthor: Author = {
  name: "Elena Rostova",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
  role: "Lead Systems Architect & AI Researcher",
  bio: "Writing about AI-augmented design systems, modern front-end performance, and high-contrast digital interfaces."
};

// All dummy data removed - only real published dispatches will be displayed
export const initialArticles: Article[] = [];
