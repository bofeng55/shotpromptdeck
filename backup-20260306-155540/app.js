const DB_NAME = "shot-prompt-workspace-db";
const STORE_NAME = "workspace";
const RECORD_KEY = "workspace-state";

const defaultState = {
  settings: {
    apiKey: "",
    model: "gpt-4.1-mini",
    globalDirection: "",
  },
  shots: [],
};

const elements = {
  apiKey: document.querySelector("#apiKey"),
  model: document.querySelector("#model"),
  globalDirection: document.querySelector("#globalDirection"),
  imageUpload: document.querySelector("#imageUpload"),
  addShotButton: document.querySelector("#addShotButton"),
  clearButton: document.querySelector("#clearButton"),
  shotsContainer: document.querySelector("#shotsContainer"),
  shotTemplate: document.querySelector("#shotTemplate"),
  shotCount: document.querySelector("#shotCount"),
  historyCount: document.querySelector("#historyCount"),
  chatCount: document.querySelector("#chatCount"),
  statusText: document.querySelector("#statusText"),
  lightbox: document.querySelector("#lightbox"),
  lightboxImage: document.querySelector("#lightboxImage"),
  lightboxClose: document.querySelector("#lightboxClose"),
  lightboxBackdrop: document.querySelector(".lightbox-backdrop"),
};

let state = structuredClone(defaultState);
let dbPromise;

bootstrap();

async function bootstrap() {
  state = await loadState();
  syncSettingsInputs();
  bindGlobalEvents();

  if (!state.shots.length) {
    state.shots.push(createShot());
    await persistState("已创建初始镜头。");
  }

  render();
}

function bindGlobalEvents() {
  elements.apiKey.addEventListener("input", async (event) => {
    state.settings.apiKey = event.target.value.trim();
    await persistState("API Key 已本地保存。");
  });

  elements.model.addEventListener("input", async (event) => {
    state.settings.model = event.target.value.trim() || defaultState.settings.model;
    await persistState("模型设置已更新。");
  });

  elements.globalDirection.addEventListener("input", async (event) => {
    state.settings.globalDirection = event.target.value;
    await persistState("全局风格备注已更新。");
  });

  elements.imageUpload.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    setStatus(`正在导入 ${files.length} 张镜头图...`);
    const importedShots = [];
    for (const file of files) {
      importedShots.push(await createShotFromFile(file));
    }

    const hadOnlyBlankShot = state.shots.length === 1 && isShotEmpty(state.shots[0]);
    if (hadOnlyBlankShot) {
      state.shots = importedShots;
    } else {
      state.shots.push(...importedShots);
    }

    await persistState(`已导入 ${files.length} 个镜头。`);
    event.target.value = "";
    render();
  });

  elements.addShotButton.addEventListener("click", async () => {
    state.shots.push(createShot());
    await persistState("已新增空镜头。");
    render();
  });

  elements.clearButton.addEventListener("click", async () => {
    const confirmed = window.confirm("确认清空全部镜头、Prompt 历史和对话记录吗？");
    if (!confirmed) {
      return;
    }

    closeLightbox();
    state = structuredClone(defaultState);
    state.shots.push(createShot());
    syncSettingsInputs();
    await persistState("已清空全部记录。");
    render();
  });

  elements.lightboxClose.addEventListener("click", closeLightbox);
  elements.lightboxBackdrop.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.lightbox.hidden) {
      closeLightbox();
    }
  });
}

