"use strict";

const {
  buildEnhanceBody,
  getApiKey,
  getRequestJson,
  getTaskId,
  mediaKitFetch,
  normalizeBaseUrl,
  normalizeStatus,
} = require("./_lib/enhance");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const input = getRequestJson(req);
    const apiKey = getApiKey(input.apiKey);
    if (!apiKey) {
      return res.status(400).json({ error: "缺少 AI MediaKit API Key。请在网页设置里填写，或在服务端环境变量中配置 AMK_API_KEY。" });
    }

    const baseUrl = normalizeBaseUrl(input?.baseUrl);
    const body = buildEnhanceBody(input);

    if (!body.video_url) {
      return res.status(400).json({ error: "缺少视频 URL（video_url）。" });
    }

    const payload = await mediaKitFetch(`${baseUrl}/tools/enhance-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const taskId = getTaskId(payload);
    if (!taskId) {
      return res.status(502).json({ error: "画质增强任务已提交，但响应里没有返回任务 ID。", raw: payload });
    }

    return res.status(200).json({
      ok: true,
      taskId,
      status: normalizeStatus(payload?.status || "queued"),
      origin: "ai-mediakit",
      requestSummary: [
        body.scene ? `场景 ${body.scene}` : "",
        body.tool_version ? `版本 ${body.tool_version}` : "",
        body.resolution ? `分辨率 ${body.resolution}` : "",
        body.resolution_limit ? `短边 ${body.resolution_limit}` : "",
        body.fps ? `帧率 ${body.fps}fps` : "",
      ].filter(Boolean).join(" · "),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "提交画质增强任务失败。",
      raw: error.payload || null,
    });
  }
};
