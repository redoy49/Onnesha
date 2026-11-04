/**
 * Humanizer Module for Onnesha Technical Editorial Platform
 * Based on the Humanizer Skill (Anti-AI Writing Patterns & Voice Calibration)
 *
 * Removes telltale AI-generated clichés, sterile transitions, and boilerplate
 * from Bengali and English technical writing, injecting authentic developer cadence,
 * opinionated engineering tone, and crisp readability.
 */

// Common English AI clichés and their humanized engineering replacements
const ENGLISH_AI_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bdelve(?:\s+into)?\b/gi, replacement: "examine" },
  { pattern: /\ba testament to\b/gi, replacement: "proof of" },
  { pattern: /\brich tapestry\b/gi, replacement: "complex system" },
  { pattern: /\bbeacon of\b/gi, replacement: "standard for" },
  { pattern: /\bgame-changer\b/gi, replacement: "significant shift" },
  { pattern: /\brevolutionize\b/gi, replacement: "transform" },
  { pattern: /\bcrucial role\b/gi, replacement: "key part" },
  { pattern: /\bnavigating the landscape of\b/gi, replacement: "working with" },
  { pattern: /\bin conclusion,\b/gi, replacement: "To wrap up," },
  { pattern: /\bit is important to remember that\b/gi, replacement: "Keep in mind that" },
  { pattern: /\bharness(?:ing)? the power of\b/gi, replacement: "leveraging" },
  { pattern: /\bunleash(?:ing)?\b/gi, replacement: "enabling" },
  { pattern: /\bever-evolving\b/gi, replacement: "shifting" },
  { pattern: /\bfoster(?:ing)?\b/gi, replacement: "building" },
  { pattern: /\bplethora of\b/gi, replacement: "range of" },
];

// Common Bengali AI clichés (robotic translation phrases) and natural developer replacements
const BENGALI_AI_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  {
    pattern: /আমরা একটি নতুন দিগন্তে প্রবেশ করছি[।,]?/gi,
    replacement: "বাস্তবে প্রযুক্তির এই পরিবর্তনটি অত্যন্ত দ্রুত ঘটছে।",
  },
  {
    pattern: /এটি অনস্বীকার্য যে[।,]?/gi,
    replacement: "সত্যি বলতে,",
  },
  {
    pattern: /সারসংক্ষেপে বলা যায় যে[।,]?/gi,
    replacement: "সহজ কথায় বলতে গেলে,",
  },
  {
    pattern: /একটি ডিজিটাল বিপ্লব সাধিত হয়েছে[।,]?/gi,
    replacement: "ইন্ডাস্ট্রিতে বেশ বড় ধরণের মোড় এসেছে।",
  },
  {
    pattern: /গুরুত্বপূর্ণ ভূমিকা পালন করে[।,]?/gi,
    replacement: "সরাসরি প্রভাব ফেলে।",
  },
  {
    pattern: /স্মরণ রাখা আবশ্যক যে[।,]?/gi,
    replacement: "যে বিষয়টি প্রডাকশনে সবচেয়ে বেশি মাথায় রাখা দরকার,",
  },
  {
    pattern: /বর্তমান বিশ্বের প্রেক্ষাপটে[।,]?/gi,
    replacement: "২০২৬ সালের বর্তমান আর্কিটেকচারে",
  },
  {
    pattern: /যুগান্তকারী পরিবর্তন[।,]?/gi,
    replacement: "বড় ধরণের পারফরম্যান্স আপগ্রেড",
  },
  {
    pattern: /অসামান্য অবদান রাখে[।,]?/gi,
    replacement: "বাস্তব কাজের গতি বাড়িয়ে দেয়।",
  },
  {
    pattern: /পরিশেষে বলা যায় যে[।,]?/gi,
    replacement: "উপসংহারে আমার নিজস্ব পর্যবেক্ষণ হলো,",
  },
  {
    pattern: /আলোচনা করা যাক[।,]?/gi,
    replacement: "বাস্তব উদাহরণ দিয়ে দেখা যাক।",
  },
];

