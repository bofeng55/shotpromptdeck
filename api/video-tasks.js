"use strict";

const {
  buildCreateBody,
  getApiKey,
  getRequestJson,
  getTaskId,
  normalizeBaseUrl,
  normalizeStatus,
  volcFetch,
} = require("./_lib/video");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const input = getRequestJson(req);
    const apiKey = getApiKey(input.apiKey);
    if (!apiKey) {
      return res.status(400).json({ error: "缺少 Seedance API Key。请在网页设置里填写，或在服务端环境变量中配置 ARK_API_KEY。" });
    }

    const provider = input?.provider || {};
    const baseUrl = normalizeBaseUrl(provider.baseUrl);
    const requestBody = buildCreateBody({
      ...input,
      model: provider.model || input.model,
    });

    if (!requestBody.model) {
      return res.status(400).json({ error: "缺少视频模型 ID。" });
    }

    if (!Array.isArray(requestBody.content) || !requestBody.content.length) {
      return res.status(400).json({ error: "缺少视频生成内容。" });
    }

    const payload = await volcFetch(`${baseUrl}/contents/generations/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const taskId = getTaskId(payload);
    if (!taskId) {
      return res.status(502).json({ error: "视频任务已提交，但响应里没有返回任务 ID。", raw: payload });
    }

    return res.status(200).json({
      ok: true,
      taskId,
      status: normalizeStatus(payload?.status || "queued"),
      origin: "volcengine-ark",
      requestSummary: [
        requestBody.ratio ? `比例 ${requestBody.ratio}` : "",
        requestBody.duration ? `时长 ${requestBody.duration}s` : "",
        requestBody.resolution ? `分辨率 ${requestBody.resolution}` : "",
        requestBody.generate_audio === false ? "无声" : "有声",
        requestBody.camera_fixed ? "固定镜头" : "",
      ].filter(Boolean).join(" · "),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "提交视频任务失败。",
      raw: error.payload || null,
    });
  }
};
