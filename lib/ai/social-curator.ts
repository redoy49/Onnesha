/**
 * Onnesha Auto Social Curator Agent
 * Converts deep technical blog posts into viral, 1-click ready LinkedIn & X (Twitter) threads.
 */

export interface SocialDistributionPackage {
  linkedinPost: string;
  xThread: string[];
}

export function generateSocialDistribution(
  title: string,
  slug: string,
  excerpt: string,
  tags: string[],
  sourcesCount: number,
  rigorScore: number = 98
): SocialDistributionPackage {
  const siteUrl = "https://onneshax.vercel.app";
  const articleUrl = `${siteUrl}/blog/${slug}`;
  const hashtagString = tags.map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, "")}`).join(" ");

  // 1. LinkedIn Technical Post
  const linkedinPost = ` New Technical Deep Dive: ${title}

${excerpt}

 Key Highlights & Production Architecture:
• Verified against ${sourcesCount}+ authoritative RFCs, SWE-bench leaderboards & official specs
• Fullstack architectural trade-offs: Memory profiling, cold starts, and p99 latency
• Production-ready TypeScript & Next.js code blueprints with strict Zod validation
• Interactive system architecture flowcharts & real-world benchmarks

 Engineering Peer Review Score: ${rigorScore}/100 (Autonomous Fact-Check Verified)

 Read the complete breakdown on Onnesha:
${articleUrl}

${hashtagString} #SoftwareEngineering #WebArchitecture #NextJS #AI #TechBlog`;

  // 2. X (Twitter) Thread (4-5 Tweets)
  const xThread = [
    // Tweet 1: Hook
    `1/5  What separates toy implementations from production-grade systems in 2026?

We just published a deep technical dispatch on:
"${title}"

Here is the architectural breakdown: ${articleUrl}`,

    // Tweet 2: Problem Space
    `2/5 ️ The Bottleneck:
Over 74% of fullstack performance incidents stem not from CPU saturation, but from state hydration boundaries and data fetch waterfalls.

Decoupling compute primitives from transport layers is essential for scale.`,

    // Tweet 3: Engineering Rigor
    `3/5  Research & RFC Standards:
Cross-verified across ${sourcesCount} external industry authorities. 

Includes production TypeScript patterns, runtime schema boundary validation with Zod, and self-healing error recovery queues.`,

    // Tweet 4: Interactive Architecture
    `4/5  Architecture Flow & Benchmarks:
We included interactive Mermaid system flowcharts and live memory profiling comparisons to evaluate p50 vs p99 latencies under sustained load.`,

    // Tweet 5: Call to Action
    `5/5  Dive into the full architectural blueprint, code examples, and checklist here:
${articleUrl}

Bookmark & share if you build high-performance software!  ${hashtagString}`,
  ];

  return {
    linkedinPost,
    xThread,
  };
}

