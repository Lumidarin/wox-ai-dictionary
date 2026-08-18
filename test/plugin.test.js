"use strict";

const assert = require("assert");
const { _internals } = require("../index.js");

const { buildPrompt, modelName, decodeEntities, htmlToText, tableToMarkdown, stripLeadingHeadword, resolveImages, parseAiCard, renderCard, endpoint, DEFAULT_PROMPT, settings } = _internals;

let passed = 0;
function ok(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

// ---------- htmlToText ----------
ok("htmlToText decodes numeric entities", () => {
  assert.strictEqual(htmlToText("&#x2192; &#8594; &#8220;quoted&#8221;"), "→ → “quoted”");
});

ok("htmlToText decodes named entities", () => {
  assert.strictEqual(htmlToText("a&nbsp;b&mdash;c&hellip;&middot;"), "a b—c…·");
});

ok("htmlToText keeps script/style out", () => {
  const out = htmlToText("<script>var x = 1;</script>word<style>.x{}</style>");
  assert.ok(!out.includes("script"));
  assert.ok(!out.includes("style"));
  assert.ok(out.includes("word"));
});

ok("htmlToText builds markdown structure", () => {
  const html = "<h3>n.</h3><ul><li><b>first</b> — 意思</li><li>second</li></ul>";
  const out = htmlToText(html);
  assert.ok(out.includes("### n."));
  assert.ok(out.includes("- **first** — 意思"));
  assert.ok(out.includes("- second"));
});

ok("htmlToText strips tags and collapses blank lines", () => {
  const out = htmlToText("<p>line1</p><p>line2</p><br><p>line3</p>");
  assert.ok(!out.includes("<"));
  assert.ok(!out.includes(">"));
  assert.ok(!out.includes("\n\n\n"));
});

ok("htmlToText keeps simple text intact", () => {
  assert.strictEqual(htmlToText("hello world"), "hello world");
});

ok("htmlToText normalizes unicode nbsp and thin spaces", () => {
  assert.strictEqual(htmlToText("a\u00a0b\u2009c\u3000d"), "a b c d");
});

ok("htmlToText handles bold/italic tags with attributes", () => {
  const out = htmlToText('<b class="t">word</b> <i id="x">gloss</i>');
  assert.strictEqual(out, "**word** *gloss*");
});

ok("htmlToText drops leftover img tags without alt text", () => {
  const out = htmlToText('<p>text <img src="/entry/a.png"> tail</p>');
  assert.ok(!out.includes("Image of"));
  assert.ok(!out.includes("/entry/a.png"));
  assert.ok(out.includes("text tail"));
});

ok("htmlToText filters dictionary UI junk lines", () => {
  const out = htmlToText("<p>real content</p><p>Trends of apple</p><p>View usage for: All years</p><p>Image of apple</p>");
  assert.ok(out.includes("real content"));
  assert.ok(!out.includes("Trends of"));
  assert.ok(!out.includes("View usage for"));
  assert.ok(!out.includes("Image of"));
});

// ---------- tableToMarkdown ----------
ok("tableToMarkdown converts tables to markdown tables", () => {
  const md = tableToMarkdown('<table><tr><td>head</td><td>2</td></tr><tr><td>a</td><td>b</td></tr></table>');
  assert.ok(md.includes("| head | 2 |"));
  assert.ok(md.includes("|---|---|"));
  assert.ok(md.includes("| a | b |"));
});

ok("tableToMarkdown leaves no table tags", () => {
  const md = tableToMarkdown("<table><tr><td>x</td></tr></table>");
  assert.ok(!md.includes("<table"));
});

// ---------- stripLeadingHeadword ----------
ok("stripLeadingHeadword removes a leading headword line", () => {
  assert.strictEqual(stripLeadingHeadword("apple\n æpəl\n content", "apple"), "æpəl\n content");
});

ok("stripLeadingHeadword is case-insensitive and trims", () => {
  assert.strictEqual(stripLeadingHeadword("APPLE\n content", "apple"), "content");
});

ok("stripLeadingHeadword leaves other content alone", () => {
  assert.strictEqual(stripLeadingHeadword("content", "apple"), "content");
});

// ---------- resolveImages ----------
ok("resolveImages replaces img src with markdown file image", async () => {
  const fakeDict = {
    mdd: async (src) => {
      if (src === "/entry/apple.png") return new Uint8Array([1, 2, 3, 4]);
      return null;
    }
  };
  const html = '<div><img src="/entry/apple.png" alt="pic"></div>';
  const out = await resolveImages(fakeDict, html);
  assert.ok(out.includes("![pic](file:///"));
  assert.ok(!out.includes("<img"));
});

ok("resolveImages returns html unchanged when no imgs", async () => {
  const fakeDict = { mdd: async () => null };
  assert.strictEqual(await resolveImages(fakeDict, "<p>plain</p>"), "<p>plain</p>");
});

// ---------- decodeEntities ----------
ok("decodeEntities handles hex, decimal and named", () => {
  assert.strictEqual(decodeEntities("&#x41;&#66;&amp;&#233;"), "AB&é");
});

ok("decodeEntities leaves unknown entities as-is", () => {
  assert.strictEqual(decodeEntities("&notaentity;"), "&notaentity;");
});

// ---------- endpoint ----------
ok("endpoint handles /v1", () => {
  assert.strictEqual(endpoint("https://example.com/v1"), "https://example.com/v1/chat/completions");
});

ok("endpoint handles full chat/completions", () => {
  assert.strictEqual(endpoint("https://example.com/chat/completions"), "https://example.com/chat/completions");
});

ok("endpoint appends /v1 when missing", () => {
  assert.strictEqual(endpoint("https://example.com"), "https://example.com/v1/chat/completions");
});

// ---------- modelName ----------
ok("modelName returns plain model name", () => {
  assert.strictEqual(modelName("deepseek-v4-flash"), "deepseek-v4-flash");
});

ok("modelName extracts Name from leftover selectAIModel JSON", () => {
  assert.strictEqual(modelName('{"Name":"deepseek-v4-flash","Provider":"openai","ProviderAlias":""}'), "deepseek-v4-flash");
});

ok("modelName returns empty for empty input", () => {
  assert.strictEqual(modelName(""), "");
  assert.strictEqual(modelName(null), "");
});

// ---------- buildPrompt ----------
ok("buildPrompt replaces {language} with the English name of the language", () => {
  const p = buildPrompt("apple", "日本語", "");
  assert.ok(p.includes("Definitions and meanings must be written in Japanese"));
  assert.ok(!p.includes("{language}"));
});

ok("buildPrompt replaces {language} for Russian and Polish", () => {
  assert.ok(buildPrompt("apple", "Русский", "").includes("written in Russian"));
  assert.ok(buildPrompt("apple", "Polski", "").includes("written in Polish"));
  assert.ok(buildPrompt("apple", "简体中文", "").includes("written in Simplified Chinese"));
});

ok("buildPrompt falls back to English for 自定义 when no name is set", () => {
  const prev = settings.customLanguage;
  settings.customLanguage = "";
  try {
    assert.ok(buildPrompt("apple", "自定义", "").includes("written in English"));
  } finally {
    settings.customLanguage = prev;
  }
});

ok("buildPrompt uses the custom language name when set", () => {
  const prev = settings.customLanguage;
  settings.customLanguage = "Swedish";
  try {
    assert.ok(buildPrompt("apple", "自定义", "").includes("written in Swedish"));
  } finally {
    settings.customLanguage = prev;
  }
});

ok("renderCard uses English structure for 自定义", () => {
  const card = renderCard("simp", "自定义", { pos: "n. [C]", br: "sɪmp", am: "sɪmp", def1: "a simp", def1en: "a simp", coll1: "simp for", coll1meaning: "to be a simp", note: "slang" });
  assert.ok(card.includes("Collocations"));
  assert.ok(card.includes("BrE"));
});

ok("buildPrompt replaces {term} with the word", () => {
  const p = buildPrompt("apple", "English", "");
  assert.ok(p.includes('Output data for the word "apple"'));
  assert.ok(!p.includes("{term}"));
});

ok("buildPrompt falls back to DEFAULT_PROMPT when empty", () => {
  assert.strictEqual(buildPrompt("apple", "English", "").replace(/\s+/g, " "), DEFAULT_PROMPT.replace(/\s+/g, " ").replace(/\{term\}/g, "apple").replace(/\{language\}/g, "English"));
});

ok("buildPrompt uses the custom prompt verbatim with replacements", () => {
  const custom = "Define {term} using {language}.";
  assert.strictEqual(buildPrompt("apple", "Русский", custom), "Define apple using Russian.");
});

ok("DEFAULT_PROMPT is the key|value extraction prompt", () => {
  assert.ok(DEFAULT_PROMPT.includes("{term}"));
  assert.ok(DEFAULT_PROMPT.includes("{language}"));
  assert.ok(DEFAULT_PROMPT.includes("key|value"));
  assert.ok(DEFAULT_PROMPT.includes("def1|"));
  assert.ok(DEFAULT_PROMPT.includes("note|"));
  assert.ok(!DEFAULT_PROMPT.includes("### "), "default prompt must not contain markdown formatting");
});

// ---------- parseAiCard ----------
ok("parseAiCard parses key|value lines and strips code fences", () => {
  const data = parseAiCard("```\npos|n. [C]\nbr|/sɪmp/\ndef1|舔狗\ndef1en|a simp\n```");
  assert.strictEqual(data.pos, "n. [C]");
  assert.strictEqual(data.br, "/sɪmp/");
  assert.strictEqual(data.def1, "舔狗");
  assert.strictEqual(data.def1en, "a simp");
});

ok("parseAiCard ignores non key|value lines and empties", () => {
  const data = parseAiCard("hello\n|bad\npos|n.\n\nnote|x");
  assert.strictEqual(data.pos, "n.");
  assert.strictEqual(data.note, "x");
  assert.strictEqual(data.hello, undefined);
});

ok("parseAiCard strips markdown emphasis leftovers", () => {
  const data = parseAiCard("def1|**舔狗**\ndef1en|`a simp`");
  assert.strictEqual(data.def1, "舔狗");
  assert.strictEqual(data.def1en, "a simp");
});

ok("parseAiCard returns empty object for garbage", () => {
  assert.deepStrictEqual(parseAiCard(""), {});
  assert.deepStrictEqual(parseAiCard("just some text without pipes"), {});
});

// ---------- renderCard ----------
ok("renderCard uses per-language labels (zh: 英/美/搭配/提示)", () => {
  const card = renderCard("simp", "简体中文", { pos: "n. [C]", br: "/sɪmp/", am: "/sɪmp/", def1: "舔狗", def1en: "a simp", coll1: "simp for", coll1meaning: "当舔狗", note: "网络俚语" });
  assert.ok(card.includes("### simp"));
  assert.ok(card.includes("英 /sɪmp/ · 美 /sɪmp/"));
  assert.ok(card.includes("🔗 **搭配**"));
  assert.ok(card.includes("📝 **提示**"));
  assert.ok(card.includes("- **舔狗** — a simp"));
});

ok("renderCard uses Japanese labels (英/米/コロケーション/ヒント)", () => {
  const card = renderCard("simp", "日本語", { pos: "n. [C]", br: "sɪmp", am: "sɪmp", def1: "お世辞を言う人", def1en: "a simp", coll1: "simp for", coll1meaning: "取り入る", note: "ネットスラング" });
  assert.ok(card.includes("英 /sɪmp/ · 米 /sɪmp/"));
  assert.ok(card.includes("🔗 **コロケーション**"));
  assert.ok(card.includes("📝 **ヒント**"));
});

ok("renderCard handles missing fields and extra IPA slashes", () => {
  const card = renderCard("apple", "Русский", { pos: "n. [C]", br: "/ˈæpəl/", am: "/ˈæpəl/", def1: "яблоко" });
  assert.ok(card.includes("BrE /ˈæpəl/ · AmE /ˈæpəl/"));
  assert.ok(card.includes("- **яблоко**"));
  assert.ok(!card.includes("?"));
  assert.ok(!card.includes("🔗"), "no collocations section when missing");
});

console.log(`\n${passed} assertions passed`);
