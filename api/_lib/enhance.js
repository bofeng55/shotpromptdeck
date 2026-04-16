"use strict";

const DEFAULT_ENHANCE_BASE_URL = "https://amk.cn-beijing.volces.com/api/v1";

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
  const value = String(baseUrl || DEFAULT_ENHANCE_BASE_URL).trim() || DEFAULT_ENHANCE_BASE_URL;
  return value.replace(/\/+$/, "");
}

function getApiKey(inputApiKey) {
  return String(inputApiKey || process.env.AMK_API_KEY || "").trim();
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (!value) return "queued";
  if (["pending", "queued", "submitted", "waiting"].includes(value)) return "queued";
  if (["processing", "running", "in_progress"].includes(value)) return "running";
  if (["completed", "done", "success", "succeeded"].includes(value)) return "succeeded";
  if (["failed", "error"].includes(value)) return "failed";
  if (value === "expired") return "expired";
  return value;
}

function pickFirstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string" && item.trim());
      if (first) return first.trim();
    }
  }
  return "";
}

function extractTaskResult(payload) {
  const result = payload?.result || payload?.data?.result || {};
  return {
    status: normalizeStatus(payload?.status || payload?.state || payload?.data?.status),
    videoUrl: pickFirstString(result?.video_url, payload?.video_url),
    resolution: pickFirstString(result?.resolution),
    toolVersion: pickFirstString(result?.tool_version),
    duration: Number.isFinite(Number(result?.duration)) ? Number(result.duration) : null,
    fps: Number.isFinite(Number(result?.fps)) ? Number(result.fps) : null,
    expiresAt: Number.isFinite(Number(payload?.expires_at)) ? Number(payload.expires_at) : null,
    createdAt: Number.isFinite(Number(payload?.created_at)) ? Number(payload.created_at) : null,
    finishedAt: Number.isFinite(Number(payload?.finished_at)) ? Number(payload.finished_at) : null,
    error: pickFirstString(
      payload?.error?.message,
      payload?.message,
      payload?.error_message,
    ),
  };
}

function buildEnhanceBody(input) {
  const body = {
    video_url: String(input?.video_url || "").trim(),
    scene: String(input?.scene || "").trim() || undefined,
    tool_version: String(input?.tool_version || "").trim() || undefined,
    resolution: String(input?.resolution || "").trim() || undefined,
    resolution_limit: Number.isFinite(Number(input?.resolution_limit))
      ? Number(input.resolution_limit)
      : undefined,
    fps: Number.isFinite(Number(input?.fps)) ? Number(input.fps) : undefined,
  };

  if (body.resolution && body.resolution_limit !== undefined) {
    delete body.resolution_limit;
  }

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined || body[key] === "") {
      delete body[key];
    }
  });

  return body;
}

async function mediaKitFetch(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = pickFirstString(payload?.error?.message, payload?.message)
      || `MediaKit request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function getTaskId(payload) {
  return String(
    payload?.task_id
      || payload?.data?.task_id
      || payload?.id
      || payload?.data?.id
      || "",
  ).trim();
}

module.exports = {
  DEFAULT_ENHANCE_BASE_URL,
  buildEnhanceBody,
  extractTaskResult,
  getApiKey,
  getRequestJson,
  getTaskId,
  mediaKitFetch,
  normalizeBaseUrl,
  normalizeStatus,
};