function render() {
  syncSettingsInputs();
  elements.shotsContainer.innerHTML = "";

  state.shots.forEach((shot, index) => {
    const fragment = elements.shotTemplate.content.cloneNode(true);
    const imageFrame = fragment.querySelector(".image-frame");
    const image = fragment.querySelector(".shot-image");
    const imageEmpty = fragment.querySelector(".image-empty");
    const order = fragment.querySelector(".shot-order");
    const titleInput = fragment.querySelector(".shot-title");
    const imageInput = fragment.querySelector(".shot-image-input");
    const promptInput = fragment.querySelector(".shot-prompt");
    const feedbackInput = fragment.querySelector(".feedback-input");
    const historyList = fragment.querySelector(".history-list");
    const chatLog = fragment.querySelector(".chat-log");
    const currentVersionLabel = fragment.querySelector(".current-version-label");
    const historyCount = fragment.querySelector(".history-count");

    order.textContent = `Shot ${String(index + 1).padStart(2, "0")}`;
    titleInput.value = shot.title;
    promptInput.value = shot.currentPrompt;
    imageEmpty.innerHTML = '<span class="drag-tip">拖拽图片到这里，或点击上传</span>';

    if (shot.imageDataUrl) {
      imageFrame.classList.add("has-image");
      image.src = shot.imageDataUrl;
      image.alt = shot.title ? `${shot.title} 放大预览` : "镜头图放大预览";
    }

    bindImageDropZone(imageFrame, imageInput, shot);

    currentVersionLabel.textContent = shot.updatedAt ? `最近更新：${formatTime(shot.updatedAt)}` : "尚未保存";
    historyCount.textContent = `${shot.promptHistory.length} 条历史`;

    titleInput.addEventListener("input", async (event) => {
      shot.title = event.target.value;
      shot.updatedAt = new Date().toISOString();
      await persistState("镜头标题已更新。");
    });

    imageInput.addEventListener("change", async (event) => {
      const [file] = Array.from(event.target.files || []);
      if (!file) {
        return;
      }

      await updateShotImage(shot, file, "镜头图片已更新。");
      imageInput.value = "";
      render();
    });

    promptInput.addEventListener("input", async (event) => {
      shot.currentPrompt = event.target.value;
      shot.updatedAt = new Date().toISOString();
      await persistState("当前 Prompt 已更新。");
    });

    fragment.querySelector(".generate-button").addEventListener("click", async (event) => {
      await handleGeneratePrompt(shot.id, event.currentTarget);
    });

    fragment.querySelector(".archive-button").addEventListener("click", async () => {
      const saved = archiveCurrentPrompt(shot);
      if (saved) {
        await persistState("当前 Prompt 已加入历史。");
        render();
      }
    });

    fragment.querySelector(".save-button").addEventListener("click", async () => {
      const saved = archiveCurrentPrompt(shot);
      if (saved) {
        await persistState("当前 Prompt 版本已保存。");
        render();
      }
    });

    fragment.querySelector(".copy-button").addEventListener("click", async () => {
      if (!shot.currentPrompt.trim()) {
        setStatus("当前 Prompt 为空，无法复制。");
        return;
      }

      await navigator.clipboard.writeText(shot.currentPrompt);
      setStatus("当前 Prompt 已复制。");
    });

    fragment.querySelector(".revise-button").addEventListener("click", async (event) => {
      const feedback = feedbackInput.value.trim();
      await handleRevisePrompt(shot.id, feedback, feedbackInput, event.currentTarget);
    });

    fragment.querySelector(".clear-chat-button").addEventListener("click", async () => {
      shot.chatHistory = [];
      shot.updatedAt = new Date().toISOString();
      await persistState("本镜头对话已清空。");
      render();
    });

    fragment.querySelector(".insert-above-button").addEventListener("click", async () => {
      await insertShotAt(index);
    });

    fragment.querySelector(".insert-below-button").addEventListener("click", async () => {
      await insertShotAt(index + 1);
    });

    fragment.querySelector(".delete-button").addEventListener("click", async () => {
      if (state.shots.length === 1) {
        setStatus("至少保留一个镜头。");
        return;
      }

      state.shots = state.shots.filter((item) => item.id !== shot.id);
      await persistState("镜头已删除。");
      render();
    });

    renderHistory(historyList, shot);
    renderChat(chatLog, shot);

    elements.shotsContainer.append(fragment);
  });

  updateSummary();
}

