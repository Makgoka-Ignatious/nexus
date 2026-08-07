/** Server-only helpers for pulling readable text out of a web page. */

const MAX_CHARS = 30000;

export async function fetchPageText(rawUrl: string): Promise<{
  url: string;
  title: string;
  text: string;
}> {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("Only http and https links are supported.");

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NexusResearch/1.0)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
      },
      redirect: "follow",
    });
  } catch {
    throw new Error("Could not reach that URL.");
  }

  if (!response.ok)
    throw new Error(`The page returned ${response.status}. Try another link.`);

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/pdf"))
    throw new Error("That link is a PDF — download it and upload the file instead.");

  const html = await response.text();
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() ?? "";
  const text = htmlToText(html);

  if (text.length < 120)
    throw new Error("Couldn't extract readable content from that page.");

  return { url: url.toString(), title: decodeEntities(title), text };
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
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    );
}
