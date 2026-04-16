"use strict";

const {
  extractTaskResult,
  getApiKey,
  mediaKitFetch,
  normalizeBaseUrl,
} = require("../_lib/enhance");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const taskId = String(req.query?.taskId || "").trim();
    if (!taskId) {
      return res.status(400).json({ error: "缺少任务 ID。" });
    }

    const apiKey = getApiKey(req.headers["x-mediakit-api-key"] || req.query?.apiKey);
    if (!apiKey) {
      return res.status(400).json({ error: "缺少 AI MediaKit API Key。请在网页设置里填写，或在服务端环境变量中配置 AMK_API_KEY。" });
    }

    const baseUrl = normalizeBaseUrl(req.query?.baseUrl);
    const payload = await mediaKitFetch(`${baseUrl}/tasks/${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const result = extractTaskResult(payload);

    return res.status(200).json({
      ok: true,
      taskId,
      ...result,
      message: result.status === "succeeded" ? "画质增强已完成。" : "画质增强任务状态已刷新。",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "获取画质增强任务状态失败。",
      raw: error.payload || null,
    });
  }
};
