/** Server-only helpers for pulling readable text out of a web page or YouTube video. */

const MAX_CHARS = 30000;
const TIMEOUT_MS = 20000;

export interface SourceText {
  url: string;
  title: string;
  text: string;
  kind: "page" | "youtube";
}

function normaliseUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("Only http and https links are supported.");
  return url;
}

async function get(url: string, accept: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: accept,
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchSourceText(rawUrl: string): Promise<SourceText> {
  const url = normaliseUrl(rawUrl);
  const videoId = youtubeId(url);
  if (videoId) return fetchYouTube(url, videoId);
  return fetchPageText(url);
}

/* --------------------------------- YouTube -------------------------------- */

function youtubeId(url: URL) {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
  if (!host.endsWith("youtube.com") && host !== "youtube-nocookie.com") return null;
  const v = url.searchParams.get("v");
  if (v) return v;
  const match = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname);
  return match?.[1] ?? null;
}

async function fetchYouTube(url: URL, videoId: string): Promise<SourceText> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = "";
  let author = "";
  let description = "";
  let transcript = "";

  try {
    const oembed = await get(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
      "application/json",
    );
    if (oembed.ok) {
      const data = (await oembed.json()) as { title?: string; author_name?: string };
      title = data.title ?? "";
      author = data.author_name ?? "";
    }
  } catch {
    /* metadata is best-effort */
  }

  try {
    const page = await get(watchUrl, "text/html");
    if (page.ok) {
      const html = await page.text();
      if (!title) title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "");
      description = decodeEntities(
        /"shortDescription":"((?:[^"\\]|\\.)*)"/.exec(html)?.[1] ?? "",
      ).replace(/\\n/g, "\n");
      transcript = await fetchTranscript(html);
    }
  } catch {
    /* fall through to whatever we have */
  }

  const body = [
    title && `Title: ${title}`,
    author && `Channel: ${author}`,
    description && `Description:\n${description}`,
    transcript && `Transcript:\n${transcript}`,
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_CHARS);

  if (body.length < 40)
    throw new Error(
      "Couldn't read that YouTube video. It may be private, age-restricted or unavailable.",
    );

  return { url: watchUrl, title, text: body, kind: "youtube" };
}

async function fetchTranscript(html: string) {
  const tracksRaw = /"captionTracks":(\[.*?\])/s.exec(html)?.[1];
  if (!tracksRaw) return "";
  let tracks: { baseUrl?: string; languageCode?: string; kind?: string }[];
  try {
    tracks = JSON.parse(tracksRaw.replace(/\\u0026/g, "&").replace(/\\\//g, "/")) as typeof tracks;
  } catch {
    return "";
  }
  const track =
    tracks.find((t) => t.languageCode?.startsWith("en") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode?.startsWith("en")) ??
    tracks[0];
  if (!track?.baseUrl) return "";

  try {
    const response = await get(track.baseUrl, "text/xml");
    if (!response.ok) return "";
    const xml = await response.text();
    const lines = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((m) =>
      decodeEntities(decodeEntities(m[1] ?? "")).replace(/\s+/g, " ").trim(),
    );
    return lines.filter(Boolean).join(" ").slice(0, MAX_CHARS);
  } catch {
    return "";
  }
}

/* --------------------------------- Pages ---------------------------------- */

async function fetchPageText(url: URL): Promise<SourceText> {
  let response: Response;
  try {
    response = await get(url.toString(), "text/html,application/xhtml+xml,text/plain;q=0.9");
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError")
      throw new Error("That page took too long to respond. Try another link.");
    throw new Error("Could not reach that URL. Check the address and try again.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/pdf"))
    throw new Error("That link is a PDF — download it and upload the file instead.");

  if (!response.ok) {
    const readable = await readViaReader(url.toString());
    if (readable) return { url: url.toString(), title: "", text: readable, kind: "page" };
    if (response.status === 403 || response.status === 401)
      throw new Error("That site blocks automated readers. Paste the text instead.");
    throw new Error(`The page returned ${response.status}. Try another link.`);
  }

  const html = await response.text();
  const title = decodeEntities(
    /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() ?? "",
  );
  let text = htmlToText(html);

  if (text.length < 120) {
    const readable = await readViaReader(url.toString());
    if (readable) text = readable;
  }

  if (text.length < 120)
    throw new Error(
      "Couldn't extract readable content from that page — it may be JavaScript-only. Paste the text instead.",
    );

  return { url: url.toString(), title, text, kind: "page" };
}

/** Fallback for JS-heavy or bot-blocking pages. */
async function readViaReader(target: string) {
  try {
    const response = await get(`https://r.jina.ai/${target}`, "text/plain");
    if (!response.ok) return "";
    const text = (await response.text()).trim().slice(0, MAX_CHARS);
    return text.length >= 120 ? text : "";
  } catch {
    return "";
  }
}

function htmlToText(html: string) {
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html;
  const stripped = body
    .replace(/<(script|style|noscript|svg|iframe|nav|footer|header|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(stripped)
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s*\n\s*/g, "\n\n")
    .trim()
    .slice(0, MAX_CHARS);
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    );
}
