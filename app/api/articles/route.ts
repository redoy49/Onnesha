import { NextRequest, NextResponse } from "next/server";
import { getAllArticles, saveArticle } from "@/lib/db/articles-store";
import { Article } from "@/types/article";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (err) {
    console.error("GET /api/articles error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Article;
    if (!body || !body.title || !body.body) {
      return NextResponse.json(
        { success: false, error: "Missing required article title or body" },
        { status: 400 }
      );
    }

    const saved = await saveArticle(body);
    return NextResponse.json({
      success: true,
      article: saved,
    });
  } catch (err) {
    console.error("POST /api/articles error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save article" },
      { status: 500 }
    );
  }
}
