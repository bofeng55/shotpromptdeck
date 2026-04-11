"use strict";

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
    } catch (error) {
      return {};
    }
  }

  return {};
}

function normalizeBaseUrl(baseUrl) {
  const fallback = "https://ark.cn-beijing.volces.com/api/v3";
  const value = String(baseUrl || fallback).trim() || fallback;
  return value.replace(/\/+$/, "");
}

function getApiKey(inputApiKey) {
  return String(inputApiKey || process.env.ARK_API_KEY || "").trim();
}

function getTaskId(payload) {
  return String(
    payload?.id
      || payload?.task_id
      || payload?.data?.id
      || payload?.data?.task_id
      || "",
  ).trim();
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (!value) {
    return "queued";
  }

  if (["pending", "queued", "submitted"].includes(value)) {
    return "queued";
  }

  if (["processing", "running", "in_progress"].includes(value)) {
    return "running";
  }

  if (["completed", "done", "success", "succeeded"].includes(value)) {
    return "succeeded";
  }

  if (["failed", "error"].includes(value)) {
    return "failed";
  }

  if (value === "expired") {
    return "expired";
  }

  return value;
}

function pickFirstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string" && item.trim());
      if (first) {
        return first.trim();
      }
    }
  }

  return "";
}

function extractTaskResult(payload) {
  const content = payload?.content || payload?.data?.content || payload?.output || payload?.result || {};

  return {
    status: normalizeStatus(payload?.status || payload?.state || payload?.data?.status),
    videoUrl: pickFirstString(
      content?.video_url,
      content?.video_urls,
      payload?.video_url,
      payload?.video_urls,
      payload?.output?.video_url,
      payload?.output?.video_urls,
      payload?.result?.video_url,
      payload?.result?.video_urls,
    ),
    coverImageUrl: pickFirstString(
      content?.cover_image_url,
      content?.cover_url,
      content?.poster_url,
      payload?.cover_image_url,
      payload?.poster_url,
    ),
    lastFrameUrl: pickFirstString(
      content?.last_frame_url,
      payload?.last_frame_url,
      payload?.result?.last_frame_url,
    ),
    error: pickFirstString(
      payload?.error?.message,
      payload?.message,
      payload?.error_message,
    ),
  };
}

function buildCreateBody(input) {
  const content = Array.isArray(input?.content) ? input.content : [];
  const body = {
    model: String(input?.model || "").trim(),
    content,
    ratio: String(input?.ratio || "").trim() || undefined,
    duration: Number.isFinite(Number(input?.duration)) ? Number(input.duration) : undefined,
    resolution: String(input?.resolution || "").trim() || undefined,
    seed: Number.isFinite(Number(input?.seed)) ? Number(input.seed) : undefined,
    watermark: Boolean(input?.watermark),
    return_last_frame: Boolean(input?.return_last_frame),
  };

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined || body[key] === "") {
      delete body[key];
    }
  });

  return body;
}

async function volcFetch(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = pickFirstString(payload?.error?.message, payload?.message) || `Volcengine request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

module.exports = {
  buildCreateBody,
  extractTaskResult,
  getApiKey,
  getRequestJson,
  getTaskId,
  normalizeBaseUrl,
  normalizeStatus,
  volcFetch,
};
