"use strict";

const {
  extractTaskResult,
  getApiKey,
  normalizeBaseUrl,
  volcFetch,
} = require("../_lib/video");

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

    const apiKey = getApiKey(req.headers["x-video-api-key"] || req.query?.apiKey);
    if (!apiKey) {
      return res.status(400).json({ error: "缺少 Seedance API Key。请在网页设置里填写，或在服务端环境变量中配置 ARK_API_KEY。" });
    }

    const baseUrl = normalizeBaseUrl(req.query?.baseUrl);
    const payload = await volcFetch(`${baseUrl}/contents/generations/tasks/${encodeURIComponent(taskId)}`, {
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
      message: result.status === "succeeded" ? "视频已生成完成。" : "视频任务状态已刷新。",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "获取视频任务状态失败。",
      raw: error.payload || null,
    });
  }
};