function bindImageDropZone(imageFrame, imageInput, shot) {
  imageFrame.addEventListener("click", () => {
    if (shot.imageDataUrl) {
      openLightbox(shot.imageDataUrl, shot.title);
      return;
    }

    imageInput.click();
  });

  imageFrame.addEventListener("dragover", (event) => {
    event.preventDefault();
    imageFrame.classList.add("drag-over");
  });

  imageFrame.addEventListener("dragenter", (event) => {
    event.preventDefault();
    imageFrame.classList.add("drag-over");
  });

  imageFrame.addEventListener("dragleave", (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    imageFrame.classList.remove("drag-over");
  });

  imageFrame.addEventListener("drop", async (event) => {
    event.preventDefault();
    imageFrame.classList.remove("drag-over");
    const [file] = Array.from(event.dataTransfer?.files || []);
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("请拖入图片文件。");
      return;
    }

    await updateShotImage(shot, file, "拖拽图片上传成功。");
    render();
  });
}

function openLightbox(src, title) {
  elements.lightboxImage.src = src;
  elements.lightboxImage.alt = title ? `${title} 放大图` : "镜头图放大图";
  elements.lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  elements.lightbox.hidden = true;
  elements.lightboxImage.src = "";
  document.body.classList.remove("lightbox-open");
}

