export interface ResearchResult {
  topic: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  source?: string;
}


const STOP_WORDS = new Set([
  "the","and","for","with","that","this","from","have","has","are","was","were","will",
  "into","about","their","there","they","them","then","than","been","being","which",
  "your","you","our","its","it's","not","but","can","could","should","would","when",
  "what","who","how","why","also","more","most","some","such","only","other","over",
  "after","before","between","because","while","these","those","upon","each","much",
]);

function keywords(text: string, count: number): string[] {
  const tally = new Map<string, number>();
  for (const raw of text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []) {
    if (STOP_WORDS.has(raw)) continue;
    tally.set(raw, (tally.get(raw) ?? 0) + 1);
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, count)
    .map(([word]) => word);
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Deterministic pseudo-random in [0,1) derived from the input text. */
function seeded(text: string, salt: number) {
  let hash = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

/**
 * Simulated research output. Fully local, but derived from the actual input
 * so different topics and articles produce visibly different results.
 */
export function generateResearch(input: string): ResearchResult {
  const clean = input.trim().replace(/\s+/g, " ");
  const words = clean.split(" ").filter(Boolean);
  const wordCount = words.length;
  const isArticle = wordCount > 45;
  const keys = keywords(clean, 6);
  const primary = keys[0] ?? words[0]?.toLowerCase() ?? "the subject";
  const secondary = keys[1] ?? "execution";
  const tertiary = keys[2] ?? "adoption";
  const topic = titleCase(
    isArticle ? `${primary} — ${secondary}` : clean.slice(0, 70) || "Untitled topic",
  );

  const readingMinutes = Math.max(1, Math.round(wordCount / 220));
  const confidence = 72 + Math.round(seeded(clean, 7) * 23);
  const angle = ["operational", "strategic", "commercial", "organisational"][
    Math.floor(seeded(clean, 11) * 4)
  ];
  const horizon = ["the next quarter", "a two-quarter horizon", "the next 12 months"][
    Math.floor(seeded(clean, 23) * 3)
  ];

  const summary = isArticle
    ? `The material you supplied runs to roughly ${wordCount} words (about a ${readingMinutes}-minute read) and centres on ${primary}, with ${secondary} and ${tertiary} recurring as the load-bearing themes. Read as a whole, it argues that progress on ${primary} is limited less by intent than by the connective tissue between teams — the handoffs, the shared definitions, and the cadence at which decisions actually get made.

The strongest sections deal with ${secondary}. There the argument is concrete: measurable outcomes, named owners, and a sequence that can be started without waiting for a wider reorganisation. Weaker passages assume that ${tertiary} follows automatically once the tooling is in place, which historically it does not; adoption tends to lag capability by one to two cycles.

Taken from an ${angle} angle, the practical conclusion is that ${primary} should be treated as a programme rather than a project over ${horizon}. Sequencing matters more than scope: a narrow first slice that proves the handoff is worth more than a broad rollout that nobody trusts yet.`
    : `"${clean}" is best understood as an ${angle} question rather than a purely technical one. The available thinking converges on a familiar shape — clear value at the edges, ambiguity in the middle, where ownership and measurement live. ${titleCase(secondary)} is where most of the disagreement sits.

Across comparable cases, teams that made progress did three things early: they defined what "done" looked like in one sentence, they named a single accountable owner, and they instrumented one metric before building anything. Teams that stalled tended to broaden scope in the first month, usually in response to stakeholder requests that were reasonable individually and fatal collectively.

Over ${horizon}, the realistic expectation is incremental rather than step-change improvement, with ${tertiary} as the leading indicator that the approach is taking hold. Confidence in this read is moderate-to-high (${confidence}%) given the limited input provided.`;

  const insightPool = [
    `${titleCase(primary)} is the dominant thread — it recurs throughout the input and should anchor any framing you build from here.`,
    `${titleCase(secondary)} is where the real constraint sits; capability is ahead of the process wrapped around it.`,
    `Adoption of ${tertiary} lags capability by roughly one to two cycles, so plan enablement before rollout, not after.`,
    `The ${angle} case is stronger than the technical one — lead with outcomes, not architecture, when you present this.`,
    `Scope discipline is the highest-leverage variable: narrow first slices outperform broad rollouts in every comparable case.`,
    `Signal quality is uneven (${wordCount} words analysed); treat the conclusions as directional until a second source corroborates them.`,
  ];
  const insightCount = 3 + Math.floor(seeded(clean, 31) * 3); // 3–5
  const insights = insightPool.slice(0, insightCount);

  const recommendationPool = [
    `Define a one-sentence success statement for ${primary} and circulate it before any further work begins.`,
    `Instrument a single leading metric for ${secondary} this cycle — even a crude one beats retrospective reporting.`,
    `Run a narrow pilot on ${tertiary} with one team over ${horizon}, then decide on expansion with evidence in hand.`,
    `Name one accountable owner and one decision forum; ambiguity here is the most common failure mode in this space.`,
  ];
  const recCount = 2 + Math.floor(seeded(clean, 47) * 2); // 2–3
  const recommendations = recommendationPool.slice(0, recCount);

  return { topic, summary, insights, recommendations };
}
