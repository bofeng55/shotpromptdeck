"use strict";

const DEFAULT_UNDERSTAND_BASE_URL = "https://amk-ark.cn-beijing.volces.com/api/v1";

function getRequestJson(req) {
  if (!req || req.body === undefined || req.body === null) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return {};
}

function normalizeBaseUrl(baseUrl) {
  const value = String(baseUrl || DEFAULT_UNDERSTAND_BASE_URL).trim() || DEFAULT_UNDERSTAND_BASE_URL;
  return value.replace(/\/+$/, "");
}

function getArkApiKey(inputKey) {
  return String(inputKey || process.env.ARK_API_KEY || "").trim();
}

function getMediaKitApiKey(inputKey) {
  return String(inputKey || process.env.AMK_API_KEY || "").trim();
}

function buildAuthHeader(arkKey, mediaKitKey) {
  const ark = String(arkKey || "").trim();
  const amk = String(mediaKitKey || "").trim();
  if (!ark && !amk) return "";
  return `Bearer ${ark}/${amk}`;
}

function pickFirstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function toFiniteNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function buildUnderstandBody(input) {
  const model = String(input?.model || "").trim();
  const prompt = String(input?.prompt || "").trim();
  const videoUrl = String(input?.videoUrl || input?.video_url || "").trim();
  const fps = toFiniteNumber(input?.fps);
  const maxFrames = toFiniteNumber(input?.max_frames ?? input?.maxFrames);
  const maxPixels = toFiniteNumber(input?.max_pixels ?? input?.maxPixels);
  const stream = Boolean(input?.stream);

  const videoUrlObject = { url: videoUrl };
  if (fps !== undefined) videoUrlObject.fps = fps;
  if (maxFrames !== undefined) videoUrlObject.max_frames = maxFrames;
  if (maxPixels !== undefined) videoUrlObject.max_pixels = maxPixels;

  const content = [];
  if (prompt) content.push({ type: "text", text: prompt });
  content.push({ type: "video_url", video_url: videoUrlObject });

  return {
    body: {
      model,
      messages: [
        {
          role: "user",
          content,
        },
      ],
      stream,
    },
    meta: { model, prompt, videoUrl, fps, maxFrames, maxPixels, stream },
  };
}

function extractAssistantText(payload) {
  const choice = payload?.choices?.[0];
  if (!choice) return "";
  const message = choice?.message || {};
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

async function arkFetch(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = pickFirstString(payload?.error?.message, payload?.message)
      || `Ark request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

module.exports = {
  DEFAULT_UNDERSTAND_BASE_URL,
  arkFetch,
  buildAuthHeader,
  buildUnderstandBody,
  extractAssistantText,
  getArkApiKey,
  getMediaKitApiKey,
  getRequestJson,
  normalizeBaseUrl,
};