function renderHistory(container, shot) {
  container.innerHTML = "";

  if (!shot.promptHistory.length) {
    container.innerHTML = '<div class="empty-state">这个镜头还没有归档 Prompt 版本。</div>';
    return;
  }

  const history = [...shot.promptHistory].reverse();
  history.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(entry.label)} · ${formatTime(entry.createdAt)}</strong>
        <button class="ghost-button" type="button">恢复到当前</button>
      </header>
      <p>${escapeHtml(entry.prompt)}</p>
    `;

    item.querySelector("button").addEventListener("click", async () => {
      shot.currentPrompt = entry.prompt;
      shot.updatedAt = new Date().toISOString();
      await persistState("已从历史恢复 Prompt。");
      render();
    });

    container.append(item);
  });
}

function renderChat(container, shot) {
  container.innerHTML = "";

  if (!shot.chatHistory.length) {
    container.innerHTML = '<div class="empty-state">你可以在这里对当前 Prompt 提修改意见，让 AI 连续迭代。</div>';
    return;
  }

  shot.chatHistory.forEach((message) => {
    const item = document.createElement("div");
    item.className = `chat-item ${message.role}`;
    item.innerHTML = `
      <header>
        <strong>${message.role === "user" ? "你" : "AI"}</strong>
        <span class="meta">${formatTime(message.createdAt)}</span>
      </header>
      <p>${escapeHtml(message.content)}</p>
    `;
    container.append(item);
  });
}

async function handleGeneratePrompt(shotId, button) {
  const shot = getShotById(shotId);
  if (!shot) {
    return;
  }

  if (!state.settings.apiKey) {
    setStatus("请先填写 OpenAI API Key。");
    return;
  }

  if (!shot.imageDataUrl) {
    setStatus("请先为这个镜头上传图片。");
    return;
  }

  const originalLabel = button.textContent;

  try {
    setButtonLoading(button, "生成中...");
    const output = await requestPromptFromOpenAI({
      instruction: buildGenerationInstruction(shot),
      imageDataUrl: shot.imageDataUrl,
    });

    if (shot.currentPrompt.trim()) {
      archiveCurrentPrompt(shot);
    }

    shot.currentPrompt = output;
    shot.updatedAt = new Date().toISOString();
    pushHistoryEntry(shot, output, "AI 生成");
    shot.chatHistory.push(createChatEntry("assistant", `已基于镜头图生成新版 Prompt：\n${output}`));
    await persistState("AI Prompt 已生成并存档。");
    render();
  } catch (error) {
    setStatus(error.message || "生成 Prompt 失败。");
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

async function handleRevisePrompt(shotId, feedback, feedbackInput, button) {
  const shot = getShotById(shotId);
  if (!shot) {
    return;
  }

  if (!state.settings.apiKey) {
    setStatus("请先填写 OpenAI API Key。");
    return;
  }

  if (!feedback) {
    setStatus("请先写下修改要求。");
    return;
  }

  const originalLabel = button.textContent;

  try {
    setButtonLoading(button, "修改中...");
    shot.chatHistory.push(createChatEntry("user", feedback));

    const output = await requestPromptFromOpenAI({
      instruction: buildRevisionInstruction(shot, feedback),
      imageDataUrl: shot.imageDataUrl,
    });

    if (shot.currentPrompt.trim()) {
      archiveCurrentPrompt(shot);
    }

    shot.currentPrompt = output;
    shot.updatedAt = new Date().toISOString();
    pushHistoryEntry(shot, output, "AI 修改");
    shot.chatHistory.push(createChatEntry("assistant", output));
    feedbackInput.value = "";
    await persistState("AI 已根据反馈修改 Prompt。");
    render();
  } catch (error) {
    setStatus(error.message || "修改 Prompt 失败。");
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

function buildGenerationInstruction(shot) {
  const title = shot.title.trim() || "未命名镜头";
  const currentPrompt = shot.currentPrompt.trim();
  const direction = state.settings.globalDirection.trim();

  return [
    "你是专业的视频生成提示词导演。",
    "请基于输入图片，输出一段高质量中文视频生成 Prompt。",
    "要求：",
    "1. 直接输出最终 Prompt，不要解释。",
    "2. Prompt 应包含主体、动作、镜头语言、运镜、光线、氛围、材质质感、景别、构图、时间感，以及必要的负面限制。",
    "3. 风格要适合图生视频模型，文字要具体、可执行、画面感强。",
    `镜头标题：${title}`,
    direction ? `全局风格备注：${direction}` : "",
    currentPrompt ? `用户已有草稿，请在保留有用意图的前提下重写提升：${currentPrompt}` : "用户暂未提供草稿，请直接从图片生成。",
  ].filter(Boolean).join("\n");
}

function buildRevisionInstruction(shot, feedback) {
  const title = shot.title.trim() || "未命名镜头";
  const direction = state.settings.globalDirection.trim();
  const chatContext = shot.chatHistory
    .slice(-6)
    .map((entry) => `${entry.role === "user" ? "用户" : "AI"}：${entry.content}`)
    .join("\n");

  return [
    "你是专业的视频生成提示词导演。",
    "请根据用户对当前 Prompt 的修改意见，输出一版新的最终 Prompt。",
    "要求：",
    "1. 只输出修改后的最终 Prompt，不要解释。",
    "2. 保留当前 Prompt 中仍然合理的部分，并精准落实用户反馈。",
    "3. 如果输入图片存在，可继续结合图片修正画面细节。",
    `镜头标题：${title}`,
    direction ? `全局风格备注：${direction}` : "",
    `当前 Prompt：${shot.currentPrompt || "暂无"}`,
    `用户本次反馈：${feedback}`,
    chatContext ? `最近对话：\n${chatContext}` : "",
  ].filter(Boolean).join("\n");
}

async function requestPromptFromOpenAI({ instruction, imageDataUrl }) {
  const input = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: instruction,
        },
      ],
    },
  ];

  if (imageDataUrl) {
    input[0].content.push({
      type: "input_image",
      image_url: imageDataUrl,
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.settings.apiKey}`,
    },
    body: JSON.stringify({
      model: state.settings.model || defaultState.settings.model,
      input,
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errorPayload = await response.json();
      detail = errorPayload.error?.message || "";
    } catch (error) {
      detail = "";
    }

    throw new Error(detail || `OpenAI 请求失败（${response.status}）`);
  }

  const payload = await response.json();
  const text = payload.output_text?.trim();
  if (!text) {
    throw new Error("模型返回为空，未生成 Prompt。");
  }

  return text;
}

