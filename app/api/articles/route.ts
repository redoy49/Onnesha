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
    const json = (await req.json()) as any;
    
    // Support bulk sync from admin dashboard
    if (json && Array.isArray(json.articles)) {
      for (const a of json.articles) {
        if (a && a.title && a.body) {
          await saveArticle(a);
        }
      }
      return NextResponse.json({
        success: true,
        count: json.articles.length,
      });
    }

    const body = json as Article;
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

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const status = url.searchParams.get("status");

    if (id) {
      const { deleteArticle } = await import("@/lib/db/articles-store");
      await deleteArticle(id);
      return NextResponse.json({ success: true, message: `Article ${id} deleted` });
    }

    if (status === "draft") {
      const { deleteDraftArticles } = await import("@/lib/db/articles-store");
      await deleteDraftArticles();
      return NextResponse.json({ success: true, message: "All drafts deleted successfully" });
    }

    const { clearAllArticles } = await import("@/lib/db/articles-store");
    await clearAllArticles();
    return NextResponse.json({ success: true, message: "All articles cleared successfully" });
  } catch (err) {
    console.error("DELETE /api/articles error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete articles" },
      { status: 500 }
    );
  }
}
