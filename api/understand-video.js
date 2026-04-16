"use strict";

const {
  arkFetch,
  buildAuthHeader,
  buildUnderstandBody,
  extractAssistantText,
  getArkApiKey,
  getMediaKitApiKey,
  getRequestJson,
  normalizeBaseUrl,
} = require("./_lib/understand");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const input = getRequestJson(req);
    const arkKey = getArkApiKey(input.arkApiKey);
    const mediaKitKey = getMediaKitApiKey(input.mediaKitApiKey);

    if (!arkKey) {
      return res.status(400).json({ error: "缺少火山方舟 API Key。请在网页设置里填写 Seedance / ARK API Key，或在服务端配置 ARK_API_KEY。" });
    }
    if (!mediaKitKey) {
      return res.status(400).json({ error: "缺少 AI MediaKit API Key。请在网页设置里填写 AI MediaKit API Key，或在服务端配置 AMK_API_KEY。" });
    }

    const baseUrl = normalizeBaseUrl(input?.baseUrl);
    const { body, meta } = buildUnderstandBody(input);

    if (!body.model) {
      return res.status(400).json({ error: "缺少火山方舟模型 ID（model）。" });
    }
    if (!meta.videoUrl) {
      return res.status(400).json({ error: "缺少视频 URL（video_url）。" });
    }

    // Force non-streaming for simplicity; frontend shows the final answer.
    body.stream = false;

    const payload = await arkFetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: buildAuthHeader(arkKey, mediaKitKey),
      },
      body: JSON.stringify(body),
    });

    const answer = extractAssistantText(payload);
    return res.status(200).json({
      ok: true,
      answer,
      usage: payload?.usage || null,
      model: payload?.model || body.model,
      raw: payload,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "视频理解请求失败。",
      raw: error.payload || null,
    });
  }
};
