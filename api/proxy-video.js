"use strict";

const ALLOWED_HOST_SUFFIXES = [
  ".volces.com",
  ".volcengine.com",
  ".volccdn.com",
  ".byteimg.com",
  ".bytedance.com",
  ".byteamcs.com",
  ".bytednsdoc.com",
];

function isAllowedHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host === suffix.slice(1) || host.endsWith(suffix));
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawUrl = String((req.query && req.query.url) || "").trim();
  if (!rawUrl) {
    return res.status(400).json({ error: "缺少 url 参数。" });
  }

  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: "url 参数不是合法的 URL。" });
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return res.status(400).json({ error: "仅支持 http/https 协议。" });
  }

  if (!isAllowedHost(target.hostname)) {
    return res.status(403).json({ error: `不允许代理的主机：${target.hostname}` });
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: req.method === "HEAD" ? "HEAD" : "GET",
      redirect: "follow",
    });

    if (!upstream.ok && upstream.status !== 206) {
      const text = await upstream.text().catch(() => "");
      return res.status(upstream.status).json({
        error: `上游返回错误（${upstream.status}）。`,
        detail: text.slice(0, 500),
      });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");
    res.setHeader("Content-Type", contentType);
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "private, max-age=300");
    res.status(upstream.status);

    if (req.method === "HEAD" || !upstream.body) {
      return res.end();
    }

    const arrayBuffer = await upstream.arrayBuffer();
    return res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    return res.status(502).json({ error: `代理视频失败：${error.message || error}` });
  }
};
