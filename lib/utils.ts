import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\p{L}\p{N}\-]+/gu, "") // Allow Unicode letters & numbers (Bengali, etc.)
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function getFormattedToday(): string {
  const date = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${Math.max(1, minutes)} MIN READ`;
}