async function insertShotAt(index) {
  state.shots.splice(index, 0, createShot());
  await persistState("已插入新镜头。");
  render();
}

function archiveCurrentPrompt(shot) {
  const prompt = shot.currentPrompt.trim();
  if (!prompt) {
    setStatus("当前 Prompt 为空，未存档。");
    return false;
  }

  const lastEntry = shot.promptHistory[shot.promptHistory.length - 1];
  if (lastEntry?.prompt === prompt) {
    setStatus("当前 Prompt 与最近历史一致，未重复存档。");
    return false;
  }

  pushHistoryEntry(shot, prompt, "手动保存");
  shot.updatedAt = new Date().toISOString();
  return true;
}

function pushHistoryEntry(shot, prompt, label) {
  const lastEntry = shot.promptHistory[shot.promptHistory.length - 1];
  if (lastEntry?.prompt === prompt) {
    return false;
  }

  shot.promptHistory.push(createHistoryEntry(prompt, label));
  return true;
}

function createShot() {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    imageDataUrl: "",
    currentPrompt: "",
    promptHistory: [],
    chatHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

async function createShotFromFile(file) {
  const shot = createShot();
  shot.title = file.name.replace(/\.[^.]+$/, "");
  shot.imageDataUrl = await fileToDataUrl(file);
  return shot;
}

async function updateShotImage(shot, file, message) {
  if (!file.type.startsWith("image/")) {
    setStatus("请选择图片文件。");
    return;
  }

  shot.imageDataUrl = await fileToDataUrl(file);
  shot.updatedAt = new Date().toISOString();
  await persistState(message);
}

function createHistoryEntry(prompt, label) {
  return {
    id: crypto.randomUUID(),
    prompt,
    label,
    createdAt: new Date().toISOString(),
  };
}

function createChatEntry(role, content) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function isShotEmpty(shot) {
  return !shot.title && !shot.imageDataUrl && !shot.currentPrompt && !shot.promptHistory.length && !shot.chatHistory.length;
}

function updateSummary() {
  const historyTotal = state.shots.reduce((total, shot) => total + shot.promptHistory.length, 0);
  const chatTotal = state.shots.reduce((total, shot) => total + shot.chatHistory.length, 0);
  elements.shotCount.textContent = String(state.shots.length);
  elements.historyCount.textContent = String(historyTotal);
  elements.chatCount.textContent = String(chatTotal);
}

async function persistState(message) {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id: RECORD_KEY, payload: state });
    await transactionDone(tx);
    setStatus(message);
  } catch (error) {
    console.error(error);
    setStatus("本地存档失败，请检查浏览器权限。");
  }
}

async function loadState() {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, "readonly");
    const record = await requestResult(tx.objectStore(STORE_NAME).get(RECORD_KEY));
    return normalizeState(record?.payload);
  } catch (error) {
    console.error(error);
    return structuredClone(defaultState);
  }
}

function normalizeState(input) {
  if (!input) {
    return structuredClone(defaultState);
  }

  return {
    settings: {
      ...defaultState.settings,
      ...input.settings,
    },
    shots: Array.isArray(input.shots) ? input.shots : [],
  };
}

function getDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB 打开失败。"));
    });
  }

  return dbPromise;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB 读取失败。"));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB 写入失败。"));
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB 事务中断。"));
  });
}

function syncSettingsInputs() {
  elements.apiKey.value = state.settings.apiKey || "";
  elements.model.value = state.settings.model || defaultState.settings.model;
  elements.globalDirection.value = state.settings.globalDirection || "";
}

function getShotById(shotId) {
  return state.shots.find((shot) => shot.id === shotId);
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("读取图片失败。"));
    reader.readAsDataURL(file);
  });
}

function setButtonLoading(button, label) {
  button.disabled = true;
  button.dataset.originalLabel = button.textContent;
  button.textContent = label;
}

function resetButtonLoading(button, fallbackLabel) {
  button.disabled = false;
  button.textContent = button.dataset.originalLabel || fallbackLabel;
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