/**
 * Deterministic humanization pass:
 * Scans content and strips known synthetic AI patterns, ensuring smooth Bengali and English flow.
 */
export function applyDeterministicHumanizer(content: string, language: "bn" | "en" = "bn"): string {
  if (!content || typeof content !== "string") return content;

  let humanized = content;

  // Apply language-specific patterns
  if (language === "bn") {
    for (const { pattern, replacement } of BENGALI_AI_PATTERNS) {
      humanized = humanized.replace(pattern, replacement);
    }
  }

  // Also clean any English clichés inside brackets, code comments, or bilingual sentences
  for (const { pattern, replacement } of ENGLISH_AI_PATTERNS) {
    humanized = humanized.replace(pattern, replacement);
  }

  // Strip formulaic ending fluff like "Thank you for reading this article" or "Feel free to share your thoughts"
  humanized = humanized.replace(
    /<p>\s*(?:ধন্যবাদ|Thank you for reading|Feel free to leave a comment).*?<\/p>/gi,
    ""
  );

  return humanized;
}

/**
 * System prompt instructions for generating or rewriting humanized, high-ranking content
 */
export function getHumanizerSystemGuidelines(language: "bn" | "en" = "bn"): string {
  if (language === "bn") {
    return `
### HUMANIZER & AUTHENTIC VOICE GUIDELINES (বাংলা টেকনিক্যাল স্টাইল):
1. **স্বাভাবিক ও প্রাণবন্ত ভাষা**: কোনো রোবোটিক বা গুগল ট্রান্সলেটের মতো ভাষা ব্যবহার করবেন না। একজন অভিজ্ঞ বাংলাদেশি সফটওয়্যার আর্কিটেক্ট বন্ধুদের সাথে যেভাবে কথা বলেন বা টেক ব্লগে লেখেন, ঠিক সেভাবে স্বাভাবিক বাংলায় লিখবেন।
2. **ইংরেজি টেকনিক্যাল টার্মের সঠিক ব্যবহার**: প্রোগ্রামিং ও টেকনিক্যাল টার্মগুলোকে জোর করে বাংলায় অনুবাদ করবেন না। যেমন: "Server Actions" কে "সার্ভার কার্যাবলী" লিখবেন না; বরং "সার্ভার অ্যাকশন (Server Actions)" বা সরাসরি ইংরেজি কোড আকারে ব্যবহার করবেন।
3. **ক্লিশে বর্জন**: "আমরা একটি নতুন দিগন্তে", "এটি অনস্বীকার্য যে", "পরিশেষে বলা যায় যে", "যুগান্তকারী বিপ্লব"—এই ধরণের কৃত্রিম AI শব্দ কঠোরভাবে নিষিদ্ধ।
4. **বাস্তব অভিজ্ঞতা ও মতামত**: শুধু তাত্ত্বিক কথা না লিখে প্রডাকশনে কাজ করার সময় কী ধরণের সমস্যা বা মেমরি লিক হয়, কোন ল্যাঙ্গুয়েজ শিখলে ক্যারিয়ারে কী সুবিধা হবে—তা স্পষ্ট ও স্পষ্টভাবে তুলে ধরুন।
5. **বাক্যের ছন্দের বৈচিত্র্য**: কিছু বাক্য ছোট ও সরাসরি হবে, কিছু বাক্য বর্ণনামূলক হবে। একঘেয়ে কাঠামো পরিহার করুন।
`;
  }

  return `
### HUMANIZER & AUTHENTIC VOICE GUIDELINES (English Technical Style):
1. **Strip AI Clichés**: Never use "delve", "testament", "tapestry", "beacon", "game-changer", "revolutionize", "crucial landscape", or "in conclusion".
2. **Have Opinions**: Critique trade-offs directly. Compare memory footprints, developer experience, and cold-start latencies with real-world perspective.
3. **Vary Rhythm**: Mix punchy one-clause sentences with longer analytical descriptions. Avoid uniform paragraph length.
4. **No Synthetic Fluff**: Cut corporate cheerleading and hollow conclusions. End with concrete recommendations.
`;
}

