const DB_NAME = "shot-prompt-workspace-db";
const STORE_NAME = "workspace";
const RECORD_KEY = "workspace-state";
const PERSIST_DEBOUNCE_MS = 300;
const IMAGE_MAX_DIMENSION = 1280;
const IMAGE_OUTPUT_MIME = "image/jpeg";
const IMAGE_OUTPUT_QUALITY = 0.76;
const VIDEO_POLL_INTERVAL_MS = 10000;
const VIDEO_BASE_URL = "/api/video-tasks";
const DEFAULT_VIDEO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const DEFAULT_VIDEO_MODEL = "doubao-seedance-2-0-260128";
const ENHANCE_POLL_INTERVAL_MS = 15000;
const ENHANCE_BASE_URL = "/api/enhance-video";
const ENHANCE_TASK_BASE_URL = "/api/enhance-tasks";
const DEFAULT_ENHANCE_BASE_URL = "https://amk.cn-beijing.volces.com/api/v1";
const UNDERSTAND_BASE_URL = "/api/understand-video";
const DEFAULT_UNDERSTAND_BASE_URL = "https://amk-ark.cn-beijing.volces.com/api/v1";
const DEFAULT_UNDERSTAND_MODEL = "doubao-seed-1-6-vision-250615";
const PROXY_VIDEO_URL = "/api/proxy-video";
const LOCAL_VIDEO_DIR_RECORD_KEY = "local-video-dir-handle";
const DEFAULT_SCENE_ID = "scene-default";
const DEFAULT_SCENE_NAME = "未分类";
const SYSTEM_PROMPT = "你是专业的视频生成提示词导演，只输出最终可直接使用的中文视频生成 Prompt，不要解释。";
const PROVIDER_CONFIGS = {
  gemini: {
    id: "gemini",
    label: "Gemini",
    apiKeyLabel: "Gemini API Key",
    defaultModel: "gemini-3-flash-preview",
    modelSuggestions: ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-pro"],
    requestMode: "gemini",
    temperature: 0.4,
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    apiKeyLabel: "OpenAI API Key",
    defaultModel: "gpt-5.4",
    modelSuggestions: ["gpt-5.4", "gpt-4.1", "gpt-4o-mini"],
    requestMode: "openai",
    baseUrl: "https://api.openai.com/v1",
    temperature: 0.4,
  },
  custom: {
    id: "custom",
    label: "自定义 API",
    apiKeyLabel: "自定义 API Key",
    defaultModel: "",
    modelSuggestions: [],
    requestMode: "responses",
    baseUrl: "",
    temperature: 0.4,
  },
};

const defaultState = {
  settings: {
    provider: "gemini",
    apiKey: "",
    apiKeys: {},
    model: PROVIDER_CONFIGS.gemini.defaultModel,
    globalDirection: "",
    videoApiKey: "",
    videoProvider: {
      baseUrl: DEFAULT_VIDEO_BASE_URL,
      model: DEFAULT_VIDEO_MODEL,
    },
    mediaKitApiKey: "",
    mediaKitProvider: {
      baseUrl: DEFAULT_ENHANCE_BASE_URL,
    },
    understandProvider: {
      baseUrl: DEFAULT_UNDERSTAND_BASE_URL,
      model: DEFAULT_UNDERSTAND_MODEL,
    },
    customProvider: {
      label: "自定义 API",
      baseUrl: "",
      model: "",
      apiKeyLabel: "自定义 API Key",
      requestMode: "responses",
    },
  },
  shots: [],
  scenes: [],
  currentSceneId: "",
  favorites: [],
  subjects: [],
  enhanceTasks: [],
  understandTasks: [],
};

const elements = {
  workspaceTab: document.querySelector("#workspaceTab"),
  subjectsTab: document.querySelector("#subjectsTab"),
  favoritesTab: document.querySelector("#favoritesTab"),
  enhanceTab: document.querySelector("#enhanceTab"),
  understandTab: document.querySelector("#understandTab"),
  settingsButton: document.querySelector("#settingsButton"),
  heroTitleLine1: document.querySelector("#heroTitleLine1"),
  heroTitleLine2: document.querySelector("#heroTitleLine2"),
  heroTitleLine3: document.querySelector("#heroTitleLine3"),
  heroSubtitleLine1: document.querySelector("#heroSubtitleLine1"),
  heroSubtitleLine2: document.querySelector("#heroSubtitleLine2"),
  workspaceControls: document.querySelector("#workspaceControls"),
  globalDirection: document.querySelector("#globalDirection"),
  imageUploadTrigger: document.querySelector("#imageUploadTrigger"),
  imageUpload: document.querySelector("#imageUpload"),
  batchMode: document.querySelector("#batchMode"),
  batchGenerateButton: document.querySelector("#batchGenerateButton"),
  exportPromptsButton: document.querySelector("#exportPromptsButton"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  clearButton: document.querySelector("#clearButton"),
  shotsContainer: document.querySelector("#shotsContainer"),
  workspaceView: document.querySelector("#workspaceView"),
  sceneTabsBar: document.querySelector("#sceneTabsBar"),
  sceneTabs: document.querySelector("#sceneTabs"),
  sceneAddButton: document.querySelector("#sceneAddButton"),
  shotJumpInput: document.querySelector("#shotJumpInput"),
  shotCollapseAllButton: document.querySelector("#shotCollapseAllButton"),
  shotExpandAllButton: document.querySelector("#shotExpandAllButton"),
  shotSidebarToggleButton: document.querySelector("#shotSidebarToggleButton"),
  shotSidebar: document.querySelector("#shotSidebar"),
  shotSidebarList: document.querySelector("#shotSidebarList"),
  shotSidebarCount: document.querySelector("#shotSidebarCount"),
  subjectsView: document.querySelector("#subjectsView"),
  subjectsContainer: document.querySelector("#subjectsContainer"),
  subjectsUploadInput: document.querySelector("#subjectsUploadInput"),
  subjectCount: document.querySelector("#subjectCount"),
  favoritesView: document.querySelector("#favoritesView"),
  workspaceSummary: document.querySelector("#workspaceSummary"),
  favoritesContainer: document.querySelector("#favoritesContainer"),
  enhanceView: document.querySelector("#enhanceView"),
  enhanceVideoUrl: document.querySelector("#enhanceVideoUrl"),
  enhanceScene: document.querySelector("#enhanceScene"),
  enhanceToolVersion: document.querySelector("#enhanceToolVersion"),
  enhanceResolutionMode: document.querySelector("#enhanceResolutionMode"),
  enhanceResolutionPresetField: document.querySelector("#enhanceResolutionPresetField"),
  enhanceResolutionLimitField: document.querySelector("#enhanceResolutionLimitField"),
  enhanceResolution: document.querySelector("#enhanceResolution"),
  enhanceResolutionLimit: document.querySelector("#enhanceResolutionLimit"),
  enhanceFps: document.querySelector("#enhanceFps"),
  enhanceSubmitButton: document.querySelector("#enhanceSubmitButton"),
  enhanceRefreshAllButton: document.querySelector("#enhanceRefreshAllButton"),
  enhanceClearFinishedButton: document.querySelector("#enhanceClearFinishedButton"),
  enhanceTaskList: document.querySelector("#enhanceTaskList"),
  enhanceTaskCount: document.querySelector("#enhanceTaskCount"),
  enhanceSucceededCount: document.querySelector("#enhanceSucceededCount"),
  enhanceStatusText: document.querySelector("#enhanceStatusText"),
  enhanceHistoryMeta: document.querySelector("#enhanceHistoryMeta"),
  understandView: document.querySelector("#understandView"),
  understandVideoUrl: document.querySelector("#understandVideoUrl"),
  understandPrompt: document.querySelector("#understandPrompt"),
  understandModel: document.querySelector("#understandModel"),
  understandFps: document.querySelector("#understandFps"),
  understandMaxFrames: document.querySelector("#understandMaxFrames"),
  understandMaxPixels: document.querySelector("#understandMaxPixels"),
  understandSubmitButton: document.querySelector("#understandSubmitButton"),
  understandClearButton: document.querySelector("#understandClearButton"),
  understandTaskList: document.querySelector("#understandTaskList"),
  understandTaskCount: document.querySelector("#understandTaskCount"),
  understandSucceededCount: document.querySelector("#understandSucceededCount"),
  understandStatusText: document.querySelector("#understandStatusText"),
  understandHistoryMeta: document.querySelector("#understandHistoryMeta"),
  shotCount: document.querySelector("#shotCount"),
  historyCount: document.querySelector("#historyCount"),
  chatCount: document.querySelector("#chatCount"),
  favoriteCount: document.querySelector("#favoriteCount"),
  favoriteHistoryCount: document.querySelector("#favoriteHistoryCount"),
  favoritesSearch: document.querySelector("#favoritesSearch"),
  favoritesTagFilter: document.querySelector("#favoritesTagFilter"),
  favoritesBatchToggleButton: document.querySelector("#favoritesBatchToggleButton"),
  favoritesBulkBar: document.querySelector("#favoritesBulkBar"),
  favoritesSelectedCount: document.querySelector("#favoritesSelectedCount"),
  favoritesSelectAllButton: document.querySelector("#favoritesSelectAllButton"),
  favoritesBulkTagsInput: document.querySelector("#favoritesBulkTagsInput"),
  favoritesBulkTagButton: document.querySelector("#favoritesBulkTagButton"),
  favoritesBulkExportButton: document.querySelector("#favoritesBulkExportButton"),
  favoritesImportInput: document.querySelector("#favoritesImportInput"),
  favoritesBulkMoveButton: document.querySelector("#favoritesBulkMoveButton"),
  favoritesBulkDeleteButton: document.querySelector("#favoritesBulkDeleteButton"),
  favoriteModal: document.querySelector("#favoriteModal"),
  favoriteModalContent: document.querySelector("#favoriteModalContent"),
  settingsModal: document.querySelector("#settingsModal"),
  settingsModalContent: document.querySelector("#settingsModalContent"),
  shotTemplate: document.querySelector("#shotTemplate"),
  favoriteTemplate: document.querySelector("#favoriteTemplate"),
  statusText: document.querySelector("#statusText"),
  lightbox: document.querySelector("#lightbox"),
  lightboxImage: document.querySelector("#lightboxImage"),
  lightboxVideo: document.querySelector("#lightboxVideo"),
  lightboxAudio: document.querySelector("#lightboxAudio"),
  lightboxClose: document.querySelector("#lightboxClose"),
  lightboxBackdrop: document.querySelector(".lightbox-backdrop"),
  detailModalBackdrop: document.querySelector(".detail-modal-backdrop"),
};

let state = structuredClone(defaultState);
let dbPromise;
let persistTimer = null;
const videoPollTimers = new Map();
const enhancePollTimers = new Map();
let localVideoDirHandle = null;
let localVideoDirPermission = "unsupported";
const localVideoObjectUrlCache = new Map();
const pendingLocalVideoSaves = new Set();
const mentionDropdown = document.createElement("div");
mentionDropdown.className = "mention-dropdown";
mentionDropdown.hidden = true;
document.body.appendChild(mentionDropdown);
let mentionContext = null;
let mentionJustSelected = false;
const uiState = {
  draggingShotId: null,
  currentView: "workspace",
  selectedFavoriteId: null,
  selectedFavoriteIds: [],
  favoriteSearchTerm: "",
  favoriteTagFilter: "",
  isFavoriteBatchMode: false,
  isEditingApiKey: false,
  isEditingVideoApiKey: false,
  isEditingMediaKitApiKey: false,
  shotJumpQuery: "",
  collapsedShotIds: new Set(),
  sidebarCollapsed: false,
  enhanceForm: {
    videoUrl: "",
    scene: "aigc",
    toolVersion: "standard",
    resolutionMode: "preset",
    resolution: "1080p",
    resolutionLimit: "",
    fps: "",
  },
  understandForm: {
    videoUrl: "",
    prompt: "",
    model: "",
    fps: "",
    maxFrames: "",
    maxPixels: "",
  },
};

bootstrap();

async function bootstrap() {
  state = await loadState();
  syncSettingsInputs();
  bindGlobalEvents();

  if (!state.shots.length) {
    state.shots.push(createShot());
    await persistState("已创建初始镜头。");
  }

  await initLocalVideoDir();
  document.body.dataset.sidebarCollapsed = uiState.sidebarCollapsed ? "true" : "false";
  render();
  resumePendingVideoTasks();
  resumePendingEnhanceTasks();
}

function bindGlobalEvents() {
  bindRuntimeErrorReporting();

  elements.workspaceTab.addEventListener("click", () => {
    setCurrentView("workspace");
  });

  elements.subjectsTab.addEventListener("click", () => {
    setCurrentView("subjects");
  });

  elements.favoritesTab.addEventListener("click", () => {
    setCurrentView("favorites");
  });

  elements.enhanceTab.addEventListener("click", () => {
    setCurrentView("enhance");
  });

  elements.understandTab.addEventListener("click", () => {
    setCurrentView("understand");
  });

  elements.settingsButton.addEventListener("click", () => {
    openSettingsModal();
  });

  bindEnhanceEvents();
  bindUnderstandEvents();

  elements.favoritesSearch.addEventListener("input", (event) => {
    uiState.favoriteSearchTerm = event.target.value.trim().toLowerCase();
    render();
  });

  elements.favoritesTagFilter.addEventListener("change", (event) => {
    uiState.favoriteTagFilter = event.target.value.trim().toLowerCase();
    render();
  });

  elements.favoritesBatchToggleButton.addEventListener("click", () => {
    uiState.isFavoriteBatchMode = !uiState.isFavoriteBatchMode;
    if (!uiState.isFavoriteBatchMode) {
      uiState.selectedFavoriteIds = [];
    }
    render();
  });

  elements.favoritesSelectAllButton.addEventListener("click", () => {
    const visibleIds = getFilteredFavorites().map((favorite) => favorite.id);
    const selectedVisibleIds = visibleIds.filter((id) => uiState.selectedFavoriteIds.includes(id));
    if (visibleIds.length && selectedVisibleIds.length === visibleIds.length) {
      uiState.selectedFavoriteIds = uiState.selectedFavoriteIds.filter((id) => !visibleIds.includes(id));
    } else {
      uiState.selectedFavoriteIds = [...new Set([...uiState.selectedFavoriteIds, ...visibleIds])];
    }
    render();
  });

  elements.favoritesBulkTagButton.addEventListener("click", async () => {
    await addTagsToFavorites(uiState.selectedFavoriteIds, elements.favoritesBulkTagsInput.value);
    elements.favoritesBulkTagsInput.value = "";
  });

  elements.favoritesBulkTagsInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    await addTagsToFavorites(uiState.selectedFavoriteIds, event.currentTarget.value);
    event.currentTarget.value = "";
  });

  elements.favoritesBulkMoveButton.addEventListener("click", async () => {
    await moveFavoritesToWorkspaceBatch(uiState.selectedFavoriteIds);
  });

  elements.favoritesBulkExportButton.addEventListener("click", async () => {
    await flushPendingPersist();
    exportFavorites(uiState.selectedFavoriteIds);
  });

  elements.favoritesImportInput.addEventListener("change", async (event) => {
    const [file] = Array.from(event.target.files || []);
    if (!file) {
      return;
    }

    try {
      const importedFavorites = await importFavorites(file);
      if (!importedFavorites.length) {
        throw new Error("导入文件中没有可用收藏数据。");
      }

      const confirmed = window.confirm(`确认导入 ${importedFavorites.length} 个收藏吗？这会追加到当前收藏夹。`);
      if (!confirmed) {
        return;
      }

      state.favorites.push(...importedFavorites);
      await persistState(`已导入 ${importedFavorites.length} 个收藏。`);
      render();
    } catch (error) {
      setStatus(error.message || "导入收藏失败。");
    } finally {
      event.target.value = "";
    }
  });

  elements.favoritesBulkDeleteButton.addEventListener("click", async () => {
    await deleteFavoritesByIds(uiState.selectedFavoriteIds);
  });

  bindSubjectsUploadZone();

  elements.globalDirection.addEventListener("input", async (event) => {
    state.settings.globalDirection = event.target.value;
    queuePersistState("全局风格备注已更新。");
  });

  elements.imageUpload.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
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
      render();
    } catch (error) {
      reportRuntimeError(error, "批量导入镜头图失败。");
    } finally {
      event.target.value = "";
    }
  });

  elements.batchGenerateButton.addEventListener("click", async (event) => {
    await handleBatchGenerate(event.currentTarget);
  });

  elements.exportPromptsButton.addEventListener("click", async () => {
    await flushPendingPersist();
    exportAllPrompts();
  });

  elements.exportButton.addEventListener("click", async () => {
    await flushPendingPersist();
    exportWorkspace();
  });

  elements.importInput.addEventListener("change", async (event) => {
    const [file] = Array.from(event.target.files || []);
    if (!file) {
      return;
    }

    try {
      const confirmed = window.confirm("导入会覆盖当前工作台镜头、Prompt 归档和对话记录，但不会影响收藏夹和模型设置，是否继续？");
      if (!confirmed) {
        return;
      }

      const importedShots = await importWorkspace(file);
      closeLightbox();
      stopAllVideoPolling();
      state.shots = importedShots;
      await persistState("工作台镜头已导入。");
      render();
    } catch (error) {
      setStatus(error.message || "导入工作区失败。");
    } finally {
      event.target.value = "";
    }
  });

  elements.clearButton.addEventListener("click", async () => {
    const confirmed = window.confirm("确认清空工作台里的镜头、Prompt 归档和对话记录吗？模型设置和收藏夹不会受影响。");
    if (!confirmed) {
      return;
    }

    closeLightbox();
    stopAllVideoPolling();
    uiState.collapsedShotIds.clear();
    state.shots = [createShot(getActiveSceneId())];
    await persistState("已清空工作台记录。");
    render();
  });

  elements.sceneAddButton?.addEventListener("click", () => addScene());
  elements.shotJumpInput?.addEventListener("input", (event) => {
    uiState.shotJumpQuery = event.target.value;
    applyShotJumpFilter();
    if (uiState.shotJumpQuery.trim()) {
      const firstMatch = elements.shotsContainer.querySelector(".shot-card:not(.is-filter-hidden)");
      if (firstMatch) firstMatch.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  elements.shotCollapseAllButton?.addEventListener("click", () => setAllShotsCollapsed(true));
  elements.shotExpandAllButton?.addEventListener("click", () => setAllShotsCollapsed(false));
  elements.shotSidebarToggleButton?.addEventListener("click", () => toggleSidebar());

  elements.lightboxClose.addEventListener("click", closeLightbox);
  elements.lightboxBackdrop.addEventListener("click", closeLightbox);
  elements.detailModalBackdrop.addEventListener("click", closeFavoriteModal);
  elements.settingsModal.querySelector(".detail-modal-backdrop").addEventListener("click", closeSettingsModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.lightbox.hidden) {
      closeLightbox();
    }
    if (event.key === "Escape" && !elements.favoriteModal.hidden) {
      closeFavoriteModal();
    }
    if (event.key === "Escape" && !elements.settingsModal.hidden) {
      closeSettingsModal();
    }
  });

  window.addEventListener("scroll", (e) => {
    if (mentionDropdown.contains(e.target)) {
      return;
    }
    closeMentionDropdown();
  }, true);

  window.addEventListener("pagehide", () => {
    stopAllVideoPolling();
    flushPendingPersist();
  });
}

function renderSceneTabs() {
  const container = elements.sceneTabs;
  if (!container) return;
  const activeId = getActiveSceneId();
  const scenes = [...(state.scenes || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  container.innerHTML = scenes.map((scene) => {
    const count = getShotsInScene(scene.id).length;
    const active = scene.id === activeId ? " is-active" : "";
    return `
      <div class="scene-tab${active}" data-scene-id="${escapeHtml(scene.id)}">
        <button class="scene-tab-select" type="button">
          <span class="scene-tab-name">${escapeHtml(scene.name)}</span>
          <span class="scene-tab-count">${count}</span>
        </button>
        <button class="scene-tab-rename" type="button" title="重命名">✎</button>
        <button class="scene-tab-delete" type="button" title="删除">×</button>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".scene-tab").forEach((el) => {
    const sceneId = el.dataset.sceneId;
    el.querySelector(".scene-tab-select").addEventListener("click", () => setCurrentScene(sceneId));
    el.querySelector(".scene-tab-rename").addEventListener("click", (e) => { e.stopPropagation(); renameScene(sceneId); });
    el.querySelector(".scene-tab-delete").addEventListener("click", (e) => { e.stopPropagation(); deleteScene(sceneId); });
  });
}

function renderShotSidebar() {
  const list = elements.shotSidebarList;
  const count = elements.shotSidebarCount;
  if (!list) return;
  const activeSceneId = getActiveSceneId();
  const sceneShots = getShotsInScene(activeSceneId);
  const jumpQuery = uiState.shotJumpQuery || "";
  if (count) {
    count.textContent = sceneShots.length ? `${sceneShots.length} 个镜头` : "";
  }
  if (!sceneShots.length) {
    list.innerHTML = '<div class="empty-state">此场次暂无镜头。</div>';
    return;
  }
  list.innerHTML = sceneShots.map((shot, i) => {
    const isMatch = matchesJumpQuery(shot, i, jumpQuery);
    const title = (shot.title || shot.directorNotes?.slice(0, 30) || "（未命名）").trim();
    const hasVideo = Boolean(shot.videoTask?.videoUrl);
    const videoDot = hasVideo ? '<span class="sidebar-dot" title="已生成视频"></span>' : "";
    return `
      <button class="shot-sidebar-item${isMatch ? "" : " is-dimmed"}" type="button" data-shot-id="${escapeHtml(shot.id)}">
        <span class="sidebar-order">#${String(i + 1).padStart(2, "0")}</span>
        <span class="sidebar-title">${escapeHtml(title)}</span>
        ${videoDot}
      </button>
    `;
  }).join("");
  list.querySelectorAll(".shot-sidebar-item").forEach((el) => {
    el.addEventListener("click", () => jumpToShot(el.dataset.shotId));
  });
}

function render() {
  closeMentionDropdown();
  renderPageChrome();
  syncSettingsInputs();
  renderSettingsModal();
  renderSceneTabs();
  elements.shotsContainer.innerHTML = "";
  elements.favoritesContainer.innerHTML = "";

  const activeSceneId = getActiveSceneId();
  const sceneShots = getShotsInScene(activeSceneId);
  const jumpQuery = uiState.shotJumpQuery || "";

  sceneShots.forEach((shot, index) => {
    const fragment = elements.shotTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".shot-card");
    const shotStatusBar = fragment.querySelector(".shot-status-bar");
    const order = fragment.querySelector(".shot-order");
    const headTitle = fragment.querySelector(".shot-head-title");
    const sceneSelect = fragment.querySelector(".shot-scene-select");
    const collapseButton = fragment.querySelector(".shot-collapse-button");
    const titleInput = fragment.querySelector(".shot-title");
    const directorNotesInput = fragment.querySelector(".director-notes");
    const promptInput = fragment.querySelector(".shot-prompt");
    const feedbackInput = fragment.querySelector(".feedback-input");
    const historyList = fragment.querySelector(".history-list");

    const currentVersionLabel = fragment.querySelector(".current-version-label");
    const historyCount = fragment.querySelector(".history-count");
    const videoTaskLabel = fragment.querySelector(".video-task-label");
    const referencesList = fragment.querySelector(".references-list");
    const referencesUploadZone = fragment.querySelector(".references-upload-zone");
    const referencesUploadInput = fragment.querySelector(".references-upload-input");
    const referencesCapacity = fragment.querySelector(".references-capacity");
    const videoRatioInput = fragment.querySelector(".video-ratio");
    const videoDurationInput = fragment.querySelector(".video-duration");
    const videoResolutionInput = fragment.querySelector(".video-resolution");
    const videoSeedInput = fragment.querySelector(".video-seed");
    const videoGenerateAudioInput = fragment.querySelector(".video-generate-audio");
    const videoCameraFixedInput = fragment.querySelector(".video-camera-fixed");
    const videoWatermarkInput = fragment.querySelector(".video-watermark");
    const videoReturnLastFrameInput = fragment.querySelector(".video-return-last-frame");
    const generatedVideo = fragment.querySelector(".generated-video");
    const videoLastFrame = fragment.querySelector(".video-last-frame");
    const videoResultEmpty = fragment.querySelector(".video-result-empty");
    const videoResultMeta = fragment.querySelector(".video-result-meta");
    const videoHistoryList = fragment.querySelector(".video-history-list");
    const videoHistoryCount = fragment.querySelector(".video-history-count");
    const favoriteButton = fragment.querySelector(".favorite-button");
    const duplicateFavoriteButton = fragment.querySelector(".duplicate-favorite-button");

    const displayOrder = index + 1;
    order.textContent = `Shot ${String(displayOrder).padStart(2, "0")}`;
    order.title = "拖拽以调整镜头顺序";
    card.dataset.shotId = shot.id;
    card.dataset.shotOrder = String(displayOrder);
    if (uiState.collapsedShotIds.has(shot.id)) {
      card.dataset.collapsed = "true";
      collapseButton.textContent = "展开";
    } else {
      card.dataset.collapsed = "false";
      collapseButton.textContent = "折叠";
    }
    headTitle.textContent = shot.title || shot.directorNotes?.slice(0, 40) || "（未命名镜头）";
    sceneSelect.innerHTML = state.scenes.map((s) => `<option value="${escapeHtml(s.id)}"${s.id === shot.sceneId ? " selected" : ""}>${escapeHtml(s.name)}</option>`).join("");
    collapseButton.addEventListener("click", () => {
      setShotCollapsed(shot.id, !uiState.collapsedShotIds.has(shot.id));
    });
    sceneSelect.addEventListener("change", async (event) => {
      await moveShotToScene(shot.id, event.target.value);
    });
    bindShotSortEvents(card, order, shot.id);
    titleInput.value = shot.title;
    titleInput.placeholder = "例如：s01c001";
    directorNotesInput.value = shot.directorNotes || "";
    directorNotesInput.placeholder = "例如：这一镜主打人物迟疑感，情绪要收着，眼神先躲再回看，节奏慢半拍";
    promptInput.value = shot.currentPrompt;
    videoRatioInput.value = shot.videoConfig.ratio;
    videoDurationInput.value = String(shot.videoConfig.duration);
    videoResolutionInput.value = shot.videoConfig.resolution;
    {
      const videoModel = normalizeVideoProvider(state.settings.videoProvider).model;
      const supports1080p = videoModelSupports1080p(videoModel);
      const option1080p = videoResolutionInput.querySelector('option[value="1080p"]');
      if (option1080p) {
        option1080p.disabled = !supports1080p;
        option1080p.textContent = supports1080p ? "1080p" : "1080p（当前模型不支持）";
      }
      if (!supports1080p && shot.videoConfig.resolution === "1080p") {
        shot.videoConfig.resolution = "720p";
        videoResolutionInput.value = "720p";
      }
    }
    videoSeedInput.value = shot.videoConfig.seed ?? "";
    videoGenerateAudioInput.checked = shot.videoConfig.generateAudio !== false;
    videoCameraFixedInput.checked = Boolean(shot.videoConfig.cameraFixed);
    videoWatermarkInput.checked = Boolean(shot.videoConfig.watermark);
    videoReturnLastFrameInput.checked = Boolean(shot.videoConfig.returnLastFrame);
    renderVideoResult({
      shot,
      videoTaskLabel,
      generatedVideo,
      videoLastFrame,
      videoResultEmpty,
      videoResultMeta,
    });
    renderVideoHistory(videoHistoryList, shot);
    videoHistoryCount.textContent = `${(shot.videoHistory || []).length} 条归档`;

    renderReferences(referencesList, shot);
    updateReferencesCapacity(referencesCapacity, shot);
    bindReferencesUploadZone(referencesUploadZone, referencesUploadInput, shot);

    currentVersionLabel.textContent = shot.updatedAt ? `最近更新：${formatTime(shot.updatedAt)}` : "尚未保存";
    historyCount.textContent = `${shot.promptHistory.length} 条归档`;
    const favorited = isFavoriteShot(shot.id);
    favoriteButton.textContent = favorited ? "覆盖收藏" : "收藏此镜头";
    duplicateFavoriteButton.hidden = !favorited;

    titleInput.addEventListener("input", async (event) => {
      shot.title = event.target.value;
      shot.updatedAt = new Date().toISOString();
      headTitle.textContent = shot.title || shot.directorNotes?.slice(0, 40) || "（未命名镜头）";
      const sidebarItem = elements.shotSidebarList?.querySelector(`.shot-sidebar-item[data-shot-id="${shot.id}"] .sidebar-title`);
      if (sidebarItem) sidebarItem.textContent = (shot.title || shot.directorNotes?.slice(0, 30) || "（未命名）").trim();
      queuePersistState("镜头标题已更新。");
    });

    directorNotesInput.addEventListener("input", async (event) => {
      shot.directorNotes = event.target.value;
      shot.updatedAt = new Date().toISOString();
      queuePersistState("导演讲戏已更新。");
    });

    promptInput.addEventListener("input", async (event) => {
      shot.currentPrompt = event.target.value;
      shot.updatedAt = new Date().toISOString();
      queuePersistState("当前 Prompt 已更新。");
    });

    bindMentionAutocomplete(directorNotesInput, shot);
    bindMentionAutocomplete(promptInput, shot);

    videoRatioInput.addEventListener("change", (event) => {
      shot.videoConfig.ratio = event.target.value || "16:9";
      shot.updatedAt = new Date().toISOString();
      queuePersistState("视频比例已更新。");
    });

    videoDurationInput.addEventListener("change", (event) => {
      shot.videoConfig.duration = clampVideoDuration(event.target.value);
      shot.updatedAt = new Date().toISOString();
      queuePersistState("视频时长已更新。");
    });

    videoResolutionInput.addEventListener("change", (event) => {
      shot.videoConfig.resolution = String(event.target.value || "").trim();
      shot.updatedAt = new Date().toISOString();
      queuePersistState("视频分辨率已更新。");
    });

    videoSeedInput.addEventListener("input", (event) => {
      shot.videoConfig.seed = normalizeVideoSeed(event.target.value);
      shot.updatedAt = new Date().toISOString();
      queuePersistState("视频随机种子已更新。");
    });

    videoGenerateAudioInput.addEventListener("change", (event) => {
      shot.videoConfig.generateAudio = Boolean(event.target.checked);
      shot.updatedAt = new Date().toISOString();
      queuePersistState("有声视频设置已更新。");
    });

    videoCameraFixedInput.addEventListener("change", (event) => {
      shot.videoConfig.cameraFixed = Boolean(event.target.checked);
      shot.updatedAt = new Date().toISOString();
      queuePersistState("固定镜头设置已更新。");
    });

    videoWatermarkInput.addEventListener("change", (event) => {
      shot.videoConfig.watermark = Boolean(event.target.checked);
      shot.updatedAt = new Date().toISOString();
      queuePersistState("视频水印设置已更新。");
    });

    videoReturnLastFrameInput.addEventListener("change", (event) => {
      shot.videoConfig.returnLastFrame = Boolean(event.target.checked);
      shot.updatedAt = new Date().toISOString();
      queuePersistState("视频尾帧返回设置已更新。");
    });

    fragment.querySelector(".generate-button").addEventListener("click", async (event) => {
      await handleGeneratePrompt(shot.id, event.currentTarget);
    });

    fragment.querySelector(".generate-video-button").addEventListener("click", async (event) => {
      await handleGenerateVideo(shot.id, event.currentTarget);
    });

    fragment.querySelector(".refresh-video-button").addEventListener("click", async (event) => {
      await handleRefreshVideoTask(shot.id, event.currentTarget);
    });

    fragment.querySelector(".clear-video-button").addEventListener("click", async () => {
      clearVideoTaskState(shot);
      await persistState("视频任务结果已清空。");
      render();
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

    fragment.querySelector(".insert-above-button").addEventListener("click", async () => {
      await insertShotRelative(shot.id, 0);
    });

    fragment.querySelector(".insert-below-button").addEventListener("click", async () => {
      await insertShotRelative(shot.id, 1);
    });

    fragment.querySelector(".delete-button").addEventListener("click", async () => {
      if (state.shots.length === 1) {
        setStatus("至少保留一个镜头。");
        return;
      }

      state.shots = state.shots.filter((item) => item.id !== shot.id);
      stopVideoPolling(shot.id);
      uiState.collapsedShotIds.delete(shot.id);
      await persistState("镜头已删除。");
      render();
    });

    favoriteButton.addEventListener("click", async () => {
      await toggleFavoriteShot(shot);
    });

    duplicateFavoriteButton.addEventListener("click", async () => {
      await createNewFavoriteFromShot(shot);
    });

    renderHistory(historyList, shot);

    elements.shotsContainer.append(fragment);
  });

  hydrateLocalVideoElements(elements.shotsContainer);
  renderShotSidebar();
  applyShotJumpFilter();
  renderFavorites();
  updateSummary();
}

function applyShotJumpFilter() {
  const query = (uiState.shotJumpQuery || "").trim();
  const cards = elements.shotsContainer.querySelectorAll(".shot-card");
  cards.forEach((card) => {
    const shotId = card.dataset.shotId;
    const shot = getShotById(shotId);
    if (!shot) return;
    const index = Number(card.dataset.shotOrder || 0) - 1;
    const match = matchesJumpQuery(shot, index, query);
    card.classList.toggle("is-filter-hidden", !match);
  });
  elements.shotSidebarList?.querySelectorAll(".shot-sidebar-item").forEach((item) => {
    const shotId = item.dataset.shotId;
    const shot = getShotById(shotId);
    if (!shot) return;
    const sceneShots = getShotsInScene(shot.sceneId);
    const i = sceneShots.findIndex((s) => s.id === shotId);
    const match = matchesJumpQuery(shot, i, query);
    item.classList.toggle("is-dimmed", !match);
  });
}

function renderPageChrome() {
  const currentView = uiState.currentView;
  const isWorkspace = currentView === "workspace";
  const isSubjects = currentView === "subjects";
  const isFavorites = currentView === "favorites";
  const isEnhance = currentView === "enhance";
  const isUnderstand = currentView === "understand";
  elements.workspaceTab.classList.toggle("is-active", isWorkspace);
  elements.subjectsTab.classList.toggle("is-active", isSubjects);
  elements.favoritesTab.classList.toggle("is-active", isFavorites);
  elements.enhanceTab.classList.toggle("is-active", isEnhance);
  elements.understandTab.classList.toggle("is-active", isUnderstand);
  elements.workspaceControls.hidden = !isWorkspace;
  elements.workspaceSummary.hidden = !isWorkspace;
  elements.workspaceView.hidden = !isWorkspace;
  elements.subjectsView.hidden = !isSubjects;
  elements.favoritesView.hidden = !isFavorites;
  elements.enhanceView.hidden = !isEnhance;
  elements.understandView.hidden = !isUnderstand;
  elements.favoritesBulkBar.hidden = !isFavorites || !uiState.isFavoriteBatchMode;
  elements.favoritesSearch.value = uiState.favoriteSearchTerm;
  populateFavoriteTagFilter();
  elements.favoritesTagFilter.value = uiState.favoriteTagFilter;
  elements.favoritesBatchToggleButton.textContent = uiState.isFavoriteBatchMode ? "退出批量处理" : "批量处理";
  elements.favoritesBatchToggleButton.classList.toggle("favorite-accent-button", uiState.isFavoriteBatchMode);
  updateFavoriteBulkBar();

  if (isSubjects) {
    elements.heroTitleLine1.textContent = "";
    elements.heroTitleLine2.textContent = "主体库";
    elements.heroSubtitleLine1.textContent = "上传角色、场景、道具的设定图，";
    elements.heroSubtitleLine2.textContent = "在 Prompt 中用 @ 快速调用。";
    elements.subjectCount.textContent = String(state.subjects.length);
    renderSubjects();
    return;
  }

  if (isFavorites) {
    elements.heroTitleLine1.textContent = "";
    elements.heroTitleLine2.textContent = "收藏夹";
    elements.heroSubtitleLine1.textContent = "收藏你需要反复查看和复用的镜头内容，";
    elements.heroSubtitleLine2.textContent = "下次打开网页时，仍可在这里继续查看。";
    return;
  }

  if (isEnhance) {
    elements.heroTitleLine1.textContent = "画质";
    elements.heroTitleLine2.textContent = "增强";
    elements.heroSubtitleLine1.textContent = "基于 AI MediaKit 对视频进行超分、插帧、色彩与降噪增强，";
    elements.heroSubtitleLine2.textContent = "支持 AIGC、短剧、UGC、老片修复四种预设场景。";
    renderEnhanceView();
    return;
  }

  if (isUnderstand) {
    elements.heroTitleLine1.textContent = "视频";
    elements.heroTitleLine2.textContent = "理解";
    elements.heroSubtitleLine1.textContent = "通过 AI MediaKit 把视频抽帧后喂给火山方舟视觉大模型，";
    elements.heroSubtitleLine2.textContent = "支持内容总结、场景分析、时序定位等任务。";
    renderUnderstandView();
    return;
  }

  elements.heroTitleLine1.textContent = "视频";
  elements.heroTitleLine2.textContent = "工作台";
  elements.heroSubtitleLine1.textContent = "上传参考素材，生成或手写 Prompt，";
  elements.heroSubtitleLine2.textContent = "一键提交视频生成，迭代归档。";
}

function setCurrentView(view) {
  uiState.currentView = view;
  render();
}

function createSubject(imageDataUrl, name) {
  return {
    id: crypto.randomUUID(),
    name: name || "",
    type: "角色",
    imageDataUrl: imageDataUrl || "",
    createdAt: new Date().toISOString(),
  };
}

function bindSubjectsUploadZone() {
  const zone = elements.subjectsView.querySelector(".subjects-upload-zone");
  const input = elements.subjectsUploadInput;

  zone.addEventListener("click", () => input.click());

  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragenter", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragleave", (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", async (event) => {
    event.preventDefault();
    zone.classList.remove("drag-over");
    const files = Array.from(event.dataTransfer?.files || []).filter(isProbablyImageFile);
    if (files.length) await addSubjectsFromFiles(files);
  });

  input.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []).filter(isProbablyImageFile);
    if (files.length) await addSubjectsFromFiles(files);
    input.value = "";
  });
}

async function addSubjectsFromFiles(files) {
  for (const file of files) {
    const url = await optimizeImageFile(file);
    const name = file.name.replace(/\.[^.]+$/, "");
    state.subjects.push(createSubject(url, name));
  }
  await persistState(`已添加 ${files.length} 个主体。`);
  render();
}

function renderSubjects() {
  const container = elements.subjectsContainer;
  container.innerHTML = "";

  if (!state.subjects.length) {
    container.innerHTML = '<div class="empty-state">暂无主体。上传角色、场景、道具的设定图开始使用。</div>';
    return;
  }

  state.subjects.forEach((subject) => {
    const card = document.createElement("div");
    card.className = "subject-card";

    const typeOptions = ["角色", "场景", "道具"].map(
      (t) => `<option value="${t}"${subject.type === t ? " selected" : ""}>${t}</option>`
    ).join("");

    card.innerHTML = `
      <div class="subject-image-frame">
        <img class="subject-image" src="${escapeHtml(subject.imageDataUrl)}" alt="${escapeHtml(subject.name || "主体")}">
      </div>
      <div class="subject-info">
        <input class="subject-name-input" type="text" value="${escapeHtml(subject.name)}" placeholder="输入名称，如：波风">
        <select class="subject-type-select">${typeOptions}</select>
      </div>
      <button class="ghost-button subject-delete-button danger" type="button">删除</button>
    `;

    card.querySelector(".subject-image").addEventListener("click", () => {
      if (subject.imageDataUrl) openLightbox(subject.imageDataUrl, subject.name);
    });

    card.querySelector(".subject-name-input").addEventListener("input", (event) => {
      subject.name = event.target.value.trim();
      queuePersistState("主体名称已更新。");
    });

    card.querySelector(".subject-type-select").addEventListener("change", (event) => {
      subject.type = event.target.value;
      queuePersistState("主体类型已更新。");
    });

    card.querySelector(".subject-delete-button").addEventListener("click", async () => {
      state.subjects = state.subjects.filter((s) => s.id !== subject.id);
      await persistState("主体已删除。");
      render();
    });

    container.append(card);
  });
}

function renderFavorites() {
  const favorites = getFilteredFavorites();
  const selectedIds = new Set(uiState.selectedFavoriteIds);
  const isBatchMode = uiState.isFavoriteBatchMode;

  if (!favorites.length) {
    elements.favoritesContainer.innerHTML = uiState.favoriteSearchTerm
      ? '<div class="empty-state">没有找到匹配这个关键词的收藏镜头。</div>'
      : '<div class="empty-state">还没有收藏镜头。你可以在工作台里的 shot 点击“收藏此镜头”。</div>';
    closeFavoriteModal();
    return;
  }

  favorites.forEach((favorite, index) => {
    const fragment = elements.favoriteTemplate.content.cloneNode(true);
    const imageFrame = fragment.querySelector(".favorite-image-frame");
    const image = fragment.querySelector(".favorite-image");
    const openButton = fragment.querySelector(".favorite-open-button");
    const title = fragment.querySelector(".favorite-title");
    const metaList = fragment.querySelector(".favorite-meta-list");
    const tile = fragment.querySelector(".favorite-tile");
    const actions = fragment.querySelector(".favorite-tile-actions");

    const favCoverImage = (favorite.references || []).find((r) => r.mediaType === "image" && r.url);
    if (favCoverImage) {
      imageFrame.classList.add("has-image");
      image.src = favCoverImage.url;
    }
    image.alt = favorite.title ? `${favorite.title} 收藏预览` : "收藏镜头图预览";
    title.textContent = favorite.title || "未命名镜头";
    title.title = [favorite.title || "未命名镜头", ...(favorite.tags || [])].join(" · ");
    tile.classList.toggle("is-selected", selectedIds.has(favorite.id));
    tile.classList.toggle("is-batch-mode", isBatchMode);
    actions.hidden = isBatchMode;

    openButton.addEventListener("click", () => {
      if (isBatchMode) {
        const nextSelected = !uiState.selectedFavoriteIds.includes(favorite.id);
        toggleFavoriteSelection(favorite.id, nextSelected);
        tile.classList.toggle("is-selected", nextSelected);
        updateFavoriteBulkBar();
        return;
      }
      openFavoriteModal(favorite.id);
    });

    fragment.querySelector(".move-to-workspace-button").addEventListener("click", async () => {
      await moveFavoriteToWorkspace(favorite);
    });

    fragment.querySelector(".unfavorite-button").addEventListener("click", async () => {
      await deleteFavoritesByIds([favorite.id]);
    });

    elements.favoritesContainer.append(fragment);
  });
}

function renderFavoriteHistory(container, entries, favoriteId = "") {
  container.innerHTML = "";
  if (!entries.length) {
    container.innerHTML = '<div class="empty-state">暂无 Prompt归档。</div>';
    return;
  }

  [...entries].slice(-5).reverse().forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(entry.label)} · ${formatTime(entry.createdAt)}</strong>
        <div class="history-actions">
          <button class="ghost-button archive-rate-button" type="button">${renderArchiveStars(entry.rating || 0)}</button>
        </div>
      </header>
      <p class="truncatable">${escapeHtml(entry.prompt)}</p>
    `;
    item.querySelector("p.truncatable").addEventListener("click", () => {
      item.classList.toggle("is-expanded");
    });
    item.querySelector(".archive-rate-button").addEventListener("click", async () => {
      const favorite = state.favorites.find((item) => item.id === favoriteId);
      const favoriteEntry = favorite?.promptHistory?.find((item) => item.id === entry.id);
      if (!favoriteEntry) {
        return;
      }

      favoriteEntry.rating = getNextArchiveRating(favoriteEntry.rating || 0);
      await persistState("收藏归档星标已更新。");
      renderFavoriteModal(favorite);
    });
    container.append(item);
  });
}

function renderFavoriteVideoHistory(container, favorite) {
  container.innerHTML = "";
  const history = favorite.videoHistory || [];
  if (!history.length) {
    container.innerHTML = '<div class="empty-state">暂无视频归档。</div>';
    return;
  }

  [...history].reverse().forEach((entry) => {
    const item = document.createElement("div");
    item.className = "video-history-item";
    const hasVideo = Boolean(entry.videoUrl);
    item.innerHTML = `
      ${entry.requestSummary ? `<p class="video-history-meta">${escapeHtml(entry.requestSummary)}</p>` : ""}
      ${entry.prompt ? `<p class="truncatable video-history-prompt">${escapeHtml(entry.prompt)}</p>` : ""}
      ${hasVideo ? `<video src="${escapeHtml(entry.videoUrl)}" ${entry.localFileName ? `data-local-filename="${escapeHtml(entry.localFileName)}"` : ""} controls playsinline></video>` : ""}
      ${hasVideo ? `<p class="video-history-meta"><a href="${escapeHtml(entry.videoUrl)}" target="_blank" rel="noopener noreferrer">打开视频链接</a>${entry.localFileName ? ` · 本地：${escapeHtml(entry.localFileName)}` : ""}</p>` : ""}
    `;
    const promptEl = item.querySelector("p.truncatable");
    if (promptEl) {
      promptEl.addEventListener("click", () => item.classList.toggle("is-expanded"));
    }
    container.append(item);
  });
  hydrateLocalVideoElements(container);
}

function renderFavoriteModal(favorite) {
  const refs = favorite.references || [];
  const roleLabels = { first_frame: "首帧", last_frame: "尾帧", reference_image: "参考图" };

  const referencesHtml = refs.length
    ? refs.map((ref) => {
        let preview = "";
        if (ref.mediaType === "image" && ref.url) {
          preview = `<img class="favorite-ref-preview" src="${escapeHtml(ref.url)}" alt="${escapeHtml(ref.title || "参考图")}" data-url="${escapeHtml(ref.url)}">`;
        } else if (ref.mediaType === "video") {
          preview = '<div class="reference-item-icon">视频</div>';
        } else if (ref.mediaType === "audio") {
          preview = '<div class="reference-item-icon">音频</div>';
        }
        const roleText = roleLabels[ref.role] || "自动";
        return `<div class="favorite-ref-item">
          ${preview}
          <span class="favorite-ref-title">${escapeHtml(ref.title || ref.mediaType)}</span>
          <span class="favorite-ref-role">${roleText}</span>
        </div>`;
      }).join("")
    : '<div class="empty-state">暂无参考素材</div>';

  const videoHistoryHtml = (favorite.videoHistory || []).length
    ? `<div class="favorite-block">
        <button class="favorite-video-toggle" type="button" aria-expanded="false">展开视频归档（${favorite.videoHistory.length} 条）</button>
        <div class="favorite-video-history is-collapsed"></div>
      </div>`
    : "";

  elements.favoriteModalContent.innerHTML = `
    <article class="shot-card favorite-detail-card">
      <div class="panel-header">
        <h2>收藏详情</h2>
        <div class="history-actions">
          <button class="ghost-button favorite-detail-move" type="button">移入工作台</button>
          <button class="ghost-button favorite-detail-remove danger" type="button">删除</button>
          <button class="ghost-button favorite-detail-close" type="button">关闭</button>
        </div>
      </div>
      <div class="favorite-detail-body">
        <section class="favorite-detail-panel">
          <div class="favorite-meta-list">
            <p class="favorite-title">${escapeHtml(favorite.title || "未命名镜头")}</p>
            <p class="favorite-time meta">收藏时间：${formatTime(favorite.favoritedAt)}</p>
          </div>
          <label class="field compact favorite-tags-field">
            <span>新增标签</span>
            <input class="favorite-tags-input" type="text" value="" placeholder="例如：第一场，s01，角色名，奇幻">
          </label>
          <div class="favorite-tag-list">${renderFavoriteTags(favorite.tags || [])}</div>
        </section>
        <section class="favorite-detail-panel">
          <div class="favorite-block">
            <h3 style="white-space:nowrap">全能参考 / 图生视频</h3>
            <div class="favorite-refs-grid">${referencesHtml}</div>
          </div>
        </section>
        ${favorite.directorNotes ? `
        <section class="favorite-detail-panel">
          <div class="favorite-block">
            <h3>导演讲戏 / 镜头描述</h3>
            <p class="favorite-notes">${escapeHtml(favorite.directorNotes)}</p>
          </div>
        </section>` : ""}
        <section class="favorite-detail-panel">
          <div class="favorite-block">
            <h3>当前 Prompt</h3>
            <p class="favorite-prompt">${escapeHtml(favorite.currentPrompt || "暂无 Prompt")}</p>
          </div>
        </section>
        <section class="favorite-detail-panel">
          <div class="favorite-block">
            <button class="favorite-archive-toggle" type="button" aria-expanded="false">展开 Prompt归档（${(favorite.promptHistory || []).length} 条）</button>
            <div class="favorite-history is-collapsed"></div>
          </div>
        </section>
        ${videoHistoryHtml ? `<section class="favorite-detail-panel">${videoHistoryHtml}</section>` : ""}
      </div>
    </article>
  `;

  const historyContainer = elements.favoriteModalContent.querySelector(".favorite-history");
  const archiveToggleButton = elements.favoriteModalContent.querySelector(".favorite-archive-toggle");

  renderFavoriteHistory(historyContainer, favorite.promptHistory || [], favorite.id);

  elements.favoriteModalContent.querySelectorAll(".favorite-ref-preview").forEach((img) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      openLightbox(img.dataset.url, favorite.title);
    });
  });

  const tagsInput = elements.favoriteModalContent.querySelector(".favorite-tags-input");
  tagsInput.addEventListener("change", async (event) => {
    await saveFavoriteTags(favorite.id, event.currentTarget.value);
    event.currentTarget.value = "";
  });
  tagsInput.addEventListener("blur", async (event) => {
    await saveFavoriteTags(favorite.id, event.currentTarget.value);
    event.currentTarget.value = "";
  });
  tagsInput.addEventListener("keydown", async (event) => {
    if (!["Enter", ",", "，", ";", "；"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const separator = event.key === "Enter" ? "，" : event.key;
    const input = event.currentTarget;
    if (!input.value.endsWith(separator)) {
      input.value = `${input.value}${separator}`;
    }
    await saveFavoriteTags(favorite.id, input.value);
    input.value = "";
  });
  elements.favoriteModalContent.querySelectorAll(".favorite-tag-remove").forEach((button) => {
    button.addEventListener("click", async () => {
      await removeFavoriteTag(favorite.id, button.dataset.tagValue || "");
    });
  });
  archiveToggleButton.addEventListener("click", () => {
    const expanded = archiveToggleButton.getAttribute("aria-expanded") === "true";
    archiveToggleButton.setAttribute("aria-expanded", String(!expanded));
    archiveToggleButton.textContent = expanded
      ? `展开 Prompt归档（${(favorite.promptHistory || []).length} 条）`
      : `收起 Prompt归档`;
    historyContainer.classList.toggle("is-collapsed", expanded);
  });

  const videoToggle = elements.favoriteModalContent.querySelector(".favorite-video-toggle");
  const videoHistoryContainer = elements.favoriteModalContent.querySelector(".favorite-video-history");
  if (videoToggle && videoHistoryContainer) {
    renderFavoriteVideoHistory(videoHistoryContainer, favorite);
    videoToggle.addEventListener("click", () => {
      const expanded = videoToggle.getAttribute("aria-expanded") === "true";
      videoToggle.setAttribute("aria-expanded", String(!expanded));
      videoToggle.textContent = expanded
        ? `展开视频归档（${(favorite.videoHistory || []).length} 条）`
        : `收起视频归档`;
      videoHistoryContainer.classList.toggle("is-collapsed", expanded);
    });
  }

  elements.favoriteModalContent.querySelector(".favorite-detail-move").addEventListener("click", async () => {
    await moveFavoriteToWorkspace(favorite);
  });
  elements.favoriteModalContent.querySelector(".favorite-detail-remove").addEventListener("click", async () => {
    await deleteFavoritesByIds([favorite.id]);
  });
  elements.favoriteModalContent.querySelector(".favorite-detail-close").addEventListener("click", closeFavoriteModal);
}

function isFavoriteShot(shotId) {
  const shot = getShotById(shotId);
  if (!shot) {
    return false;
  }

  return state.favorites.some((item) => item.id === shot.linkedFavoriteId || item.shotId === shot.id);
}

async function toggleFavoriteShot(shot) {
  const snapshot = createFavoriteSnapshot(shot);
  const existingIndex = state.favorites.findIndex((item) => item.id === shot.linkedFavoriteId || item.shotId === shot.id);

  if (existingIndex >= 0) {
    state.favorites.splice(existingIndex, 1, snapshot);
    await persistState("收藏内容已更新。");
  } else {
    state.favorites.push(snapshot);
    await persistState("已加入收藏夹。");
  }

  shot.linkedFavoriteId = snapshot.id;
  render();
}

async function createNewFavoriteFromShot(shot) {
  const snapshot = createFavoriteSnapshot(shot, { forceNew: true });
  state.favorites.push(snapshot);
  shot.linkedFavoriteId = snapshot.id;
  await persistState("已新建收藏。");
  render();
}

function createFavoriteSnapshot(shot, options = {}) {
  const { forceNew = false } = options;
  const existing = forceNew
    ? null
    : state.favorites.find((item) => item.id === shot.linkedFavoriteId || item.shotId === shot.id);
  return {
    id: existing?.id || crypto.randomUUID(),
    shotId: existing?.shotId || shot.id,
    title: shot.title,
    directorNotes: shot.directorNotes,
    references: structuredClone(shot.references || []),
    videoConfig: structuredClone(shot.videoConfig || createDefaultVideoConfig()),
    currentPrompt: shot.currentPrompt,
    promptHistory: structuredClone(shot.promptHistory || []),
    chatHistory: structuredClone(shot.chatHistory || []),
    videoHistory: structuredClone(shot.videoHistory || []),
    tags: structuredClone(existing?.tags || []),
    favoritedAt: new Date().toISOString(),
    updatedAt: shot.updatedAt || new Date().toISOString(),
  };
}

function getFilteredFavorites() {
  const term = uiState.favoriteSearchTerm;
  const favorites = [...state.favorites].sort((a, b) => new Date(b.favoritedAt) - new Date(a.favoritedAt));
  return favorites.filter((favorite) => {
    const historyText = (favorite.promptHistory || []).map((entry) => `${entry.label} ${entry.prompt}`).join("\n");
    const tagsText = (favorite.tags || []).join("\n");
    const referencesText = (favorite.references || []).map((ref) => ref.title || "").join("\n");
    const haystack = [
      favorite.title,
      favorite.directorNotes,
      favorite.currentPrompt,
      historyText,
      tagsText,
      referencesText,
    ].join("\n").toLowerCase();
    const matchTerm = !term || haystack.includes(term);
    const matchTag = !uiState.favoriteTagFilter || (favorite.tags || []).some((tag) => tag.toLowerCase() === uiState.favoriteTagFilter);
    return matchTerm && matchTag;
  });
}

async function moveFavoriteToWorkspace(favorite) {
  state.shots.push(createWorkspaceShotFromFavorite(favorite));
  await persistState("已移入工作台。");
  if (!elements.favoriteModal.hidden) {
    renderFavoriteModal(favorite);
  }
  render();
}

function createWorkspaceShotFromFavorite(favorite) {
  const shot = createShot();
  shot.title = favorite.title || "";
  shot.directorNotes = favorite.directorNotes || "";
  shot.linkedFavoriteId = favorite.id;
  shot.references = structuredClone(favorite.references || []);
  shot.videoConfig = normalizeShotVideoConfig(favorite.videoConfig);
  shot.currentPrompt = favorite.currentPrompt || "";
  shot.promptHistory = structuredClone(favorite.promptHistory || []);
  shot.chatHistory = structuredClone(favorite.chatHistory || []);
  shot.videoHistory = structuredClone(favorite.videoHistory || []);
  shot.updatedAt = new Date().toISOString();
  return shot;
}

function toggleFavoriteSelection(favoriteId, selected) {
  const selectedIds = new Set(uiState.selectedFavoriteIds);
  if (selected) {
    selectedIds.add(favoriteId);
  } else {
    selectedIds.delete(favoriteId);
  }
  uiState.selectedFavoriteIds = [...selectedIds];
}

function updateFavoriteBulkBar() {
  const visibleIds = getFilteredFavorites().map((favorite) => favorite.id);
  const selectedVisibleIds = visibleIds.filter((id) => uiState.selectedFavoriteIds.includes(id));
  const hasSelection = uiState.selectedFavoriteIds.length > 0;
  const isBatchMode = uiState.isFavoriteBatchMode;
  const isAllVisibleSelected = Boolean(visibleIds.length) && selectedVisibleIds.length === visibleIds.length;

  elements.favoritesSelectedCount.textContent = String(uiState.selectedFavoriteIds.length);
  elements.favoritesSelectAllButton.textContent = isAllVisibleSelected ? "清空选择" : "全选";
  elements.favoritesSelectAllButton.disabled = !isBatchMode || !visibleIds.length;
  elements.favoritesBulkTagsInput.disabled = !isBatchMode || !hasSelection;
  elements.favoritesBulkTagButton.disabled = !isBatchMode || !hasSelection;
  elements.favoritesBulkExportButton.disabled = !isBatchMode || !hasSelection;
  elements.favoritesBulkMoveButton.disabled = !isBatchMode || !hasSelection;
  elements.favoritesBulkDeleteButton.disabled = !isBatchMode || !hasSelection;
}

async function addTagsToFavorites(favoriteIds, rawValue) {
  const targetIds = [...new Set((favoriteIds || []).filter(Boolean))];
  if (!targetIds.length) {
    setStatus("请先选择收藏。");
    return;
  }

  const appendedTags = parseFavoriteTags(rawValue);
  if (!appendedTags.length) {
    setStatus("请输入要添加的标签。");
    return;
  }

  let changedCount = 0;
  targetIds.forEach((favoriteId) => {
    const target = state.favorites.find((item) => item.id === favoriteId);
    if (!target) {
      return;
    }

    const nextTags = [...new Set([...(target.tags || []), ...appendedTags])];
    const currentTags = target.tags || [];
    if (currentTags.join("|") === nextTags.join("|")) {
      return;
    }

    target.tags = nextTags;
    changedCount += 1;
  });

  if (!changedCount) {
    setStatus("所选收藏的标签没有变化。");
    return;
  }

  await persistState(`已为 ${changedCount} 个收藏更新标签。`);
  if (!elements.favoriteModal.hidden && uiState.selectedFavoriteId) {
    const activeFavorite = state.favorites.find((item) => item.id === uiState.selectedFavoriteId);
    if (activeFavorite) {
      renderFavoriteModal(activeFavorite);
    }
  }
  render();
}

async function moveFavoritesToWorkspaceBatch(favoriteIds) {
  const targets = [...new Set((favoriteIds || []).filter(Boolean))]
    .map((favoriteId) => state.favorites.find((item) => item.id === favoriteId))
    .filter(Boolean);

  if (!targets.length) {
    setStatus("请先选择收藏。");
    return;
  }

  targets.forEach((favorite) => {
    state.shots.push(createWorkspaceShotFromFavorite(favorite));
  });
  uiState.selectedFavoriteIds = [];
  uiState.isFavoriteBatchMode = false;
  await persistState(`已将 ${targets.length} 个收藏移入工作台。`);
  setCurrentView("workspace");
}

async function deleteFavoritesByIds(favoriteIds) {
  const targetIds = [...new Set((favoriteIds || []).filter(Boolean))];
  if (!targetIds.length) {
    setStatus("请先选择收藏。");
    return;
  }

  const confirmed = window.confirm(
    targetIds.length === 1
      ? "确认删除这个收藏吗？删除后无法恢复。"
      : `确认删除这 ${targetIds.length} 个收藏吗？删除后无法恢复。`,
  );
  if (!confirmed) {
    return;
  }

  const idSet = new Set(targetIds);
  const beforeCount = state.favorites.length;
  state.favorites = state.favorites.filter((item) => !idSet.has(item.id));
  const removedCount = beforeCount - state.favorites.length;

  if (!removedCount) {
    setStatus("未找到可删除的收藏。");
    return;
  }

  state.shots.forEach((shot) => {
    if (idSet.has(shot.linkedFavoriteId)) {
      shot.linkedFavoriteId = "";
    }
  });
  uiState.selectedFavoriteIds = uiState.selectedFavoriteIds.filter((id) => !idSet.has(id));
  if (!uiState.selectedFavoriteIds.length) {
    uiState.isFavoriteBatchMode = false;
  }
  if (uiState.selectedFavoriteId && idSet.has(uiState.selectedFavoriteId)) {
    uiState.selectedFavoriteId = null;
    closeFavoriteModal();
  }

  await persistState(removedCount === 1 ? "收藏已删除。" : `已删除 ${removedCount} 个收藏。`);
  render();
}

function updateSummary() {
  const historyTotal = state.shots.reduce((total, shot) => total + shot.promptHistory.length, 0);
  const chatTotal = state.shots.reduce((total, shot) => total + shot.chatHistory.length, 0);
  const favoriteHistoryTotal = state.favorites.reduce((total, favorite) => total + (favorite.promptHistory?.length || 0), 0);

  elements.shotCount.textContent = String(state.shots.length);
  elements.historyCount.textContent = String(historyTotal);
  elements.chatCount.textContent = String(chatTotal);
  elements.favoriteCount.textContent = String(state.favorites.length);
  elements.favoriteHistoryCount.textContent = String(favoriteHistoryTotal);
}

function openFavoriteModal(favoriteId) {
  const favorite = state.favorites.find((item) => item.id === favoriteId);
  if (!favorite) {
    return;
  }

  uiState.selectedFavoriteId = favoriteId;
  renderFavoriteModal(favorite);
  elements.favoriteModal.hidden = false;
  document.body.classList.add("lightbox-open");
}

function closeFavoriteModal() {
  elements.favoriteModal.hidden = true;
  elements.favoriteModalContent.innerHTML = "";
  document.body.classList.remove("lightbox-open");
}

function renderReferences(container, shot) {
  container.innerHTML = "";

  if (!shot.references.length) {
    return;
  }

  shot.references.forEach((ref, index) => {
    const item = document.createElement("div");
    item.className = "reference-item";

    let previewHtml = "";
    if (ref.mediaType === "image" && ref.url) {
      previewHtml = `<img class="reference-item-preview" src="${escapeHtml(ref.url)}" alt="${escapeHtml(ref.title || `参考图 ${index + 1}`)}">`;
    } else if (ref.mediaType === "video" && ref.url) {
      previewHtml = `<video class="reference-item-preview reference-video-preview" src="${escapeHtml(ref.url)}" preload="metadata"></video>`;
    } else if (ref.mediaType === "audio" && ref.url) {
      previewHtml = `<div class="reference-audio-preview"><span class="reference-audio-icon">♪</span></div>`;
    }

    const roleSelectHtml = ref.mediaType === "image" ? `
      <select class="reference-role-select">
        <option value=""${!ref.role ? " selected" : ""}>自动</option>
        <option value="first_frame"${ref.role === "first_frame" ? " selected" : ""}>首帧</option>
        <option value="last_frame"${ref.role === "last_frame" ? " selected" : ""}>尾帧</option>
        <option value="reference_image"${ref.role === "reference_image" ? " selected" : ""}>参考图</option>
      </select>
    ` : "";

    const titleHtml = ref.title ? `<span class="reference-item-title">${escapeHtml(ref.title)}</span>` : "";

    item.innerHTML = `
      <div class="reference-item-content">
        ${previewHtml}
        <div class="reference-item-meta">
          ${titleHtml}
          ${roleSelectHtml}
        </div>
      </div>
      <button class="ghost-button reference-delete-button danger" type="button" aria-label="删除参考素材">×</button>
    `;

    const roleSelect = item.querySelector(".reference-role-select");
    if (roleSelect) {
      roleSelect.addEventListener("change", (event) => {
        ref.role = event.target.value;
        shot.updatedAt = new Date().toISOString();
        queuePersistState("参考素材角色已更新。");
      });
    }

    item.querySelector(".reference-delete-button").addEventListener("click", async () => {
      shot.references = shot.references.filter((entry) => entry.id !== ref.id);
      shot.updatedAt = new Date().toISOString();
      await persistState("参考素材已删除。");
      render();
    });

    if (ref.mediaType === "image" && ref.url) {
      const preview = item.querySelector(".reference-item-preview");
      if (preview) {
        preview.addEventListener("click", () => {
          openLightbox(ref.url, ref.title || shot.title);
        });
        preview.style.cursor = "pointer";
      }
    }

    if (ref.mediaType === "video" && ref.url) {
      const videoPreview = item.querySelector(".reference-video-preview");
      if (videoPreview) {
        videoPreview.style.cursor = "pointer";
        videoPreview.addEventListener("click", () => {
          openLightbox(ref.url, ref.title || shot.title, "video");
        });
      }
    }

    if (ref.mediaType === "audio" && ref.url) {
      const audioContainer = item.querySelector(".reference-audio-preview");
      if (audioContainer) {
        audioContainer.style.cursor = "pointer";
        audioContainer.addEventListener("click", () => {
          openLightbox(ref.url, ref.title || shot.title, "audio");
        });
      }
    }

    container.append(item);
  });
}

function updateReferencesCapacity(capacityElement, shot) {
  const refs = shot.references || [];
  const imageCount = refs.filter((r) => r.mediaType === "image").length;
  const videoCount = refs.filter((r) => r.mediaType === "video").length;
  const audioCount = refs.filter((r) => r.mediaType === "audio").length;
  capacityElement.textContent = `图片 ${imageCount}/9 \u00b7 视频 ${videoCount}/3 \u00b7 音频 ${audioCount}/3`;
}

function bindReferencesUploadZone(uploadZone, uploadInput, shot) {
  uploadZone.addEventListener("click", () => {
    uploadInput.click();
  });

  uploadZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadZone.classList.add("drag-over");
  });

  uploadZone.addEventListener("dragenter", (event) => {
    event.preventDefault();
    uploadZone.classList.add("drag-over");
  });

  uploadZone.addEventListener("dragleave", (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    uploadZone.classList.remove("drag-over");
  });

  uploadZone.addEventListener("drop", async (event) => {
    event.preventDefault();
    uploadZone.classList.remove("drag-over");
    const files = Array.from(event.dataTransfer?.files || []);
    if (!files.length) {
      return;
    }

    try {
      await addReferencesFromFiles(shot, files);
      render();
    } catch (error) {
      reportRuntimeError(error, "拖拽上传参考素材失败。");
    }
  });

  uploadInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
      await addReferencesFromFiles(shot, files);
      render();
    } catch (error) {
      reportRuntimeError(error, "参考素材上传失败。");
    } finally {
      event.target.value = "";
    }
  });
}

async function addReferencesFromFiles(shot, files) {
  const refs = Array.isArray(shot.references) ? shot.references : [];
  const counts = {
    image: refs.filter((r) => r.mediaType === "image").length,
    video: refs.filter((r) => r.mediaType === "video").length,
    audio: refs.filter((r) => r.mediaType === "audio").length,
  };
  const limits = { image: 9, video: 3, audio: 3 };
  let addedCount = 0;

  for (const file of files) {
    let mediaType = "";
    if (file.type.startsWith("image/")) {
      mediaType = "image";
    } else if (file.type.startsWith("video/")) {
      mediaType = "video";
    } else if (file.type.startsWith("audio/")) {
      mediaType = "audio";
    } else {
      continue;
    }

    if (counts[mediaType] >= limits[mediaType]) {
      continue;
    }

    let url = "";
    const title = getNextReferenceName(mediaType, refs);
    if (mediaType === "image") {
      url = await optimizeImageFile(file);
    } else {
      url = await readFileAsDataUrl(file);
    }

    refs.push(createReference(mediaType, url, "", title));
    counts[mediaType] += 1;
    addedCount += 1;
  }

  shot.references = refs;
  shot.updatedAt = new Date().toISOString();
  await persistState(`已添加 ${addedCount} 个参考素材。`);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("读取文件失败。"));
    reader.readAsDataURL(file);
  });
}

function getNextReferenceName(mediaType, existingRefs) {
  const typeLabels = { image: "图片", video: "视频", audio: "音频" };
  const label = typeLabels[mediaType] || "参考";
  const pattern = new RegExp(`^${label}(\\d+)$`);
  let maxNum = 0;
  for (const ref of existingRefs) {
    const match = (ref.title || "").match(pattern);
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1], 10));
    }
  }
  return `${label}${maxNum + 1}`;
}

function bindMentionAutocomplete(textarea, shot) {
  textarea.addEventListener("input", () => {
    if (mentionJustSelected) {
      mentionJustSelected = false;
      return;
    }
    handleMentionInput(textarea, shot);
  });

  textarea.addEventListener("keydown", (e) => {
    if (mentionContext && mentionContext.textarea === textarea) {
      handleMentionKeydown(e);
    }
  });

  textarea.addEventListener("blur", () => {
    setTimeout(() => {
      if (mentionContext && mentionContext.textarea === textarea) {
        closeMentionDropdown();
      }
    }, 200);
  });
}

function handleMentionInput(textarea, shot) {
  const value = textarea.value;
  const cursorPos = textarea.selectionStart;
  const textBeforeCursor = value.substring(0, cursorPos);

  const atIndex = textBeforeCursor.lastIndexOf("@");
  if (atIndex < 0) {
    closeMentionDropdown();
    return;
  }

  if (atIndex > 0 && /[a-zA-Z0-9]/.test(textBeforeCursor[atIndex - 1])) {
    closeMentionDropdown();
    return;
  }

  const query = textBeforeCursor.substring(atIndex + 1);
  if (query.includes("\n") || query.length > 20) {
    closeMentionDropdown();
    return;
  }

  const refs = shot.references || [];
  const subjects = state.subjects || [];
  if (!refs.length && !subjects.length) {
    closeMentionDropdown();
    return;
  }

  const items = [
    ...refs.map((ref) => ({
      label: ref.title || ref.mediaType,
      mediaType: ref.mediaType,
      source: "ref",
    })),
    ...subjects.filter((s) => s.name).map((s) => ({
      label: s.name,
      mediaType: "image",
      source: "subject",
      subjectId: s.id,
    })),
  ];

  const queryLower = query.toLowerCase();
  const filtered = queryLower
    ? items.filter((item) => item.label.toLowerCase().includes(queryLower))
    : items;

  if (!filtered.length) {
    closeMentionDropdown();
    return;
  }

  showMentionDropdown(textarea, atIndex, filtered);
}

function showMentionDropdown(textarea, atPos, items) {
  const rect = textarea.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;

  mentionDropdown.style.position = "fixed";
  mentionDropdown.style.left = `${rect.left}px`;
  mentionDropdown.style.width = `${Math.min(rect.width, 260)}px`;

  if (spaceBelow < 220) {
    mentionDropdown.style.top = "auto";
    mentionDropdown.style.bottom = `${window.innerHeight - rect.top + 4}px`;
  } else {
    mentionDropdown.style.top = `${rect.bottom + 4}px`;
    mentionDropdown.style.bottom = "auto";
  }

  const typeIcons = { image: "图", video: "视频", audio: "音频" };
  mentionDropdown.innerHTML = items.map((item, i) => {
    const sourceLabel = item.source === "subject" ? "主体" : (typeIcons[item.mediaType] || "");
    return `<div class="mention-item${i === 0 ? " is-active" : ""}" data-index="${i}">
      <span class="mention-item-type">${sourceLabel}</span>
      <span>${escapeHtml(item.label)}</span>
    </div>`;
  }).join("");

  mentionDropdown.hidden = false;
  mentionContext = { textarea, startPos: atPos, items, activeIndex: 0 };

  mentionDropdown.querySelectorAll(".mention-item").forEach((el, i) => {
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectMentionItem(i);
    });
  });
}

function handleMentionKeydown(e) {
  if (!mentionContext) {
    return;
  }

  const { items, activeIndex } = mentionContext;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    mentionContext.activeIndex = (activeIndex + 1) % items.length;
    updateMentionActiveItem();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    mentionContext.activeIndex = (activeIndex - 1 + items.length) % items.length;
    updateMentionActiveItem();
  } else if (e.key === "Enter" || e.key === "Tab") {
    e.preventDefault();
    selectMentionItem(mentionContext.activeIndex);
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeMentionDropdown();
  }
}

function updateMentionActiveItem() {
  if (!mentionContext) {
    return;
  }

  mentionDropdown.querySelectorAll(".mention-item").forEach((el, i) => {
    el.classList.toggle("is-active", i === mentionContext.activeIndex);
  });

  const activeEl = mentionDropdown.querySelector(".mention-item.is-active");
  if (activeEl) {
    activeEl.scrollIntoView({ block: "nearest" });
  }
}

function selectMentionItem(index) {
  if (!mentionContext) {
    return;
  }

  const { textarea, startPos, items } = mentionContext;
  const item = items[index];
  if (!item) {
    return;
  }

  const before = textarea.value.substring(0, startPos);
  const after = textarea.value.substring(textarea.selectionStart);
  const mention = `@${item.label}`;

  closeMentionDropdown();
  mentionJustSelected = true;

  textarea.value = before + mention + after;
  const newPos = startPos + mention.length;
  textarea.selectionStart = newPos;
  textarea.selectionEnd = newPos;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

function closeMentionDropdown() {
  mentionDropdown.hidden = true;
  mentionDropdown.innerHTML = "";
  mentionContext = null;
}

function openLightbox(src, title, mediaType) {
  elements.lightboxImage.hidden = true;
  elements.lightboxVideo.hidden = true;
  elements.lightboxAudio.hidden = true;
  elements.lightboxImage.src = "";
  elements.lightboxVideo.src = "";
  elements.lightboxAudio.src = "";

  if (mediaType === "video") {
    elements.lightboxVideo.src = src;
    elements.lightboxVideo.hidden = false;
  } else if (mediaType === "audio") {
    elements.lightboxAudio.src = src;
    elements.lightboxAudio.hidden = false;
  } else {
    elements.lightboxImage.src = src;
    elements.lightboxImage.alt = title ? `${title} 放大图` : "放大预览";
    elements.lightboxImage.hidden = false;
  }

  elements.lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  elements.lightbox.hidden = true;
  elements.lightboxImage.src = "";
  elements.lightboxVideo.pause();
  elements.lightboxVideo.src = "";
  elements.lightboxAudio.pause();
  elements.lightboxAudio.src = "";
  document.body.classList.remove("lightbox-open");
}

function renderHistory(container, shot) {
  container.innerHTML = "";

  if (!shot.promptHistory.length) {
    container.innerHTML = '<div class="empty-state">这个镜头还没有 Prompt归档。</div>';
    return;
  }

  const history = [...shot.promptHistory].reverse();
  history.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(entry.label)} · ${formatTime(entry.createdAt)}</strong>
        <div class="history-actions">
          <button class="ghost-button archive-rate-button" type="button">${renderArchiveStars(entry.rating || 0)}</button>
          <button class="ghost-button restore-history-button" type="button">恢复到当前</button>
        </div>
      </header>
      <p class="truncatable">${escapeHtml(entry.prompt)}</p>
    `;

    item.querySelector("p.truncatable").addEventListener("click", () => {
      item.classList.toggle("is-expanded");
    });

    item.querySelector(".archive-rate-button").addEventListener("click", async () => {
      entry.rating = getNextArchiveRating(entry.rating || 0);
      await persistState("Prompt归档星标已更新。");
      render();
    });

    item.querySelector(".restore-history-button").addEventListener("click", async () => {
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
    container.innerHTML = '<div class="empty-state">对当前 Prompt 提修改意见，让 AI 连续迭代。</div>';
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

function renderArchiveStars(rating) {
  return Number(rating) ? "★" : "☆";
}

function getNextArchiveRating(currentRating) {
  return Number(currentRating) ? 0 : 1;
}

function bindShotSortEvents(card, handle, shotId) {
  handle.draggable = true;

  handle.addEventListener("dragstart", (event) => {
    uiState.draggingShotId = shotId;
    card.classList.add("sorting");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", shotId);
  });

  handle.addEventListener("dragend", () => {
    uiState.draggingShotId = null;
    clearSortStyles();
  });

  card.addEventListener("dragover", (event) => {
    if (!uiState.draggingShotId || uiState.draggingShotId === shotId) {
      return;
    }

    event.preventDefault();
    card.classList.add("drop-target");
  });

  card.addEventListener("dragleave", (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    card.classList.remove("drop-target");
  });

  card.addEventListener("drop", async (event) => {
    event.preventDefault();
    card.classList.remove("drop-target");

    const sourceId = uiState.draggingShotId || event.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === shotId) {
      return;
    }

    await reorderShots(sourceId, shotId);
  });
}

async function handleGeneratePrompt(shotId, button) {
  const shot = getShotById(shotId);
  if (!shot) {
    return;
  }

  if (!getCurrentApiKey()) {
    setShotStatus(shotId, `请先填写 ${getCurrentProviderConfig().apiKeyLabel}。`);
    return;
  }

  const imageDataUrls = getShotReferenceImages(shot);
  if (!imageDataUrls.length) {
    setShotStatus(shotId, "请先为这个镜头上传图片。");
    return;
  }

  const originalLabel = button.textContent;

  try {
    setButtonLoading(button, "生成中...");
    const output = await requestPromptFromProvider({
      instruction: buildGenerationInstruction(shot),
      imageDataUrls,
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
    setShotStatus(shotId, error.message || "生成 Prompt 失败。");
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

async function handleBatchGenerate(button) {
  if (!getCurrentApiKey()) {
    setStatus(`请先填写 ${getCurrentProviderConfig().apiKeyLabel}。`);
    return;
  }

  const mode = elements.batchMode.value || "empty";
  if (mode === "all") {
    const confirmed = window.confirm("这会重写所有有图镜头的当前 Prompt，并把旧版本归档，是否继续？");
    if (!confirmed) {
      return;
    }
  }

  const activeSceneId = getActiveSceneId();
  const targets = state.shots.filter((shot) => {
    if (shot.sceneId !== activeSceneId) {
      return false;
    }
    if (!getShotReferenceImages(shot).length) {
      return false;
    }

    if (mode === "all") {
      return true;
    }

    return !shot.currentPrompt.trim();
  });

  if (!targets.length) {
    setStatus(mode === "all" ? "没有可批量重写的有图镜头。" : "没有可批量生成的空 Prompt 镜头。");
    return;
  }

  const originalLabel = button.textContent;
  let successCount = 0;

  try {
    setButtonLoading(button, `批量生成中 0/${targets.length}`);
    for (const [index, shot] of targets.entries()) {
      setButtonLoading(button, `批量生成中 ${index + 1}/${targets.length}`);
      try {
        const output = await requestPromptFromProvider({
          instruction: buildGenerationInstruction(shot),
          imageDataUrls: getShotReferenceImages(shot),
        });

        if (shot.currentPrompt.trim()) {
          archiveCurrentPrompt(shot);
        }

        shot.currentPrompt = output;
        shot.updatedAt = new Date().toISOString();
        pushHistoryEntry(shot, output, "批量 AI 生成");
        shot.chatHistory.push(createChatEntry("assistant", `批量生成结果：\n${output}`));
        successCount += 1;
        render();
      } catch (error) {
        shot.chatHistory.push(createChatEntry("assistant", `批量生成失败：${error.message || "未知错误"}`));
      }
    }

    await persistState(`批量生成完成，成功 ${successCount}/${targets.length} 个镜头。`);
    render();
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

async function handleRevisePrompt(shotId, feedback, feedbackInput, button) {
  const shot = getShotById(shotId);
  if (!shot) {
    return;
  }

  if (!getCurrentApiKey()) {
    setShotStatus(shotId, `请先填写 ${getCurrentProviderConfig().apiKeyLabel}。`);
    return;
  }

  if (!feedback) {
    setShotStatus(shotId, "请先写下修改要求。");
    return;
  }

  const originalLabel = button.textContent;

  try {
    setButtonLoading(button, "修改中...");
    shot.chatHistory.push(createChatEntry("user", feedback));

    const output = await requestPromptFromProvider({
      instruction: buildRevisionInstruction(shot, feedback),
      imageDataUrls: getShotReferenceImages(shot),
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
    setShotStatus(shotId, error.message || "修改 Prompt 失败。");
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

async function handleGenerateVideo(shotId, button) {
  const shot = getShotById(shotId);
  if (!shot) {
    return;
  }

  const prompt = shot.currentPrompt.trim();
  if (!prompt) {
    setShotStatus(shotId, "请先生成或填写当前 Prompt，再提交视频任务。");
    return;
  }

  const originalLabel = button.textContent;
  const payload = buildVideoGenerationPayload(shot);

  try {
    setButtonLoading(button, "提交任务中...");
    stopVideoPolling(shot.id);

    const apiKey = getCurrentVideoApiKey();
    let taskId = "";
    let taskStatus = "queued";
    let origin = "";
    let requestSummary = "";

    if (apiKey) {
      const result = await submitVideoTaskDirect(apiKey, payload);
      taskId = result.taskId;
      taskStatus = result.status;
      origin = "volcengine-ark-direct";
      requestSummary = summarizeVideoPayload(payload);
    } else {
      const response = await fetch(VIDEO_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: normalizeVideoProvider(state.settings.videoProvider),
          ...payload,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `视频任务提交失败（${response.status}）`);
      }
      taskId = String(result.taskId || "");
      taskStatus = normalizeVideoStatus(result.status || "queued");
      origin = result.origin || "";
      requestSummary = result.requestSummary || summarizeVideoPayload(payload);
    }

    shot.videoTask = {
      id: taskId,
      status: normalizeVideoStatus(taskStatus),
      videoUrl: "",
      coverImageUrl: "",
      lastFrameUrl: "",
      error: "",
      origin,
      requestSummary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    shot.updatedAt = new Date().toISOString();
    await persistState("视频任务已提交，正在轮询结果。");
    render();
    startVideoPolling(shot.id);
  } catch (error) {
    setShotStatus(shotId, error.message || "提交视频任务失败。");
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

async function submitVideoTaskDirect(apiKey, payload) {
  const provider = normalizeVideoProvider(state.settings.videoProvider);
  const baseUrl = String(provider.baseUrl || DEFAULT_VIDEO_BASE_URL).replace(/\/+$/, "");
  const body = {
    model: provider.model || payload.model,
    content: payload.content,
    ratio: payload.ratio,
    duration: payload.duration,
    resolution: payload.resolution,
    seed: payload.seed,
    generate_audio: payload.generate_audio,
    camera_fixed: payload.camera_fixed,
    watermark: payload.watermark,
    return_last_frame: payload.return_last_frame,
  };

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined || body[key] === "") {
      delete body[key];
    }
  });

  const response = await fetch(`${baseUrl}/contents/generations/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = result?.error?.message || result?.message || `视频任务提交失败（${response.status}）`;
    throw new Error(errorMsg);
  }

  const taskId = String(result?.id || result?.task_id || result?.data?.id || result?.data?.task_id || "").trim();
  if (!taskId) {
    throw new Error("视频任务已提交，但响应里没有返回任务 ID。");
  }

  return {
    taskId,
    status: result?.status || "queued",
  };
}

async function handleRefreshVideoTask(shotId, button) {
  const shot = getShotById(shotId);
  if (!shot?.videoTask?.id) {
    setShotStatus(shotId, "这个镜头还没有已提交的视频任务。");
    return;
  }

  const originalLabel = button.textContent;
  try {
    setButtonLoading(button, "刷新中...");
    await refreshVideoTaskStatus(shotId, { silent: false });
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

function buildVideoGenerationPayload(shot) {
  const prompt = shot.currentPrompt.trim();
  const videoConfig = normalizeShotVideoConfig(shot.videoConfig);
  const content = [
    {
      type: "text",
      text: prompt,
    },
  ];

  for (const ref of (shot.references || [])) {
    if (ref.mediaType === "image" && ref.url) {
      content.push({
        type: "image_url",
        image_url: { url: ref.url },
        role: ref.role || "reference_image",
      });
    } else if (ref.mediaType === "video" && ref.url) {
      content.push({
        type: "video_url",
        video_url: { url: ref.url },
        role: "reference_video",
      });
    } else if (ref.mediaType === "audio" && ref.url) {
      content.push({
        type: "audio_url",
        audio_url: { url: ref.url },
        role: "reference_audio",
      });
    }
  }

  const mentionedSubjects = getPromptMentionedSubjects(prompt);
  for (const subject of mentionedSubjects) {
    if (subject.imageDataUrl) {
      content.push({
        type: "image_url",
        image_url: { url: subject.imageDataUrl },
        role: "reference_image",
      });
    }
  }

  return {
    model: normalizeVideoProvider(state.settings.videoProvider).model,
    content,
    ratio: videoConfig.ratio,
    duration: videoConfig.duration,
    resolution: videoConfig.resolution || undefined,
    seed: videoConfig.seed,
    generate_audio: videoConfig.generateAudio !== false,
    camera_fixed: Boolean(videoConfig.cameraFixed),
    watermark: Boolean(videoConfig.watermark),
    return_last_frame: Boolean(videoConfig.returnLastFrame),
  };
}

function getPromptMentionedSubjects(prompt) {
  const subjects = state.subjects || [];
  if (!subjects.length || !prompt) return [];
  const mentioned = [];
  const seen = new Set();
  for (const subject of subjects) {
    if (!subject.name || !subject.imageDataUrl) continue;
    if (prompt.includes(`@${subject.name}`) && !seen.has(subject.id)) {
      mentioned.push(subject);
      seen.add(subject.id);
    }
  }
  return mentioned;
}

function summarizeVideoPayload(payload) {
  const contentItems = Array.isArray(payload.content) ? payload.content : [];
  const imageCount = contentItems.filter((c) => c.type === "image_url").length;
  const videoCount = contentItems.filter((c) => c.type === "video_url").length;
  const audioCount = contentItems.filter((c) => c.type === "audio_url").length;
  const refParts = [];
  if (imageCount) refParts.push(`${imageCount}张图`);
  if (videoCount) refParts.push(`${videoCount}个视频`);
  if (audioCount) refParts.push(`${audioCount}个音频`);
  return [
    refParts.length ? `参考素材 ${refParts.join("+")}` : "",
    payload.ratio ? `比例 ${payload.ratio}` : "",
    payload.duration ? `时长 ${payload.duration}s` : "",
    payload.resolution ? `分辨率 ${payload.resolution}` : "",
    payload.generate_audio === false ? "无声" : "有声",
    payload.camera_fixed ? "固定镜头" : "",
  ].filter(Boolean).join(" · ");
}

async function refreshVideoTaskStatus(shotId, options = {}) {
  const { silent = true } = options;
  const shot = getShotById(shotId);
  if (!shot?.videoTask?.id) {
    return;
  }

  try {
    const apiKey = getCurrentVideoApiKey();
    let result;

    if (apiKey) {
      result = await queryVideoTaskDirect(apiKey, shot.videoTask.id);
    } else {
      const response = await fetch(`${VIDEO_BASE_URL}/${encodeURIComponent(shot.videoTask.id)}?baseUrl=${encodeURIComponent(normalizeVideoProvider(state.settings.videoProvider).baseUrl)}`, {
        headers: { "x-video-api-key": "" },
      });
      result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `获取视频任务状态失败（${response.status}）`);
      }
    }

    const nextStatus = normalizeVideoStatus(result.status || shot.videoTask.status);
    shot.videoTask = {
      ...shot.videoTask,
      status: nextStatus,
      videoUrl: String(result.videoUrl || shot.videoTask.videoUrl || ""),
      coverImageUrl: String(result.coverImageUrl || shot.videoTask.coverImageUrl || ""),
      lastFrameUrl: String(result.lastFrameUrl || shot.videoTask.lastFrameUrl || ""),
      error: String(result.error || ""),
      updatedAt: new Date().toISOString(),
    };
    shot.updatedAt = new Date().toISOString();

    if (isVideoTaskFinished(nextStatus)) {
      stopVideoPolling(shotId);
      if (nextStatus === "succeeded") {
        archiveVideoResult(shot);
      }
    }

    await persistState(result.message || getVideoStatusMessage(nextStatus));
    updateShotVideoUI(shotId);

    if (nextStatus === "succeeded") {
      autoSaveShotVideoToLocal(shot);
    }
  } catch (error) {
    stopVideoPolling(shotId);
    shot.videoTask = {
      ...(shot.videoTask || {}),
      status: "failed",
      error: error.message || "获取视频任务状态失败。",
      updatedAt: new Date().toISOString(),
    };
    await persistState("视频任务状态刷新失败。");
    updateShotVideoUI(shotId);
    if (!silent) {
      setShotStatus(shotId, error.message || "获取视频任务状态失败。");
    }
  }
}

async function queryVideoTaskDirect(apiKey, taskId) {
  const provider = normalizeVideoProvider(state.settings.videoProvider);
  const baseUrl = String(provider.baseUrl || DEFAULT_VIDEO_BASE_URL).replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/contents/generations/tasks/${encodeURIComponent(taskId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = payload?.error?.message || payload?.message || `获取视频任务状态失败（${response.status}）`;
    throw new Error(errorMsg);
  }

  const content = payload?.content || payload?.data?.content || payload?.output || payload?.result || {};
  const pickFirst = (...values) => {
    for (const v of values) {
      if (typeof v === "string" && v.trim()) return v.trim();
      if (Array.isArray(v)) { const f = v.find((i) => typeof i === "string" && i.trim()); if (f) return f.trim(); }
    }
    return "";
  };

  return {
    status: payload?.status || payload?.state || payload?.data?.status || "",
    videoUrl: pickFirst(content?.video_url, content?.video_urls, payload?.video_url, payload?.video_urls, payload?.output?.video_url, payload?.result?.video_url),
    coverImageUrl: pickFirst(content?.cover_image_url, content?.cover_url, payload?.cover_image_url),
    lastFrameUrl: pickFirst(content?.last_frame_url, payload?.last_frame_url),
    error: pickFirst(payload?.error?.message, payload?.message, payload?.error_message),
    message: (payload?.status === "succeeded" || payload?.status === "done") ? "视频已生成完成。" : "视频任务状态已刷新。",
  };
}

function startVideoPolling(shotId) {
  stopVideoPolling(shotId);
  const timerId = window.setInterval(async () => {
    const shot = getShotById(shotId);
    if (!shot?.videoTask?.id || isVideoTaskFinished(shot.videoTask.status)) {
      stopVideoPolling(shotId);
      return;
    }

    await refreshVideoTaskStatus(shotId);
  }, VIDEO_POLL_INTERVAL_MS);
  videoPollTimers.set(shotId, timerId);
}

function stopVideoPolling(shotId) {
  const timerId = videoPollTimers.get(shotId);
  if (!timerId) {
    return;
  }

  window.clearInterval(timerId);
  videoPollTimers.delete(shotId);
}

function stopAllVideoPolling() {
  Array.from(videoPollTimers.keys()).forEach((shotId) => {
    stopVideoPolling(shotId);
  });
}

function resumePendingVideoTasks() {
  state.shots.forEach((shot) => {
    const status = normalizeVideoStatus(shot.videoTask?.status);
    if (shot.videoTask?.id && ["queued", "running"].includes(status)) {
      startVideoPolling(shot.id);
    }
  });
}

function clearVideoTaskState(shot) {
  if (!shot) {
    return;
  }

  stopVideoPolling(shot.id);
  shot.videoTask = createEmptyVideoTask();
  shot.updatedAt = new Date().toISOString();
}

function buildGenerationInstruction(shot) {
  const currentPrompt = shot.currentPrompt.trim();
  const direction = state.settings.globalDirection.trim();
  const directorNotes = (shot.directorNotes || "").trim();
  const title = shot.title.trim() || "未命名镜头";
  const refCount = (shot.references || []).length;

  return [
    "你是专业的视频生成提示词导演。",
    "请基于输入图片，输出一段高质量中文视频生成 Prompt。",
    "要求：",
    "1. 直接输出最终 Prompt，不要解释",
    "2. 包含运镜、主体、动作、镜头语言、氛围",
    "3. 风格要适合图生视频模型，文字具体、可执行、画面感强",
    `镜头标题：${title}`,
    directorNotes ? `导演讲戏：${directorNotes}` : "",
    direction ? `全局风格备注：${direction}` : "",
    refCount > 0 ? `附带了 ${refCount} 个参考素材。` : "",
    currentPrompt ? `用户已有草稿，请在保留有用意图的前提下重写提升：${currentPrompt}` : "用户暂未提供草稿，请直接从图片生成。",
  ].filter(Boolean).join("\n");
}

function buildRevisionInstruction(shot, feedback) {
  const title = shot.title.trim() || "未命名镜头";
  const direction = state.settings.globalDirection.trim();
  const directorNotes = (shot.directorNotes || "").trim();
  const currentPrompt = shot.currentPrompt.trim();
  const refCount = (shot.references || []).length;

  return [
    "你是专业的视频生成提示词导演。",
    "请严格基于用户当前正在使用的 Prompt 进行修改。",
    "要求：",
    "1. 只输出修改后的最终 Prompt，不要解释。",
    "2. 必须把“当前 Prompt”视为唯一修改基线，不要回退到更早版本，也不要优先参考你之前生成过的 Prompt。",
    "3. 即使当前 Prompt 是用户手写的，也要在保留其核心意图的前提下精准修改。",
    "4. 如果输入图片存在，可继续结合图片修正画面细节。",
    `镜头标题：${title}`,
    directorNotes ? `导演讲戏：${directorNotes}` : "",
    direction ? `全局风格备注：${direction}` : "",
    refCount > 0 ? `附带了 ${refCount} 个参考素材。` : "",
    `当前 Prompt：${currentPrompt || "暂无"}`,
    `用户本次反馈：${feedback}`,
  ].filter(Boolean).join("\n");
}

async function requestPromptFromProvider({ instruction, imageDataUrls }) {
  const provider = getCurrentProviderConfig();
  if (provider.requestMode === "gemini") {
    return requestPromptFromGemini({ instruction, imageDataUrls, provider });
  }

  if (provider.requestMode === "openai" || provider.requestMode === "responses" || provider.requestMode === "chat_completions") {
    if (!provider.baseUrl) {
      throw new Error(`请先填写 ${provider.label} 的 Base URL。`);
    }
    return requestPromptFromOpenAI({ instruction, imageDataUrls, provider });
  }

  throw new Error(`暂不支持 ${provider.label}。`);
}

async function requestPromptFromGemini({ instruction, imageDataUrls, provider }) {
  const model = encodeURIComponent(state.settings.model || provider.defaultModel);
  const apiKey = getCurrentApiKey();
  const parts = [];

  (imageDataUrls || []).forEach((imageDataUrl) => {
    const { mimeType, data } = parseDataUrl(imageDataUrl);
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data,
      },
    });
  });

  parts.push({
    text: instruction,
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: SYSTEM_PROMPT,
          },
        ],
      },
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        temperature: provider.temperature ?? 0.4,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini 请求失败（${response.status}）`);
  }

  const text = extractGeminiText(payload);
  if (!text) {
    throw new Error("模型返回为空，未生成 Prompt。");
  }

  return text;
}

async function requestPromptFromOpenAI({ instruction, imageDataUrls, provider }) {
  const model = state.settings.model || provider.defaultModel;
  const apiKey = getCurrentApiKey();

  if (provider.requestMode === "chat_completions") {
    return requestPromptFromOpenAIChatCompletions({ instruction, imageDataUrls, provider, model, apiKey });
  }

  return requestPromptFromOpenAIResponses({ instruction, imageDataUrls, provider, model, apiKey });
}

async function requestPromptFromOpenAIResponses({ instruction, imageDataUrls, provider, model, apiKey }) {
  const content = [];

  (imageDataUrls || []).forEach((imageDataUrl) => {
    content.push({
      type: "input_image",
      image_url: imageDataUrl,
    });
  });

  content.push({
    type: "input_text",
    text: instruction,
  });

  const response = await fetch(`${provider.baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: SYSTEM_PROMPT,
            },
          ],
        },
        {
          role: "user",
          content,
        },
      ],
      temperature: provider.temperature ?? 0.4,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenAI 请求失败（${response.status}）`);
  }

  const text = extractOpenAIResponseText(payload);
  if (!text) {
    throw new Error("模型返回为空，未生成 Prompt。");
  }

  return text;
}

async function requestPromptFromOpenAIChatCompletions({ instruction, imageDataUrls, provider, model, apiKey }) {
  const content = [];

  (imageDataUrls || []).forEach((imageDataUrl) => {
    content.push({
      type: "image_url",
      image_url: {
        url: imageDataUrl,
      },
    });
  });

  content.push({
    type: "text",
    text: instruction,
  });

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content,
        },
      ],
      temperature: provider.temperature ?? 0.4,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenAI 兼容请求失败（${response.status}）`);
  }

  const text = extractOpenAIChatCompletionText(payload);
  if (!text) {
    throw new Error("模型返回为空，未生成 Prompt。");
  }

  return text;
}

function extractGeminiText(payload) {
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts)) {
      continue;
    }

    const text = parts
      .map((part) => part?.text || "")
      .join("\n")
      .trim();

    if (text) {
      return text;
    }
  }

  return "";
}

function extractOpenAIResponseText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    const text = content
      .map((entry) => entry?.text || "")
      .join("\n")
      .trim();

    if (text) {
      return text;
    }
  }

  return "";
}

function extractOpenAIChatCompletionText(payload) {
  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  for (const choice of choices) {
    const content = choice?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }

    if (Array.isArray(content)) {
      const text = content
        .map((entry) => entry?.text || "")
        .join("\n")
        .trim();
      if (text) {
        return text;
      }
    }
  }

  return "";
}


function parseDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:(.+?);base64,(.+)$/);
  if (!match) {
    throw new Error("图片数据格式无效。");
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
}

async function insertShotAt(index, sceneId) {
  const targetSceneId = sceneId || getActiveSceneId();
  state.shots.splice(index, 0, createShot(targetSceneId));
  await persistState("已插入新镜头。");
  render();
}

async function insertShotRelative(anchorShotId, offset) {
  const idx = state.shots.findIndex((s) => s.id === anchorShotId);
  if (idx === -1) return;
  const anchorScene = state.shots[idx].sceneId;
  await insertShotAt(idx + offset, anchorScene);
}

async function reorderShots(sourceId, targetId) {
  const sourceIndex = state.shots.findIndex((shot) => shot.id === sourceId);
  const targetIndex = state.shots.findIndex((shot) => shot.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    clearSortStyles();
    return;
  }

  const [movedShot] = state.shots.splice(sourceIndex, 1);
  const insertionIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  state.shots.splice(insertionIndex, 0, movedShot);
  clearSortStyles();
  await persistState("镜头顺序已更新。");
  render();
}

function clearSortStyles() {
  document.querySelectorAll(".shot-card.sorting, .shot-card.drop-target").forEach((card) => {
    card.classList.remove("sorting", "drop-target");
  });
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

function createShot(sceneId) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    sceneId: sceneId || getActiveSceneId(),
    linkedFavoriteId: "",
    title: "",
    directorNotes: "",
    references: [],
    videoConfig: createDefaultVideoConfig(),
    videoTask: createEmptyVideoTask(),
    currentPrompt: "",
    promptHistory: [],
    chatHistory: [],
    videoHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

function createScene(name) {
  const now = new Date().toISOString();
  return {
    id: `scene-${crypto.randomUUID()}`,
    name: String(name || "新场次").trim() || "新场次",
    order: (state.scenes?.length || 0),
    createdAt: now,
    updatedAt: now,
  };
}

function getActiveSceneId() {
  if (state.currentSceneId && (state.scenes || []).some((s) => s.id === state.currentSceneId)) {
    return state.currentSceneId;
  }
  return (state.scenes && state.scenes[0]?.id) || DEFAULT_SCENE_ID;
}

function getSceneById(id) {
  return (state.scenes || []).find((s) => s.id === id) || null;
}

function getShotsInScene(sceneId) {
  return state.shots.filter((shot) => shot.sceneId === sceneId);
}

function normalizeScene(input, order) {
  const now = new Date().toISOString();
  return {
    id: String(input?.id || `scene-${crypto.randomUUID()}`),
    name: String(input?.name || "").trim() || "新场次",
    order: Number.isFinite(Number(input?.order)) ? Number(input.order) : Number(order) || 0,
    createdAt: String(input?.createdAt || now),
    updatedAt: String(input?.updatedAt || now),
  };
}

async function addScene() {
  const name = (prompt("新场次名称：", `场次 ${(state.scenes || []).length + 1}`) || "").trim();
  if (!name) return;
  const scene = createScene(name);
  state.scenes.push(scene);
  state.scenes.sort((a, b) => (a.order || 0) - (b.order || 0));
  state.currentSceneId = scene.id;
  await persistState(`已新建场次「${scene.name}」。`);
  render();
}

async function renameScene(sceneId) {
  const scene = getSceneById(sceneId);
  if (!scene) return;
  const next = (prompt("重命名场次：", scene.name) || "").trim();
  if (!next || next === scene.name) return;
  scene.name = next;
  scene.updatedAt = new Date().toISOString();
  await persistState("场次已重命名。");
  render();
}

async function deleteScene(sceneId) {
  const scene = getSceneById(sceneId);
  if (!scene) return;
  const remaining = state.scenes.filter((s) => s.id !== sceneId);
  if (!remaining.length) {
    setStatus("至少保留一个场次。");
    return;
  }
  const shotsInScene = getShotsInScene(sceneId);
  let fallbackId = remaining[0].id;
  if (shotsInScene.length) {
    let defaultScene = state.scenes.find((s) => s.id === DEFAULT_SCENE_ID);
    if (!defaultScene) {
      defaultScene = normalizeScene({ id: DEFAULT_SCENE_ID, name: DEFAULT_SCENE_NAME }, state.scenes.length);
      state.scenes.push(defaultScene);
    }
    fallbackId = defaultScene.id;
    const confirmText = `场次「${scene.name}」里还有 ${shotsInScene.length} 个镜头，删除后会全部移到「${defaultScene.name}」。确认删除？`;
    if (!confirm(confirmText)) return;
    shotsInScene.forEach((shot) => { shot.sceneId = fallbackId; });
  } else {
    if (!confirm(`删除场次「${scene.name}」？`)) return;
  }
  state.scenes = state.scenes.filter((s) => s.id !== sceneId);
  state.scenes.sort((a, b) => (a.order || 0) - (b.order || 0));
  state.scenes.forEach((s, i) => { s.order = i; });
  if (state.currentSceneId === sceneId) {
    state.currentSceneId = fallbackId;
  }
  await persistState(`已删除场次「${scene.name}」。`);
  render();
}

async function setCurrentScene(sceneId) {
  if (state.currentSceneId === sceneId) return;
  state.currentSceneId = sceneId;
  uiState.shotJumpQuery = "";
  if (elements.shotJumpInput) elements.shotJumpInput.value = "";
  await persistState(`已切换到场次「${getSceneById(sceneId)?.name || ""}」。`);
  render();
}

async function moveShotToScene(shotId, sceneId) {
  const shot = getShotById(shotId);
  if (!shot) return;
  if (!getSceneById(sceneId)) return;
  if (shot.sceneId === sceneId) return;
  shot.sceneId = sceneId;
  shot.updatedAt = new Date().toISOString();
  await persistState(`镜头已移到「${getSceneById(sceneId).name}」。`);
  render();
}

function setShotCollapsed(shotId, collapsed) {
  if (collapsed) {
    uiState.collapsedShotIds.add(shotId);
  } else {
    uiState.collapsedShotIds.delete(shotId);
  }
  const card = document.querySelector(`.shot-card[data-shot-id="${shotId}"]`);
  if (card) {
    card.dataset.collapsed = collapsed ? "true" : "false";
    const btn = card.querySelector(".shot-collapse-button");
    if (btn) btn.textContent = collapsed ? "展开" : "折叠";
  }
}

function setAllShotsCollapsed(collapsed) {
  const sceneId = getActiveSceneId();
  getShotsInScene(sceneId).forEach((shot) => setShotCollapsed(shot.id, collapsed));
}

function toggleSidebar() {
  uiState.sidebarCollapsed = !uiState.sidebarCollapsed;
  document.body.dataset.sidebarCollapsed = uiState.sidebarCollapsed ? "true" : "false";
  elements.shotSidebar.classList.toggle("is-collapsed", uiState.sidebarCollapsed);
  elements.shotSidebarToggleButton.textContent = uiState.sidebarCollapsed ? "显示目录" : "隐藏目录";
}

function matchesJumpQuery(shot, index, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const asNumber = Number.parseInt(q, 10);
  if (Number.isFinite(asNumber) && String(asNumber) === q) {
    return index + 1 === asNumber;
  }
  const title = String(shot.title || "").toLowerCase();
  const notes = String(shot.directorNotes || "").toLowerCase();
  return title.includes(q) || notes.includes(q);
}

function jumpToShot(shotId) {
  const card = document.querySelector(`.shot-card[data-shot-id="${shotId}"]`);
  if (!card) return;
  if (uiState.collapsedShotIds.has(shotId)) {
    setShotCollapsed(shotId, false);
  }
  card.scrollIntoView({ behavior: "smooth", block: "start" });
  card.classList.add("is-jump-highlight");
  setTimeout(() => card.classList.remove("is-jump-highlight"), 1400);
}

function createReference(mediaType, url, role, title) {
  return {
    id: crypto.randomUUID(),
    mediaType: mediaType || "image",
    url: url || "",
    role: role || "",
    title: title || "",
  };
}

async function createShotFromFile(file) {
  const shot = createShot();
  shot.title = file.name.replace(/\.[^.]+$/, "");
  const url = await optimizeImageFile(file);
  shot.references.push(createReference("image", url, "first_frame", "图片1"));
  return shot;
}

function createHistoryEntry(prompt, label) {
  return {
    id: crypto.randomUUID(),
    prompt,
    label,
    rating: 0,
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

function createDefaultVideoProvider() {
  return {
    baseUrl: DEFAULT_VIDEO_BASE_URL,
    model: DEFAULT_VIDEO_MODEL,
  };
}

function createDefaultVideoConfig() {
  return {
    ratio: "16:9",
    duration: 5,
    resolution: "",
    seed: null,
    generateAudio: true,
    cameraFixed: false,
    watermark: false,
    returnLastFrame: false,
  };
}

function createEmptyVideoTask() {
  return {
    id: "",
    status: "idle",
    videoUrl: "",
    coverImageUrl: "",
    lastFrameUrl: "",
    error: "",
    origin: "",
    requestSummary: "",
    createdAt: "",
    updatedAt: "",
    localFileName: "",
  };
}

function normalizeShotVideoConfig(input) {
  return {
    ...createDefaultVideoConfig(),
    ...(input || {}),
    ratio: String(input?.ratio || "16:9").trim() || "16:9",
    duration: clampVideoDuration(input?.duration),
    resolution: String(input?.resolution || "").trim(),
    seed: normalizeVideoSeed(input?.seed),
    generateAudio: input?.generateAudio !== false,
    cameraFixed: Boolean(input?.cameraFixed),
    watermark: Boolean(input?.watermark),
    returnLastFrame: Boolean(input?.returnLastFrame),
  };
}

function normalizeVideoTask(input) {
  return {
    ...createEmptyVideoTask(),
    ...(input || {}),
    id: String(input?.id || ""),
    status: normalizeVideoStatus(input?.status || "idle"),
    videoUrl: String(input?.videoUrl || ""),
    coverImageUrl: String(input?.coverImageUrl || ""),
    lastFrameUrl: String(input?.lastFrameUrl || ""),
    error: String(input?.error || ""),
    origin: String(input?.origin || ""),
    requestSummary: String(input?.requestSummary || ""),
    createdAt: String(input?.createdAt || ""),
    updatedAt: String(input?.updatedAt || ""),
    localFileName: String(input?.localFileName || ""),
  };
}

function normalizeVideoProvider(input) {
  const provider = {
    ...createDefaultVideoProvider(),
    ...(input || {}),
  };

  provider.baseUrl = String(provider.baseUrl || DEFAULT_VIDEO_BASE_URL).trim() || DEFAULT_VIDEO_BASE_URL;
  provider.model = String(provider.model || DEFAULT_VIDEO_MODEL).trim() || DEFAULT_VIDEO_MODEL;
  return provider;
}

function videoModelSupports1080p(model) {
  const normalized = String(model || "").toLowerCase();
  if (!normalized) return true;
  return !normalized.includes("fast");
}

function syncVideoResolutionOptions() {
  const model = normalizeVideoProvider(state.settings.videoProvider).model;
  const supports = videoModelSupports1080p(model);
  const selects = document.querySelectorAll(".shot-card .video-resolution");
  selects.forEach((select) => {
    const option = select.querySelector('option[value="1080p"]');
    if (!option) return;
    option.disabled = !supports;
    option.textContent = supports ? "1080p" : "1080p（当前模型不支持）";
    if (!supports && select.value === "1080p") {
      select.value = "720p";
      const card = select.closest(".shot-card");
      const shotId = card?.dataset.shotId;
      const shot = shotId ? getShotById(shotId) : null;
      if (shot) {
        shot.videoConfig.resolution = "720p";
        shot.updatedAt = new Date().toISOString();
      }
    }
  });
}

function isFileSystemAccessSupported() {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}

async function loadLocalVideoDirHandleFromIdb() {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, "readonly");
    const record = await requestResult(tx.objectStore(STORE_NAME).get(LOCAL_VIDEO_DIR_RECORD_KEY));
    return record?.handle || null;
  } catch (error) {
    console.error("读取本地视频目录句柄失败：", error);
    return null;
  }
}

async function persistLocalVideoDirHandleToIdb(handle) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put({ id: LOCAL_VIDEO_DIR_RECORD_KEY, handle });
  await transactionDone(tx);
}

async function clearLocalVideoDirHandleFromIdb() {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(LOCAL_VIDEO_DIR_RECORD_KEY);
  await transactionDone(tx);
}

async function initLocalVideoDir() {
  if (!isFileSystemAccessSupported()) {
    localVideoDirPermission = "unsupported";
    return;
  }
  localVideoDirHandle = await loadLocalVideoDirHandleFromIdb();
  if (!localVideoDirHandle) {
    localVideoDirPermission = "none";
    return;
  }
  try {
    const perm = await localVideoDirHandle.queryPermission({ mode: "readwrite" });
    localVideoDirPermission = perm; // "granted" | "prompt" | "denied"
  } catch (error) {
    console.error(error);
    localVideoDirPermission = "prompt";
  }
}

async function ensureLocalVideoDirPermission({ request = false } = {}) {
  if (!isFileSystemAccessSupported() || !localVideoDirHandle) {
    return false;
  }
  try {
    let perm = await localVideoDirHandle.queryPermission({ mode: "readwrite" });
    if (perm !== "granted" && request) {
      perm = await localVideoDirHandle.requestPermission({ mode: "readwrite" });
    }
    localVideoDirPermission = perm;
    return perm === "granted";
  } catch (error) {
    console.error(error);
    localVideoDirPermission = "prompt";
    return false;
  }
}

async function pickLocalVideoDirectory() {
  if (!isFileSystemAccessSupported()) {
    throw new Error("当前浏览器不支持 File System Access API，请改用 Chrome / Edge。");
  }
  const handle = await window.showDirectoryPicker({ id: "shot-prompt-local-videos", mode: "readwrite" });
  const perm = await handle.requestPermission({ mode: "readwrite" });
  if (perm !== "granted") {
    throw new Error("未获得目录的读写权限。");
  }
  localVideoDirHandle = handle;
  localVideoDirPermission = "granted";
  revokeAllLocalVideoObjectUrls();
  await persistLocalVideoDirHandleToIdb(handle);
}

async function clearLocalVideoDirectory() {
  localVideoDirHandle = null;
  localVideoDirPermission = isFileSystemAccessSupported() ? "none" : "unsupported";
  revokeAllLocalVideoObjectUrls();
  await clearLocalVideoDirHandleFromIdb();
}

function revokeAllLocalVideoObjectUrls() {
  localVideoObjectUrlCache.forEach((url) => {
    try { URL.revokeObjectURL(url); } catch {}
  });
  localVideoObjectUrlCache.clear();
}

function buildLocalVideoFilename(prefix, taskId, ext = "mp4") {
  const safePrefix = String(prefix || "video").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeTaskId = String(taskId || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const stamp = safeTaskId || Date.now().toString(36);
  return `${safePrefix}_${stamp}.${ext}`;
}

async function downloadVideoToLocalDir(remoteUrl, filename) {
  if (!localVideoDirHandle) {
    throw new Error("未设置本地视频目录。");
  }
  if (!remoteUrl) {
    throw new Error("缺少视频 URL。");
  }
  const proxied = `${PROXY_VIDEO_URL}?url=${encodeURIComponent(remoteUrl)}`;
  const response = await fetch(proxied);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `下载视频失败（${response.status}）`);
  }
  const blob = await response.blob();
  const fileHandle = await localVideoDirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
  return filename;
}

async function readLocalVideoObjectUrl(filename) {
  if (!filename) return "";
  if (localVideoObjectUrlCache.has(filename)) {
    return localVideoObjectUrlCache.get(filename);
  }
  if (!localVideoDirHandle) return "";
  try {
    const fileHandle = await localVideoDirHandle.getFileHandle(filename, { create: false });
    const file = await fileHandle.getFile();
    const url = URL.createObjectURL(file);
    localVideoObjectUrlCache.set(filename, url);
    return url;
  } catch {
    return "";
  }
}

function hydrateLocalVideoElements(root) {
  if (!root) return;
  if (!localVideoDirHandle || localVideoDirPermission !== "granted") return;
  const targets = root.querySelectorAll("video[data-local-filename]");
  targets.forEach(async (video) => {
    const filename = video.dataset.localFilename;
    if (!filename) return;
    const url = await readLocalVideoObjectUrl(filename);
    if (url && video.isConnected) {
      video.src = url;
    }
  });
}

async function autoSaveShotVideoToLocal(shot) {
  if (!shot?.videoTask?.videoUrl) return;
  if (!localVideoDirHandle) return;
  if (localVideoDirPermission !== "granted") return;
  if (shot.videoTask.localFileName) return;
  const key = `shot:${shot.id}:${shot.videoTask.id || shot.videoTask.videoUrl}`;
  if (pendingLocalVideoSaves.has(key)) return;
  pendingLocalVideoSaves.add(key);
  try {
    const filename = buildLocalVideoFilename("seedance", shot.videoTask.id);
    await downloadVideoToLocalDir(shot.videoTask.videoUrl, filename);
    shot.videoTask.localFileName = filename;
    const historyEntry = (shot.videoHistory || []).find((e) => e.taskId === shot.videoTask.id);
    if (historyEntry && !historyEntry.localFileName) {
      historyEntry.localFileName = filename;
    }
    shot.updatedAt = new Date().toISOString();
    await persistState("视频已保存到本地目录。");
    updateShotVideoUI(shot.id);
  } catch (error) {
    console.error(error);
    setStatus(`本地保存失败：${error.message || error}`);
  } finally {
    pendingLocalVideoSaves.delete(key);
  }
}

async function autoSaveEnhanceVideoToLocal(task) {
  if (!task?.videoUrl) return;
  if (!localVideoDirHandle) return;
  if (localVideoDirPermission !== "granted") return;
  if (task.localFileName) return;
  const key = `enhance:${task.id}:${task.taskId || task.videoUrl}`;
  if (pendingLocalVideoSaves.has(key)) return;
  pendingLocalVideoSaves.add(key);
  try {
    const filename = buildLocalVideoFilename("enhance", task.taskId);
    await downloadVideoToLocalDir(task.videoUrl, filename);
    task.localFileName = filename;
    task.updatedAt = new Date().toISOString();
    await persistState("增强视频已保存到本地目录。");
    renderEnhanceView();
  } catch (error) {
    console.error(error);
    setEnhanceStatus(`本地保存失败：${error.message || error}`);
  } finally {
    pendingLocalVideoSaves.delete(key);
  }
}

function describeLocalVideoDirStatus() {
  if (!isFileSystemAccessSupported()) {
    return { label: "当前浏览器不支持", hint: "请使用 Chrome / Edge 等基于 Chromium 的浏览器。", canPick: false };
  }
  if (!localVideoDirHandle) {
    return { label: "未设置", hint: "点击下方按钮选择一个用来保存生成视频的本地目录。", canPick: true };
  }
  const name = localVideoDirHandle.name || "已选择目录";
  if (localVideoDirPermission === "granted") {
    return { label: `已绑定：${name}`, hint: "视频生成成功后会自动保存到该目录。", canPick: true, canClear: true, canReauth: false };
  }
  return { label: `需要重新授权：${name}`, hint: "浏览器已记住目录，但当前会话需要你重新授权才能写入。", canPick: true, canClear: true, canReauth: true };
}

function createDefaultMediaKitProvider() {
  return {
    baseUrl: DEFAULT_ENHANCE_BASE_URL,
  };
}

function normalizeMediaKitProvider(input) {
  const provider = {
    ...createDefaultMediaKitProvider(),
    ...(input || {}),
  };
  provider.baseUrl = String(provider.baseUrl || DEFAULT_ENHANCE_BASE_URL).trim() || DEFAULT_ENHANCE_BASE_URL;
  return provider;
}

function getCurrentMediaKitApiKey() {
  return String(state.settings.mediaKitApiKey || "").trim();
}

function createDefaultUnderstandProvider() {
  return {
    baseUrl: DEFAULT_UNDERSTAND_BASE_URL,
    model: DEFAULT_UNDERSTAND_MODEL,
  };
}

function normalizeUnderstandProvider(input) {
  const provider = {
    ...createDefaultUnderstandProvider(),
    ...(input || {}),
  };
  provider.baseUrl = String(provider.baseUrl || DEFAULT_UNDERSTAND_BASE_URL).trim() || DEFAULT_UNDERSTAND_BASE_URL;
  provider.model = String(provider.model || "").trim();
  return provider;
}

function normalizeUnderstandTask(input) {
  const now = new Date().toISOString();
  return {
    id: input?.id || crypto.randomUUID(),
    status: normalizeVideoStatus(input?.status || "succeeded"),
    answer: String(input?.answer || ""),
    error: String(input?.error || ""),
    model: String(input?.model || ""),
    params: {
      videoUrl: String(input?.params?.videoUrl || ""),
      prompt: String(input?.params?.prompt || ""),
      fps: Number.isFinite(Number(input?.params?.fps)) ? Number(input.params.fps) : null,
      maxFrames: Number.isFinite(Number(input?.params?.maxFrames)) ? Number(input.params.maxFrames) : null,
      maxPixels: Number.isFinite(Number(input?.params?.maxPixels)) ? Number(input.params.maxPixels) : null,
    },
    usage: input?.usage && typeof input.usage === "object" ? input.usage : null,
    createdAt: String(input?.createdAt || now),
    updatedAt: String(input?.updatedAt || now),
  };
}

function normalizeEnhanceTask(input) {
  const now = new Date().toISOString();
  return {
    id: input?.id || crypto.randomUUID(),
    taskId: String(input?.taskId || "").trim(),
    status: normalizeVideoStatus(input?.status || "queued"),
    videoUrl: String(input?.videoUrl || ""),
    localFileName: String(input?.localFileName || ""),
    error: String(input?.error || ""),
    origin: String(input?.origin || ""),
    requestSummary: String(input?.requestSummary || ""),
    params: {
      video_url: String(input?.params?.video_url || ""),
      scene: String(input?.params?.scene || ""),
      tool_version: String(input?.params?.tool_version || ""),
      resolution: String(input?.params?.resolution || ""),
      resolution_limit: Number.isFinite(Number(input?.params?.resolution_limit))
        ? Number(input.params.resolution_limit)
        : null,
      fps: Number.isFinite(Number(input?.params?.fps)) ? Number(input.params.fps) : null,
    },
    result: {
      resolution: String(input?.result?.resolution || ""),
      toolVersion: String(input?.result?.toolVersion || ""),
      duration: Number.isFinite(Number(input?.result?.duration)) ? Number(input.result.duration) : null,
      fps: Number.isFinite(Number(input?.result?.fps)) ? Number(input.result.fps) : null,
      expiresAt: Number.isFinite(Number(input?.result?.expiresAt)) ? Number(input.result.expiresAt) : null,
      finishedAt: Number.isFinite(Number(input?.result?.finishedAt)) ? Number(input.result.finishedAt) : null,
    },
    createdAt: String(input?.createdAt || now),
    updatedAt: String(input?.updatedAt || now),
  };
}

function summarizeEnhanceParams(params) {
  return [
    params.scene ? `场景 ${params.scene}` : "",
    params.tool_version ? `版本 ${params.tool_version}` : "",
    params.resolution ? `分辨率 ${params.resolution}` : "",
    params.resolution_limit ? `短边 ${params.resolution_limit}` : "",
    params.fps ? `帧率 ${params.fps}fps` : "",
  ].filter(Boolean).join(" · ");
}

function normalizeVideoStatus(status) {
  const raw = String(status || "").trim().toLowerCase();
  if (!raw) {
    return "idle";
  }

  if (["queued", "pending", "submitted"].includes(raw)) {
    return "queued";
  }

  if (["running", "processing", "in_progress"].includes(raw)) {
    return "running";
  }

  if (["succeeded", "completed", "done", "success"].includes(raw)) {
    return "succeeded";
  }

  if (["failed", "error"].includes(raw)) {
    return "failed";
  }

  if (raw === "expired") {
    return "expired";
  }

  return raw;
}

function isVideoTaskFinished(status) {
  return ["succeeded", "failed", "expired"].includes(normalizeVideoStatus(status));
}

function getVideoStatusText(status) {
  switch (normalizeVideoStatus(status)) {
    case "queued":
      return "任务排队中";
    case "running":
      return "视频生成中";
    case "succeeded":
      return "已生成完成";
    case "failed":
      return "任务失败";
    case "expired":
      return "任务已过期";
    default:
      return "尚未提交任务";
  }
}

function getVideoStatusMessage(status) {
  switch (normalizeVideoStatus(status)) {
    case "queued":
      return "视频任务已提交，正在排队。";
    case "running":
      return "视频任务仍在生成中。";
    case "succeeded":
      return "视频已生成完成。";
    case "failed":
      return "视频任务失败。";
    case "expired":
      return "视频任务已过期。";
    default:
      return "视频任务状态已更新。";
  }
}

function clampVideoDuration(value) {
  const duration = Number.parseInt(value, 10);
  if (!Number.isFinite(duration)) {
    return 5;
  }

  return Math.max(4, Math.min(15, duration));
}

function normalizeVideoSeed(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const seed = Number.parseInt(value, 10);
  return Number.isFinite(seed) && seed >= 0 ? seed : null;
}

function renderVideoResult({ shot, videoTaskLabel, generatedVideo, videoLastFrame, videoResultEmpty, videoResultMeta }) {
  const task = normalizeVideoTask(shot.videoTask);
  const hasVideo = Boolean(task.videoUrl);
  const hasLastFrame = Boolean(task.lastFrameUrl);
  const hasResult = hasVideo || hasLastFrame;

  videoTaskLabel.textContent = task.id ? `${getVideoStatusText(task.status)} · ${task.id}` : "尚未提交任务";
  videoResultEmpty.hidden = hasResult;
  generatedVideo.hidden = !hasVideo;
  videoLastFrame.hidden = !hasLastFrame;

  if (hasVideo) {
    generatedVideo.src = task.videoUrl;
    if (task.localFileName) {
      generatedVideo.dataset.localFilename = task.localFileName;
    } else {
      delete generatedVideo.dataset.localFilename;
    }
  } else {
    generatedVideo.removeAttribute("src");
    delete generatedVideo.dataset.localFilename;
  }

  if (hasLastFrame) {
    videoLastFrame.src = task.lastFrameUrl;
  } else {
    videoLastFrame.removeAttribute("src");
  }

  const metaLines = [];
  if (task.requestSummary) {
    metaLines.push(`本次参数：${escapeHtml(task.requestSummary)}`);
  }
  if (task.updatedAt) {
    metaLines.push(`最近刷新：${escapeHtml(formatTime(task.updatedAt))}`);
  }
  if (task.error) {
    metaLines.push(`错误：${escapeHtml(task.error)}`);
  }
  if (hasVideo) {
    metaLines.push(`<a href="${escapeHtml(task.videoUrl)}" target="_blank" rel="noopener noreferrer">打开视频链接</a>`);
  }
  if (task.localFileName) {
    metaLines.push(`已保存到本地：${escapeHtml(task.localFileName)}`);
  }

  videoResultMeta.innerHTML = metaLines.join("<br>");
}

function updateShotVideoUI(shotId) {
  const shot = getShotById(shotId);
  if (!shot) {
    return;
  }

  const card = document.querySelector(`.shot-card[data-shot-id="${shotId}"]`);
  if (!card) {
    return;
  }

  const videoTaskLabel = card.querySelector(".video-task-label");
  const generatedVideo = card.querySelector(".generated-video");
  const videoLastFrame = card.querySelector(".video-last-frame");
  const videoResultEmpty = card.querySelector(".video-result-empty");
  const videoResultMeta = card.querySelector(".video-result-meta");
  const videoHistoryList = card.querySelector(".video-history-list");
  const videoHistoryCount = card.querySelector(".video-history-count");

  renderVideoResult({ shot, videoTaskLabel, generatedVideo, videoLastFrame, videoResultEmpty, videoResultMeta });
  renderVideoHistory(videoHistoryList, shot);
  videoHistoryCount.textContent = `${(shot.videoHistory || []).length} 条归档`;
  hydrateLocalVideoElements(card);
}

function renderVideoHistory(container, shot) {
  container.innerHTML = "";
  const history = shot.videoHistory || [];

  if (!history.length) {
    container.innerHTML = '<div class="empty-state">视频生成成功后会自动归档到这里。</div>';
    return;
  }

  [...history].reverse().forEach((entry) => {
    const item = document.createElement("div");
    item.className = "video-history-item";

    const statusText = getVideoStatusText(entry.status || "succeeded");
    const hasVideo = Boolean(entry.videoUrl);

    item.innerHTML = `
      <header>
        <strong>${statusText} · ${escapeHtml(formatTime(entry.createdAt))}</strong>
        <div class="video-history-actions">
          <button class="ghost-button archive-rate-button" type="button">${renderArchiveStars(entry.rating || 0)}</button>
          <button class="ghost-button delete-video-history-button danger" type="button">删除</button>
        </div>
      </header>
      ${entry.requestSummary ? `<p class="video-history-meta">${escapeHtml(entry.requestSummary)}</p>` : ""}
      ${entry.prompt ? `<p class="truncatable video-history-prompt">${escapeHtml(entry.prompt)}</p>` : ""}
      ${hasVideo ? `<video src="${escapeHtml(entry.videoUrl)}" ${entry.localFileName ? `data-local-filename="${escapeHtml(entry.localFileName)}"` : ""} controls playsinline></video>` : ""}
      ${hasVideo ? `<p class="video-history-meta"><a href="${escapeHtml(entry.videoUrl)}" target="_blank" rel="noopener noreferrer">打开视频链接</a>${entry.localFileName ? ` · 本地：${escapeHtml(entry.localFileName)}` : ""}</p>` : ""}
    `;

    const promptEl = item.querySelector("p.truncatable");
    if (promptEl) {
      promptEl.addEventListener("click", () => {
        item.classList.toggle("is-expanded");
      });
    }

    item.querySelector(".archive-rate-button").addEventListener("click", async () => {
      entry.rating = getNextArchiveRating(entry.rating || 0);
      await persistState("视频归档星标已更新。");
      render();
    });

    item.querySelector(".delete-video-history-button").addEventListener("click", async () => {
      shot.videoHistory = (shot.videoHistory || []).filter((e) => e.id !== entry.id);
      shot.updatedAt = new Date().toISOString();
      await persistState("视频归档已删除。");
      render();
    });

    container.append(item);
  });
}

function createVideoHistoryEntry(videoTask, prompt) {
  return {
    id: crypto.randomUUID(),
    taskId: videoTask.id || "",
    status: videoTask.status || "succeeded",
    videoUrl: videoTask.videoUrl || "",
    coverImageUrl: videoTask.coverImageUrl || "",
    lastFrameUrl: videoTask.lastFrameUrl || "",
    requestSummary: videoTask.requestSummary || "",
    prompt: prompt || "",
    rating: 0,
    createdAt: new Date().toISOString(),
    localFileName: videoTask.localFileName || "",
  };
}

function archiveVideoResult(shot) {
  const task = shot.videoTask;
  if (!task?.videoUrl) {
    return;
  }

  const alreadyArchived = (shot.videoHistory || []).some((e) => e.taskId === task.id);
  if (alreadyArchived) {
    return;
  }

  if (!Array.isArray(shot.videoHistory)) {
    shot.videoHistory = [];
  }

  shot.videoHistory.push(createVideoHistoryEntry(task, shot.currentPrompt));
}

function isProbablyImageFile(file) {
  if (!file) {
    return false;
  }

  if (String(file.type || "").startsWith("image/")) {
    return true;
  }

  return /\.(png|jpe?g|webp|gif|bmp|heic|heif|avif)$/i.test(String(file.name || ""));
}

function isShotEmpty(shot) {
  return !shot.title
    && !shot.directorNotes
    && !(shot.references || []).length
    && !shot.currentPrompt
    && !shot.promptHistory.length
    && !shot.chatHistory.length;
}

function queuePersistState(message) {
  setStatus("正在自动保存...");
  if (persistTimer) {
    window.clearTimeout(persistTimer);
  }

  persistTimer = window.setTimeout(async () => {
    persistTimer = null;
    await persistState(message);
  }, PERSIST_DEBOUNCE_MS);
}

async function flushPendingPersist() {
  if (!persistTimer) {
    return;
  }

  window.clearTimeout(persistTimer);
  persistTimer = null;
  await persistState("本地更改已保存。");
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
    const fresh = structuredClone(defaultState);
    fresh.scenes = [normalizeScene({ id: DEFAULT_SCENE_ID, name: DEFAULT_SCENE_NAME }, 0)];
    fresh.currentSceneId = DEFAULT_SCENE_ID;
    return fresh;
  }

  const rawShots = Array.isArray(input.shots) ? input.shots : [];
  const rawScenes = Array.isArray(input.scenes) ? input.scenes : [];
  const favorites = Array.isArray(input.favorites) ? input.favorites : [];
  const subjects = Array.isArray(input.subjects) ? input.subjects : [];
  const enhanceTasks = Array.isArray(input.enhanceTasks) ? input.enhanceTasks : [];
  const understandTasks = Array.isArray(input.understandTasks) ? input.understandTasks : [];

  const normalizedShots = rawShots.map(normalizeShot);
  const scenes = rawScenes.map((s, i) => normalizeScene(s, i));
  if (!scenes.some((s) => s.id === DEFAULT_SCENE_ID)) {
    const needsDefault = normalizedShots.some((shot) => !shot.sceneId)
      || scenes.length === 0;
    if (needsDefault) {
      scenes.unshift(normalizeScene({ id: DEFAULT_SCENE_ID, name: DEFAULT_SCENE_NAME }, 0));
    }
  }
  const sceneIds = new Set(scenes.map((s) => s.id));
  normalizedShots.forEach((shot) => {
    if (!shot.sceneId || !sceneIds.has(shot.sceneId)) {
      shot.sceneId = DEFAULT_SCENE_ID;
    }
  });
  scenes.sort((a, b) => (a.order || 0) - (b.order || 0));
  scenes.forEach((s, i) => { s.order = i; });

  let currentSceneId = String(input.currentSceneId || "");
  if (!sceneIds.has(currentSceneId)) {
    currentSceneId = scenes[0]?.id || "";
  }

  return {
    settings: {
      ...defaultState.settings,
      ...input.settings,
      provider: normalizeProvider(input?.settings?.provider, input?.settings?.model),
      model: normalizeModel(input?.settings?.provider, input?.settings?.model),
      apiKeys: normalizeApiKeys(input?.settings),
      videoApiKey: String(input?.settings?.videoApiKey || "").trim(),
      videoProvider: normalizeVideoProvider(input?.settings?.videoProvider),
      mediaKitApiKey: String(input?.settings?.mediaKitApiKey || "").trim(),
      mediaKitProvider: normalizeMediaKitProvider(input?.settings?.mediaKitProvider),
      understandProvider: normalizeUnderstandProvider(input?.settings?.understandProvider),
      customProvider: normalizeCustomProvider(input?.settings?.customProvider, input?.settings?.model),
    },
    shots: normalizedShots.length ? normalizedShots : [seedInitialShot(scenes)],
    scenes,
    currentSceneId,
    favorites: favorites.map(normalizeFavorite),
    subjects: subjects.map(normalizeSubject),
    enhanceTasks: enhanceTasks.map(normalizeEnhanceTask),
    understandTasks: understandTasks.map(normalizeUnderstandTask),
  };
}

function seedInitialShot(scenes) {
  const now = new Date().toISOString();
  const sceneId = scenes[0]?.id || DEFAULT_SCENE_ID;
  return {
    id: crypto.randomUUID(),
    sceneId,
    linkedFavoriteId: "",
    title: "",
    directorNotes: "",
    references: [],
    videoConfig: createDefaultVideoConfig(),
    videoTask: createEmptyVideoTask(),
    currentPrompt: "",
    promptHistory: [],
    chatHistory: [],
    videoHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeProvider(provider, model) {
  if (provider && PROVIDER_CONFIGS[provider]) {
    return provider;
  }

  if (model === "openai") {
    return "openai";
  }

  return defaultState.settings.provider;
}

function normalizeModel(provider, model) {
  const normalizedProvider = normalizeProvider(provider, model);
  const providerConfig = PROVIDER_CONFIGS[normalizedProvider];

  if (normalizedProvider === "custom") {
    return String(model || "").trim() || "";
  }

  if (model && model !== "openai") {
    return model;
  }

  return providerConfig.defaultModel;
}

function normalizeCustomProvider(customProvider, model) {
  return {
    ...defaultState.settings.customProvider,
    ...customProvider,
    label: String(customProvider?.label || defaultState.settings.customProvider.label).trim() || defaultState.settings.customProvider.label,
    baseUrl: String(customProvider?.baseUrl || "").trim(),
    model: String(customProvider?.model || model || "").trim(),
    apiKeyLabel: String(customProvider?.apiKeyLabel || defaultState.settings.customProvider.apiKeyLabel).trim() || defaultState.settings.customProvider.apiKeyLabel,
    requestMode: customProvider?.requestMode === "chat_completions" ? "chat_completions" : "responses",
  };
}

function normalizeApiKeys(settings) {
  const keys = { ...(settings?.apiKeys || {}) };
  const provider = normalizeProvider(settings?.provider, settings?.model);
  const legacyApiKey = String(settings?.apiKey || "").trim();

  if (legacyApiKey && !keys[provider]) {
    keys[provider] = legacyApiKey;
  }

  return keys;
}

function normalizeShot(input) {
  const now = new Date().toISOString();
  let references = normalizeReferences(input?.references);

  // Migration: convert old group shots with referenceFrames to references
  if (input?.type === "group" && Array.isArray(input?.referenceFrames) && input.referenceFrames.length) {
    const migratedRefs = input.referenceFrames
      .filter((frame) => frame?.imageDataUrl)
      .map((frame) => createReference("image", frame.imageDataUrl, "reference", frame.title || ""));
    if (migratedRefs.length && !references.length) {
      references = migratedRefs;
    }
  }

  // Migration: convert imageDataUrl to a first_frame reference
  if (input?.imageDataUrl && !references.some((r) => r.role === "first_frame")) {
    references.unshift(createReference("image", input.imageDataUrl, "first_frame", "图片1"));
  }

  return {
    id: input?.id || crypto.randomUUID(),
    sceneId: String(input?.sceneId || ""),
    linkedFavoriteId: input?.linkedFavoriteId || "",
    title: input?.title || "",
    directorNotes: input?.directorNotes || "",
    references,
    videoConfig: normalizeShotVideoConfig(input?.videoConfig),
    videoTask: normalizeVideoTask(input?.videoTask),
    currentPrompt: input?.currentPrompt || "",
    promptHistory: Array.isArray(input?.promptHistory) ? input.promptHistory.map(normalizeHistoryEntry) : [],
    chatHistory: Array.isArray(input?.chatHistory) ? input.chatHistory : [],
    videoHistory: Array.isArray(input?.videoHistory) ? input.videoHistory : [],
    createdAt: input?.createdAt || now,
    updatedAt: input?.updatedAt || input?.createdAt || now,
  };
}

function normalizeFavorite(input) {
  const now = new Date().toISOString();
  let references = normalizeReferences(input?.references);

  // Migration: convert old group favorites with referenceFrames to references
  if (input?.type === "group" && Array.isArray(input?.referenceFrames) && input.referenceFrames.length) {
    const migratedRefs = input.referenceFrames
      .filter((frame) => frame?.imageDataUrl)
      .map((frame) => createReference("image", frame.imageDataUrl, "reference", frame.title || ""));
    if (migratedRefs.length && !references.length) {
      references = migratedRefs;
    }
  }

  // Migration: convert imageDataUrl to a first_frame reference
  if (input?.imageDataUrl && !references.some((r) => r.role === "first_frame")) {
    references.unshift(createReference("image", input.imageDataUrl, "first_frame", "图片1"));
  }

  return {
    id: input?.id || crypto.randomUUID(),
    shotId: input?.shotId || "",
    title: input?.title || "",
    directorNotes: input?.directorNotes || "",
    references,
    videoConfig: normalizeShotVideoConfig(input?.videoConfig),
    currentPrompt: input?.currentPrompt || "",
    promptHistory: Array.isArray(input?.promptHistory) ? input.promptHistory.map(normalizeHistoryEntry) : [],
    tags: normalizeFavoriteTags(input?.tags),
    chatHistory: Array.isArray(input?.chatHistory) ? input.chatHistory : [],
    videoHistory: Array.isArray(input?.videoHistory) ? input.videoHistory : [],
    favoritedAt: input?.favoritedAt || now,
    updatedAt: input?.updatedAt || now,
  };
}

function normalizeSubject(input) {
  return {
    id: input?.id || crypto.randomUUID(),
    name: String(input?.name || "").trim(),
    type: input?.type || "角色",
    imageDataUrl: input?.imageDataUrl || "",
    createdAt: input?.createdAt || new Date().toISOString(),
  };
}

function normalizeFavoriteTags(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return [...new Set(input.map((tag) => String(tag || "").trim()).filter(Boolean))];
}

function normalizeReferences(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const validTypes = ["image", "video", "audio"];
  const counts = { image: 0, video: 0, audio: 0 };
  const limits = { image: 9, video: 3, audio: 3 };
  const result = [];

  for (const item of input) {
    const mediaType = validTypes.includes(item?.mediaType) ? item.mediaType : "";
    if (!mediaType) {
      continue;
    }
    if (counts[mediaType] >= limits[mediaType]) {
      continue;
    }

    result.push({
      id: item?.id || crypto.randomUUID(),
      mediaType,
      url: String(item?.url || ""),
      role: String(item?.role || ""),
      title: String(item?.title || ""),
    });
    counts[mediaType] += 1;
  }

  return result;
}

function parseFavoriteTags(input) {
  return [...new Set(String(input || "")
    .split(/[,，;；\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean))];
}

async function saveFavoriteTags(favoriteId, rawValue) {
  const target = state.favorites.find((item) => item.id === favoriteId);
  if (!target) {
    return;
  }

  const appendedTags = parseFavoriteTags(rawValue);
  if (!appendedTags.length) {
    return;
  }

  const nextTags = [...new Set([...(target.tags || []), ...appendedTags])];
  const currentTags = target.tags || [];
  if (currentTags.join("|") === nextTags.join("|")) {
    return;
  }

  target.tags = nextTags;
  await persistState("收藏标签已更新。");
  renderFavoriteModal(target);
  populateFavoriteTagFilter();
}

function renderFavoriteTags(tags) {
  if (!tags.length) {
    return '<span class="meta">未设置标签</span>';
  }

  return tags.map((tag) => `
    <span class="favorite-tag">
      <span>${escapeHtml(tag)}</span>
      <button class="favorite-tag-remove" type="button" data-tag-value="${escapeHtml(tag)}" aria-label="删除标签 ${escapeHtml(tag)}">×</button>
    </span>
  `).join("");
}

function renderFavoritePreviewSummary(favorite) {
  const refCount = (favorite.references || []).length;
  return refCount > 0
    ? `<p class="favorite-time meta">${refCount} 个参考素材</p>`
    : '<p class="favorite-time meta">单镜头</p>';
}

async function removeFavoriteTag(favoriteId, tagValue) {
  const target = state.favorites.find((item) => item.id === favoriteId);
  if (!target || !tagValue) {
    return;
  }

  const nextTags = (target.tags || []).filter((tag) => tag !== tagValue);
  if (nextTags.length === (target.tags || []).length) {
    return;
  }

  target.tags = nextTags;
  await persistState("收藏标签已更新。");
  renderFavoriteModal(target);
  populateFavoriteTagFilter();
}

function populateFavoriteTagFilter() {
  const tags = [...new Set(state.favorites.flatMap((favorite) => favorite.tags || []))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  const options = ['<option value="">全部标签</option>']
    .concat(tags.map((tag) => `<option value="${escapeHtml(tag.toLowerCase())}">${escapeHtml(tag)}</option>`));
  elements.favoritesTagFilter.innerHTML = options.join("");
}

function normalizeHistoryEntry(input) {
  return {
    id: input?.id || crypto.randomUUID(),
    prompt: input?.prompt || "",
    label: input?.label || "手动保存",
    rating: Math.max(0, Math.min(3, Number(input?.rating) || 0)),
    createdAt: input?.createdAt || new Date().toISOString(),
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
  elements.globalDirection.value = state.settings.globalDirection || "";
}

function getCurrentProviderConfig() {
  const providerId = state.settings.provider;
  if (providerId === "custom") {
    const customProvider = normalizeCustomProvider(state.settings.customProvider, state.settings.model);
    return {
      ...PROVIDER_CONFIGS.custom,
      ...customProvider,
      defaultModel: String(customProvider.model || state.settings.model || "").trim(),
      modelSuggestions: [],
      baseUrl: String(customProvider.baseUrl || "").trim(),
      requestMode: customProvider.requestMode,
    };
  }

  return PROVIDER_CONFIGS[providerId] || PROVIDER_CONFIGS[defaultState.settings.provider];
}

function getCurrentApiKey() {
  const provider = getCurrentProviderConfig();
  const providerKey = String(state.settings.apiKeys?.[provider.id] || "").trim();
  if (providerKey) {
    return providerKey;
  }

  const hasScopedKeys = Object.keys(state.settings.apiKeys || {}).length > 0;
  if (!hasScopedKeys) {
    return String(state.settings.apiKey || "").trim();
  }

  return "";
}

function getCurrentVideoApiKey() {
  return String(state.settings.videoApiKey || "").trim();
}

function getShotReferenceImages(shot) {
  return (shot.references || []).filter((r) => r.mediaType === "image").map((r) => r.url).filter(Boolean);
}

function getShotCoverImage(shot) {
  const firstImage = (shot.references || []).find((r) => r.mediaType === "image" && r.url);
  return firstImage?.url || "";
}

function getShotById(shotId) {
  return state.shots.find((shot) => shot.id === shotId);
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function setShotStatus(shotId, message) {
  const card = document.querySelector(`.shot-card[data-shot-id="${shotId}"]`);
  const bar = card?.querySelector(".shot-status-bar");
  if (!bar) {
    setStatus(message);
    return;
  }
  bar.textContent = message;
  bar.hidden = false;
  clearTimeout(bar._timer);
  bar._timer = setTimeout(() => { bar.hidden = true; }, 8000);
  bar.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function reportRuntimeError(error, fallbackMessage) {
  console.error(error);
  setStatus(error?.message || fallbackMessage);
}

function bindRuntimeErrorReporting() {
  window.addEventListener("error", (event) => {
    reportRuntimeError(event.error || new Error(event.message || "页面运行出错。"), "页面运行出错。");
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportRuntimeError(event.reason instanceof Error ? event.reason : new Error(String(event.reason || "存在未处理的异步错误。")), "存在未处理的异步错误。");
  });
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

function openSettingsModal() {
  uiState.isEditingApiKey = !getCurrentApiKey();
  uiState.isEditingVideoApiKey = !getCurrentVideoApiKey();
  uiState.isEditingMediaKitApiKey = !getCurrentMediaKitApiKey();
  renderSettingsModal();
  elements.settingsModal.hidden = false;
}

function closeSettingsModal() {
  uiState.isEditingApiKey = false;
  uiState.isEditingVideoApiKey = false;
  uiState.isEditingMediaKitApiKey = false;
  elements.settingsModal.hidden = true;
}

function renderSettingsModal() {
  const provider = getCurrentProviderConfig();
  const videoProvider = normalizeVideoProvider(state.settings.videoProvider);
  const mediaKitProvider = normalizeMediaKitProvider(state.settings.mediaKitProvider);
  const understandProvider = normalizeUnderstandProvider(state.settings.understandProvider);
  const currentApiKey = getCurrentApiKey();
  const currentVideoApiKey = getCurrentVideoApiKey();
  const currentMediaKitApiKey = getCurrentMediaKitApiKey();
  const hasApiKey = Boolean(currentApiKey);
  const hasVideoApiKey = Boolean(currentVideoApiKey);
  const hasMediaKitApiKey = Boolean(currentMediaKitApiKey);
  const shouldEditApiKey = uiState.isEditingApiKey || !hasApiKey;
  const shouldEditVideoApiKey = uiState.isEditingVideoApiKey || !hasVideoApiKey;
  const shouldEditMediaKitApiKey = uiState.isEditingMediaKitApiKey || !hasMediaKitApiKey;
  const maskedApiKey = hasApiKey ? maskApiKey(currentApiKey) : "未设置";
  const maskedVideoApiKey = hasVideoApiKey ? maskApiKey(currentVideoApiKey) : "未设置（也可以直接用服务端环境变量 ARK_API_KEY）";
  const maskedMediaKitApiKey = hasMediaKitApiKey ? maskApiKey(currentMediaKitApiKey) : "未设置（也可以直接用服务端环境变量 AMK_API_KEY）";
  const providerChipsMarkup = Object.values(PROVIDER_CONFIGS)
    .map((item) => {
      const isActive = provider.id === item.id;
      return `<button class="ghost-button model-preset-button${isActive ? " is-active" : ""}" type="button" data-provider-id="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`;
    })
    .join("");
  const modelOptionsMarkup = provider.modelSuggestions
    .map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)
    .join("");
  const customProvider = normalizeCustomProvider(state.settings.customProvider, state.settings.model);
  const customRequestMode = customProvider.requestMode === "chat_completions" ? "chat_completions" : "responses";
  const localVideoDirStatus = describeLocalVideoDirStatus();
  const customFieldsMarkup = provider.id === "custom" ? `
    <label class="field compact">
      <span>API 名称</span>
      <input class="settings-custom-label-input" type="text" value="${escapeHtml(customProvider.label)}" placeholder="例如：OpenRouter / SiliconFlow / DeepSeek">
    </label>
    <label class="field compact">
      <span>Base URL</span>
      <input class="settings-custom-base-url-input" type="text" value="${escapeHtml(customProvider.baseUrl)}" placeholder="例如：https://openrouter.ai/api/v1">
    </label>
    <label class="field compact">
      <span>请求模式</span>
      <select class="settings-custom-request-mode">
        <option value="responses"${customRequestMode === "responses" ? " selected" : ""}>Responses API</option>
        <option value="chat_completions"${customRequestMode === "chat_completions" ? " selected" : ""}>Chat Completions API</option>
      </select>
    </label>
    <p class="meta">适用于 OpenRouter、SiliconFlow 等兼容 OpenAI 的服务。Kimi、MiniMax 这类更建议先试 Chat Completions API。</p>
  ` : "";

  elements.settingsModalContent.innerHTML = `
    <article class="shot-card settings-card">
      <div class="panel-header">
        <h2>模型与 API 设置</h2>
        <div class="history-actions">
          <button class="ghost-button settings-close-button" type="button">关闭</button>
        </div>
      </div>
      <div class="settings-grid">
        <section class="prompt-panel settings-panel">
          <div class="favorite-block">
            <h3>${escapeHtml(provider.apiKeyLabel)}</h3>
            ${shouldEditApiKey ? `
              <label class="field compact">
                <span>输入后仅本地保存，保存后只显示掩码</span>
                <input class="settings-api-key-input" type="password" placeholder="输入 ${escapeHtml(provider.apiKeyLabel)}" autocomplete="off">
              </label>
              <div class="card-actions">
                <button class="secondary-button settings-save-api-button" type="button">保存 API Key</button>
                ${hasApiKey ? '<button class="ghost-button settings-cancel-api-button" type="button">取消</button>' : ""}
              </div>
            ` : `
              <div class="secure-field">
                <span class="secure-label">已加密显示</span>
                <div class="secure-value" tabindex="0">${escapeHtml(maskedApiKey)}</div>
              </div>
              <div class="card-actions">
                <button class="ghost-button settings-edit-api-button" type="button">重新输入</button>
              </div>
            `}
          </div>
        </section>
        <section class="prompt-panel settings-panel">
          <div class="favorite-block">
            <h3>服务商与模型</h3>
            <div class="model-presets">${providerChipsMarkup}</div>
            ${customFieldsMarkup}
            <label class="field compact">
              <span>当前用于生成和修改 Prompt 的模型名</span>
              <input class="settings-model-input" type="text" value="${escapeHtml(state.settings.model || defaultState.settings.model)}" list="settingsModelOptions" autocomplete="off">
              <datalist id="settingsModelOptions">${modelOptionsMarkup}</datalist>
            </label>
          </div>
        </section>
        <section class="prompt-panel settings-panel">
          <div class="favorite-block">
            <h3>Seedance API Key</h3>
            ${shouldEditVideoApiKey ? `
              <label class="field compact">
                <span>可本地保存，也可留空并改用服务端环境变量 ARK_API_KEY</span>
                <input class="settings-video-api-key-input" type="password" placeholder="输入 Seedance / ARK API Key" autocomplete="off">
              </label>
              <div class="card-actions">
                <button class="secondary-button settings-save-video-api-button" type="button">保存 Video Key</button>
                ${hasVideoApiKey ? '<button class="ghost-button settings-cancel-video-api-button" type="button">取消</button>' : ""}
              </div>
            ` : `
              <div class="secure-field">
                <span class="secure-label">已加密显示</span>
                <div class="secure-value secure-video-value" tabindex="0">${escapeHtml(maskedVideoApiKey)}</div>
              </div>
              <div class="card-actions">
                <button class="ghost-button settings-edit-video-api-button" type="button">重新输入</button>
              </div>
            `}
          </div>
        </section>
        <section class="prompt-panel settings-panel">
          <div class="favorite-block">
            <h3>视频生成服务</h3>
            <label class="field compact">
              <span>视频 API Base URL</span>
              <input class="settings-video-base-url-input" type="text" value="${escapeHtml(videoProvider.baseUrl)}" placeholder="${escapeHtml(DEFAULT_VIDEO_BASE_URL)}">
            </label>
            <label class="field compact">
              <span>视频模型 ID</span>
              <input class="settings-video-model-input" type="text" value="${escapeHtml(videoProvider.model)}" placeholder="${escapeHtml(DEFAULT_VIDEO_MODEL)}">
            </label>
            <p class="meta">当前版本默认按火山方舟 Seedance 异步任务接口创建任务，并通过服务端 /api/video-tasks 代理提交与查询。</p>
          </div>
        </section>
        <section class="prompt-panel settings-panel">
          <div class="favorite-block">
            <h3>AI MediaKit API Key（画质增强）</h3>
            ${shouldEditMediaKitApiKey ? `
              <label class="field compact">
                <span>可本地保存，也可留空并改用服务端环境变量 AMK_API_KEY</span>
                <input class="settings-mediakit-api-key-input" type="password" placeholder="输入 AI MediaKit API Key" autocomplete="off">
              </label>
              <div class="card-actions">
                <button class="secondary-button settings-save-mediakit-api-button" type="button">保存 MediaKit Key</button>
                ${hasMediaKitApiKey ? '<button class="ghost-button settings-cancel-mediakit-api-button" type="button">取消</button>' : ""}
              </div>
            ` : `
              <div class="secure-field">
                <span class="secure-label">已加密显示</span>
                <div class="secure-value secure-mediakit-value" tabindex="0">${escapeHtml(maskedMediaKitApiKey)}</div>
              </div>
              <div class="card-actions">
                <button class="ghost-button settings-edit-mediakit-api-button" type="button">重新输入</button>
              </div>
            `}
          </div>
        </section>
        <section class="prompt-panel settings-panel">
          <div class="favorite-block">
            <h3>画质增强服务</h3>
            <label class="field compact">
              <span>MediaKit API Base URL</span>
              <input class="settings-mediakit-base-url-input" type="text" value="${escapeHtml(mediaKitProvider.baseUrl)}" placeholder="${escapeHtml(DEFAULT_ENHANCE_BASE_URL)}">
            </label>
            <p class="meta">默认调用 AI MediaKit 画质增强接口（提交 <code>/tools/enhance-video</code>，查询 <code>/tasks/{task_id}</code>）。未填 API Key 时，会通过服务端 /api/enhance-video 代理。</p>
          </div>
        </section>
        <section class="prompt-panel settings-panel">
          <div class="favorite-block">
            <h3>视频理解服务</h3>
            <label class="field compact">
              <span>视频理解 Base URL</span>
              <input class="settings-understand-base-url-input" type="text" value="${escapeHtml(understandProvider.baseUrl)}" placeholder="${escapeHtml(DEFAULT_UNDERSTAND_BASE_URL)}">
            </label>
            <label class="field compact">
              <span>默认火山方舟模型 ID</span>
              <input class="settings-understand-model-input" type="text" value="${escapeHtml(understandProvider.model)}" placeholder="${escapeHtml(DEFAULT_UNDERSTAND_MODEL)}">
            </label>
            <p class="meta">视频理解复用 Seedance / ARK API Key 与 MediaKit API Key，按 <code>Bearer 方舟Key/MediaKitKey</code> 拼接，通过服务端 /api/understand-video 代理。</p>
          </div>
        </section>
        <section class="prompt-panel settings-panel">
          <div class="favorite-block">
            <h3>本地视频保存目录</h3>
            <div class="secure-field">
              <span class="secure-label">当前状态</span>
              <div class="secure-value">${escapeHtml(localVideoDirStatus.label)}</div>
            </div>
            <p class="meta">${escapeHtml(localVideoDirStatus.hint)}</p>
            <div class="card-actions">
              ${localVideoDirStatus.canPick ? `<button class="secondary-button settings-pick-local-video-dir-button" type="button">${localVideoDirHandle ? "更换目录" : "选择目录"}</button>` : ""}
              ${localVideoDirStatus.canReauth ? '<button class="ghost-button settings-reauth-local-video-dir-button" type="button">重新授权</button>' : ""}
              ${localVideoDirStatus.canClear ? '<button class="ghost-button settings-clear-local-video-dir-button danger" type="button">取消绑定</button>' : ""}
            </div>
            <p class="meta">视频生成或画质增强成功后，会通过服务端 /api/proxy-video 下载源流并以 <code>seedance_&lt;taskId&gt;.mp4</code> / <code>enhance_&lt;taskId&gt;.mp4</code> 写入该目录。仅写入新生成视频，不会回溯已有链接。</p>
          </div>
        </section>
      </div>
    </article>
  `;

  const closeButton = elements.settingsModalContent.querySelector(".settings-close-button");
  closeButton.addEventListener("click", closeSettingsModal);

  const modelInput = elements.settingsModalContent.querySelector(".settings-model-input");
  modelInput.addEventListener("input", (event) => {
    state.settings.model = event.target.value.trim() || provider.defaultModel;
    if (provider.id === "custom") {
      state.settings.customProvider = {
        ...normalizeCustomProvider(state.settings.customProvider, state.settings.model),
        model: state.settings.model,
      };
    }
    queuePersistState("模型设置已更新。");
  });
  elements.settingsModalContent.querySelectorAll(".model-preset-button").forEach((button) => {
    button.addEventListener("click", () => {
      const nextProviderId = button.dataset.providerId;
      if (!nextProviderId || !PROVIDER_CONFIGS[nextProviderId]) {
        return;
      }

      state.settings.provider = nextProviderId;
      state.settings.model = nextProviderId === "custom"
        ? (normalizeCustomProvider(state.settings.customProvider, state.settings.model).model || "")
        : PROVIDER_CONFIGS[nextProviderId].defaultModel;
      uiState.isEditingApiKey = !String(state.settings.apiKeys?.[nextProviderId] || "").trim();
      queuePersistState("服务商设置已更新。");
      renderSettingsModal();
    });
  });

  if (provider.id === "custom") {
    const customLabelInput = elements.settingsModalContent.querySelector(".settings-custom-label-input");
    const customBaseUrlInput = elements.settingsModalContent.querySelector(".settings-custom-base-url-input");
    const customRequestModeInput = elements.settingsModalContent.querySelector(".settings-custom-request-mode");

    customLabelInput?.addEventListener("input", (event) => {
      state.settings.customProvider = {
        ...normalizeCustomProvider(state.settings.customProvider, state.settings.model),
        label: event.target.value,
      };
      queuePersistState("自定义 API 名称已更新。");
    });

    customBaseUrlInput?.addEventListener("input", (event) => {
      state.settings.customProvider = {
        ...normalizeCustomProvider(state.settings.customProvider, state.settings.model),
        baseUrl: event.target.value,
      };
      queuePersistState("自定义 API 地址已更新。");
    });

    customRequestModeInput?.addEventListener("change", (event) => {
      state.settings.customProvider = {
        ...normalizeCustomProvider(state.settings.customProvider, state.settings.model),
        requestMode: event.target.value,
      };
      queuePersistState("自定义 API 请求模式已更新。");
    });
  }

  const videoBaseUrlInput = elements.settingsModalContent.querySelector(".settings-video-base-url-input");
  const videoModelInput = elements.settingsModalContent.querySelector(".settings-video-model-input");
  videoBaseUrlInput?.addEventListener("input", (event) => {
    state.settings.videoProvider = {
      ...normalizeVideoProvider(state.settings.videoProvider),
      baseUrl: event.target.value,
    };
    queuePersistState("视频 API 地址已更新。");
  });
  videoModelInput?.addEventListener("input", (event) => {
    state.settings.videoProvider = {
      ...normalizeVideoProvider(state.settings.videoProvider),
      model: event.target.value,
    };
    syncVideoResolutionOptions();
    queuePersistState("视频模型设置已更新。");
  });

  const mediaKitBaseUrlInput = elements.settingsModalContent.querySelector(".settings-mediakit-base-url-input");
  mediaKitBaseUrlInput?.addEventListener("input", (event) => {
    state.settings.mediaKitProvider = {
      ...normalizeMediaKitProvider(state.settings.mediaKitProvider),
      baseUrl: event.target.value,
    };
    queuePersistState("画质增强 API 地址已更新。");
  });

  const understandBaseUrlInput = elements.settingsModalContent.querySelector(".settings-understand-base-url-input");
  const understandModelInput = elements.settingsModalContent.querySelector(".settings-understand-model-input");
  understandBaseUrlInput?.addEventListener("input", (event) => {
    state.settings.understandProvider = {
      ...normalizeUnderstandProvider(state.settings.understandProvider),
      baseUrl: event.target.value,
    };
    queuePersistState("视频理解 API 地址已更新。");
  });
  understandModelInput?.addEventListener("input", (event) => {
    state.settings.understandProvider = {
      ...normalizeUnderstandProvider(state.settings.understandProvider),
      model: event.target.value,
    };
    queuePersistState("视频理解默认模型已更新。");
  });

  const rerenderAllVideoViews = () => {
    render();
    renderEnhanceView();
  };

  const pickLocalDirButton = elements.settingsModalContent.querySelector(".settings-pick-local-video-dir-button");
  pickLocalDirButton?.addEventListener("click", async () => {
    try {
      await pickLocalVideoDirectory();
      setStatus("已绑定本地视频保存目录。");
      rerenderAllVideoViews();
    } catch (error) {
      setStatus(error.message || "绑定目录失败。");
    }
  });

  const reauthLocalDirButton = elements.settingsModalContent.querySelector(".settings-reauth-local-video-dir-button");
  reauthLocalDirButton?.addEventListener("click", async () => {
    const ok = await ensureLocalVideoDirPermission({ request: true });
    setStatus(ok ? "目录权限已恢复。" : "未获得目录权限。");
    rerenderAllVideoViews();
  });

  const clearLocalDirButton = elements.settingsModalContent.querySelector(".settings-clear-local-video-dir-button");
  clearLocalDirButton?.addEventListener("click", async () => {
    await clearLocalVideoDirectory();
    setStatus("已取消本地视频目录绑定。");
    rerenderAllVideoViews();
  });

  if (shouldEditApiKey) {
    const apiInput = elements.settingsModalContent.querySelector(".settings-api-key-input");
    const saveButton = elements.settingsModalContent.querySelector(".settings-save-api-button");
    const cancelButton = elements.settingsModalContent.querySelector(".settings-cancel-api-button");

    saveButton.addEventListener("click", () => {
      const nextApiKey = apiInput.value.trim();
      if (!nextApiKey) {
        setStatus("API Key 不能为空。");
        return;
      }

      state.settings.apiKeys = {
        ...(state.settings.apiKeys || {}),
        [provider.id]: nextApiKey,
      };
      state.settings.apiKey = nextApiKey;
      uiState.isEditingApiKey = false;
      queuePersistState(`${provider.apiKeyLabel} 已本地保存。`);
      renderSettingsModal();
    });

    cancelButton?.addEventListener("click", () => {
      uiState.isEditingApiKey = false;
      renderSettingsModal();
    });
  }

  if (shouldEditVideoApiKey) {
    const videoApiInput = elements.settingsModalContent.querySelector(".settings-video-api-key-input");
    const saveVideoButton = elements.settingsModalContent.querySelector(".settings-save-video-api-button");
    const cancelVideoButton = elements.settingsModalContent.querySelector(".settings-cancel-video-api-button");

    saveVideoButton?.addEventListener("click", () => {
      state.settings.videoApiKey = videoApiInput.value.trim();
      uiState.isEditingVideoApiKey = false;
      queuePersistState(state.settings.videoApiKey ? "视频 API Key 已本地保存。" : "视频 API Key 已清空，将改用服务端环境变量。");
      renderSettingsModal();
    });

    cancelVideoButton?.addEventListener("click", () => {
      uiState.isEditingVideoApiKey = false;
      renderSettingsModal();
    });
  }

  if (shouldEditMediaKitApiKey) {
    const mediaKitApiInput = elements.settingsModalContent.querySelector(".settings-mediakit-api-key-input");
    const saveMediaKitButton = elements.settingsModalContent.querySelector(".settings-save-mediakit-api-button");
    const cancelMediaKitButton = elements.settingsModalContent.querySelector(".settings-cancel-mediakit-api-button");

    saveMediaKitButton?.addEventListener("click", () => {
      state.settings.mediaKitApiKey = mediaKitApiInput.value.trim();
      uiState.isEditingMediaKitApiKey = false;
      queuePersistState(state.settings.mediaKitApiKey ? "AI MediaKit API Key 已本地保存。" : "AI MediaKit API Key 已清空，将改用服务端环境变量。");
      renderSettingsModal();
    });

    cancelMediaKitButton?.addEventListener("click", () => {
      uiState.isEditingMediaKitApiKey = false;
      renderSettingsModal();
    });
  }

  elements.settingsModalContent.querySelectorAll(".secure-value").forEach((secureValue) => {
    ["copy", "cut", "dragstart", "contextmenu"].forEach((eventName) => {
      secureValue.addEventListener(eventName, (event) => {
        event.preventDefault();
      });
    });
    secureValue.addEventListener("selectstart", (event) => {
      event.preventDefault();
    });
  });

  elements.settingsModalContent.querySelector(".settings-edit-api-button")?.addEventListener("click", () => {
    uiState.isEditingApiKey = true;
    renderSettingsModal();
  });

  elements.settingsModalContent.querySelector(".settings-edit-video-api-button")?.addEventListener("click", () => {
    uiState.isEditingVideoApiKey = true;
    renderSettingsModal();
  });

  elements.settingsModalContent.querySelector(".settings-edit-mediakit-api-button")?.addEventListener("click", () => {
    uiState.isEditingMediaKitApiKey = true;
    renderSettingsModal();
  });
}

function maskApiKey(apiKey) {
  if (!apiKey) {
    return "";
  }

  if (apiKey.length <= 8) {
    return `${apiKey.slice(0, 2)}••••`;
  }

  return `${apiKey.slice(0, 4)}••••••••${apiKey.slice(-4)}`;
}

function exportWorkspace() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "shot-prompt-workspace",
    workspace: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shot-prompt-workspace-${formatExportTime(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus("工作区已导出。");
}

function exportFavorites(favoriteIds) {
  const targetIds = [...new Set((favoriteIds || []).filter(Boolean))];
  if (!targetIds.length) {
    setStatus("请先选择要导出的收藏。");
    return;
  }

  const favorites = targetIds
    .map((favoriteId) => state.favorites.find((item) => item.id === favoriteId))
    .filter(Boolean);
  if (!favorites.length) {
    setStatus("未找到可导出的收藏。");
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    app: "shot-prompt-favorites",
    favorites,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shot-prompt-favorites-${formatExportTime(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus(`已导出 ${favorites.length} 个收藏。`);
}

function exportAllPrompts() {
  const content = state.shots
    .map((shot, index) => {
      const title = shot.title.trim() || `Shot ${String(index + 1).padStart(2, "0")}`;
      return [
        `# ${title}`,
        shot.directorNotes ? `导演讲戏：${shot.directorNotes}` : "",
        "",
        shot.currentPrompt.trim() || "暂无 Prompt",
        "",
      ].filter(Boolean).join("\n");
    })
    .join("\n\n");

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shot-prompts-${formatExportTime(new Date())}.md`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus("全部 Prompt 已导出。");
}

async function importWorkspace(file) {
  const text = await readTextFile(file);
  let payload;

  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error("导入文件不是有效的 JSON。");
  }

  const imported = payload?.workspace || payload;
  const normalized = normalizeState(imported);
  if (!normalized.shots.length) {
    throw new Error("导入文件中没有可用镜头数据。");
  }

  return normalized.shots;
}

async function importFavorites(file) {
  const text = await readTextFile(file);
  let payload;

  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error("导入文件不是有效的 JSON。");
  }

  const importedFavorites = Array.isArray(payload?.favorites)
    ? payload.favorites
    : Array.isArray(payload)
      ? payload
      : [];

  return importedFavorites.map((item) => {
    const favorite = normalizeFavorite(item);
    favorite.id = crypto.randomUUID();
    favorite.shotId = "";
    favorite.references = (favorite.references || []).map((ref) => ({
      ...ref,
      id: crypto.randomUUID(),
    }));
    return favorite;
  });
}

function formatExportTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("读取导入文件失败。"));
    reader.readAsText(file);
  });
}

async function optimizeImageFile(file) {
  if (!isProbablyImageFile(file)) {
    throw new Error("请选择可识别的图片文件。");
  }

  const image = await loadImageFromFile(file);
  const { width, height } = getOptimizedImageSize(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("浏览器不支持图片压缩。");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvasToDataUrl(canvas, IMAGE_OUTPUT_MIME, IMAGE_OUTPUT_QUALITY);
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("图片解码失败。请尝试 JPG、PNG 或 WebP。"));
      image.src = String(reader.result || "");
    };
    reader.onerror = () => reject(new Error("读取图片失败。"));
    reader.readAsDataURL(file);
  });
}

function getOptimizedImageSize(width, height) {
  const longestSide = Math.max(width, height);
  if (!longestSide || longestSide <= IMAGE_MAX_DIMENSION) {
    return { width, height };
  }

  const scale = IMAGE_MAX_DIMENSION / longestSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToDataUrl(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("图片压缩失败。"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("图片压缩结果读取失败。"));
      reader.readAsDataURL(blob);
    }, mimeType, quality);
  });
}

function setButtonLoading(button, label) {
  button.disabled = true;
  if (!button.dataset.originalLabel) {
    button.dataset.originalLabel = button.textContent;
  }
  button.textContent = label;
}

function resetButtonLoading(button, fallbackLabel) {
  button.disabled = false;
  button.textContent = button.dataset.originalLabel || fallbackLabel;
  delete button.dataset.originalLabel;
}

function bindEnhanceEvents() {
  if (!elements.enhanceView) {
    return;
  }

  const form = uiState.enhanceForm;

  elements.enhanceVideoUrl.addEventListener("input", (event) => {
    form.videoUrl = event.target.value;
  });
  elements.enhanceScene.addEventListener("change", (event) => {
    form.scene = event.target.value;
  });
  elements.enhanceToolVersion.addEventListener("change", (event) => {
    form.toolVersion = event.target.value;
  });
  elements.enhanceResolutionMode.addEventListener("change", (event) => {
    form.resolutionMode = event.target.value;
    updateEnhanceResolutionFields();
  });
  elements.enhanceResolution.addEventListener("change", (event) => {
    form.resolution = event.target.value;
  });
  elements.enhanceResolutionLimit.addEventListener("input", (event) => {
    form.resolutionLimit = event.target.value;
  });
  elements.enhanceFps.addEventListener("input", (event) => {
    form.fps = event.target.value;
  });

  elements.enhanceSubmitButton.addEventListener("click", (event) => {
    handleSubmitEnhanceTask(event.currentTarget);
  });

  elements.enhanceRefreshAllButton.addEventListener("click", async () => {
    const pending = state.enhanceTasks.filter((task) => !isVideoTaskFinished(task.status));
    if (!pending.length) {
      setEnhanceStatus("所有任务都已经完成，没有需要刷新的。");
      return;
    }
    setEnhanceStatus(`正在刷新 ${pending.length} 个任务状态...`);
    await Promise.all(pending.map((task) => refreshEnhanceTaskStatus(task.id, { silent: true })));
  });

  elements.enhanceClearFinishedButton.addEventListener("click", async () => {
    const keep = state.enhanceTasks.filter((task) => !isVideoTaskFinished(task.status));
    if (keep.length === state.enhanceTasks.length) {
      setEnhanceStatus("暂无已完成 / 失败任务可清理。");
      return;
    }
    state.enhanceTasks = keep;
    await persistState("已清空已完成的增强任务。");
    renderEnhanceView();
  });
}

function updateEnhanceResolutionFields() {
  const mode = uiState.enhanceForm.resolutionMode;
  elements.enhanceResolutionPresetField.hidden = mode !== "preset";
  elements.enhanceResolutionLimitField.hidden = mode !== "limit";
}

function setEnhanceStatus(message) {
  if (elements.enhanceStatusText) {
    elements.enhanceStatusText.textContent = message;
  }
  setStatus(message);
}

function renderEnhanceView() {
  const form = uiState.enhanceForm;
  elements.enhanceVideoUrl.value = form.videoUrl || "";
  elements.enhanceScene.value = form.scene || "";
  elements.enhanceToolVersion.value = form.toolVersion || "standard";
  elements.enhanceResolutionMode.value = form.resolutionMode || "preset";
  elements.enhanceResolution.value = form.resolution || "1080p";
  elements.enhanceResolutionLimit.value = form.resolutionLimit || "";
  elements.enhanceFps.value = form.fps || "";
  updateEnhanceResolutionFields();

  const tasks = [...state.enhanceTasks].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  elements.enhanceTaskCount.textContent = String(state.enhanceTasks.length);
  elements.enhanceSucceededCount.textContent = String(state.enhanceTasks.filter((t) => t.status === "succeeded").length);
  elements.enhanceHistoryMeta.textContent = tasks.length ? `共 ${tasks.length} 条记录` : "暂无任务";

  const container = elements.enhanceTaskList;
  container.innerHTML = "";

  if (!tasks.length) {
    container.innerHTML = '<div class="empty-state">还没有提交过画质增强任务。填写表单后点击"提交画质增强任务"即可开始。</div>';
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = `enhance-task-card status-${task.status}`;
    card.dataset.enhanceTaskId = task.id;

    const finished = isVideoTaskFinished(task.status);
    const statusLabel = getVideoStatusText(task.status);
    const params = task.params || {};
    const result = task.result || {};
    const summary = task.requestSummary || summarizeEnhanceParams(params) || "—";

    card.innerHTML = `
      <header class="enhance-task-header">
        <div class="enhance-task-status">
          <span class="status-chip status-${escapeHtml(task.status)}">${escapeHtml(statusLabel)}</span>
          <span class="meta">提交于 ${escapeHtml(formatTime(task.createdAt))}</span>
        </div>
        <div class="enhance-task-meta">
          <span class="meta">${escapeHtml(summary)}</span>
          ${task.taskId ? `<span class="meta enhance-task-id">ID: ${escapeHtml(task.taskId)}</span>` : ""}
        </div>
      </header>
      <div class="enhance-task-body">
        <p class="enhance-task-source">
          <span class="meta">源视频：</span>
          <a href="${escapeHtml(params.video_url || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(params.video_url || "—")}</a>
        </p>
        ${task.error ? `<p class="enhance-task-error">${escapeHtml(task.error)}</p>` : ""}
        ${task.videoUrl ? `
          <div class="enhance-task-result">
            <video class="enhance-task-video" src="${escapeHtml(task.videoUrl)}" ${task.localFileName ? `data-local-filename="${escapeHtml(task.localFileName)}"` : ""} controls playsinline></video>
            <div class="enhance-task-result-meta">
              ${result.resolution ? `<span class="meta">输出 ${escapeHtml(result.resolution)}</span>` : ""}
              ${result.toolVersion ? `<span class="meta">${escapeHtml(result.toolVersion)}</span>` : ""}
              ${Number.isFinite(Number(result.duration)) ? `<span class="meta">时长 ${Number(result.duration).toFixed(2)}s</span>` : ""}
              ${Number.isFinite(Number(result.fps)) ? `<span class="meta">${Number(result.fps).toFixed(2)} fps</span>` : ""}
              ${result.expiresAt ? `<span class="meta">链接有效期至 ${escapeHtml(formatUnixTime(result.expiresAt))}</span>` : ""}
              ${task.localFileName ? `<span class="meta">已保存本地：${escapeHtml(task.localFileName)}</span>` : ""}
            </div>
          </div>
        ` : ""}
      </div>
      <footer class="enhance-task-footer card-actions">
        ${task.videoUrl ? `<a class="ghost-button" href="${escapeHtml(task.videoUrl)}" target="_blank" rel="noopener noreferrer" download>下载增强视频</a>` : ""}
        ${task.videoUrl ? `<button class="ghost-button enhance-copy-url-button" type="button">复制结果链接</button>` : ""}
        ${params.video_url ? `<button class="ghost-button enhance-reuse-button" type="button">用同一条源视频重建</button>` : ""}
        <button class="ghost-button enhance-refresh-button" type="button" ${finished ? "disabled" : ""}>${finished ? "已结束" : "刷新状态"}</button>
        <button class="ghost-button enhance-delete-button danger" type="button">删除</button>
      </footer>
    `;

    card.querySelector(".enhance-refresh-button")?.addEventListener("click", () => {
      refreshEnhanceTaskStatus(task.id, { silent: false });
    });
    card.querySelector(".enhance-delete-button")?.addEventListener("click", async () => {
      state.enhanceTasks = state.enhanceTasks.filter((t) => t.id !== task.id);
      stopEnhancePolling(task.id);
      await persistState("已删除增强任务。");
      renderEnhanceView();
    });
    card.querySelector(".enhance-copy-url-button")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(task.videoUrl);
        setEnhanceStatus("已复制结果链接到剪贴板。");
      } catch (error) {
        setEnhanceStatus("复制失败，请手动选中链接。");
      }
    });
    card.querySelector(".enhance-reuse-button")?.addEventListener("click", () => {
      const form = uiState.enhanceForm;
      form.videoUrl = params.video_url || "";
      form.scene = params.scene || form.scene;
      form.toolVersion = params.tool_version || form.toolVersion;
      if (params.resolution) {
        form.resolutionMode = "preset";
        form.resolution = params.resolution;
      } else if (params.resolution_limit) {
        form.resolutionMode = "limit";
        form.resolutionLimit = String(params.resolution_limit);
      }
      if (Number.isFinite(Number(params.fps))) {
        form.fps = String(params.fps);
      }
      renderEnhanceView();
      elements.enhanceVideoUrl.focus();
    });

    container.append(card);
  });
  hydrateLocalVideoElements(container);
}

function formatUnixTime(seconds) {
  if (!Number.isFinite(Number(seconds))) return "";
  return formatTime(new Date(Number(seconds) * 1000).toISOString());
}

async function handleSubmitEnhanceTask(button) {
  const form = uiState.enhanceForm;
  const videoUrl = String(form.videoUrl || "").trim();
  if (!videoUrl) {
    setEnhanceStatus("请先填写源视频 URL。");
    return;
  }
  if (!/^https?:\/\//i.test(videoUrl)) {
    setEnhanceStatus("视频 URL 必须是公网可访问的 http(s) 地址。");
    return;
  }

  const params = {
    video_url: videoUrl,
    scene: form.scene || "",
    tool_version: form.toolVersion || "",
  };

  if (form.resolutionMode === "preset") {
    params.resolution = form.resolution || "";
  } else if (form.resolutionMode === "limit") {
    const limit = Number.parseInt(form.resolutionLimit, 10);
    if (!Number.isFinite(limit) || limit < 64 || limit > 2160) {
      setEnhanceStatus("短边像素值需要在 64 到 2160 之间。");
      return;
    }
    params.resolution_limit = limit;
  }

  if (form.fps !== "" && form.fps !== null && form.fps !== undefined) {
    const fps = Number.parseInt(form.fps, 10);
    if (!Number.isFinite(fps) || fps < 1 || fps > 120) {
      setEnhanceStatus("帧率范围应为 1 ~ 120。");
      return;
    }
    params.fps = fps;
  }

  const originalLabel = button.textContent;
  try {
    setButtonLoading(button, "提交任务中...");
    const apiKey = getCurrentMediaKitApiKey();
    const baseUrl = normalizeMediaKitProvider(state.settings.mediaKitProvider).baseUrl;

    let response;
    try {
      response = await fetch(ENHANCE_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          baseUrl,
          ...params,
        }),
      });
    } catch (fetchError) {
      throw new Error(
        "无法连接到 /api/enhance-video。请确认本地开发服务器已经重启（node dev-server.js），"
          + "或部署环境下已经包含画质增强接口。" + (fetchError?.message ? `（${fetchError.message}）` : "")
      );
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `提交画质增强任务失败（${response.status}）`);
    }
    const taskId = String(result.taskId || "");
    const taskStatus = normalizeVideoStatus(result.status || "queued");
    const origin = result.origin || "ai-mediakit";
    const requestSummary = result.requestSummary || summarizeEnhanceParams(params);

    const task = normalizeEnhanceTask({
      taskId,
      status: taskStatus,
      origin,
      requestSummary,
      params,
    });
    state.enhanceTasks.unshift(task);
    await persistState("画质增强任务已提交，正在轮询结果。");
    renderEnhanceView();
    startEnhancePolling(task.id);
  } catch (error) {
    setEnhanceStatus(error.message || "提交画质增强任务失败。");
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

async function refreshEnhanceTaskStatus(taskLocalId, options = {}) {
  const { silent = true } = options;
  const task = state.enhanceTasks.find((t) => t.id === taskLocalId);
  if (!task || !task.taskId) return;

  try {
    const apiKey = getCurrentMediaKitApiKey();
    const baseUrl = normalizeMediaKitProvider(state.settings.mediaKitProvider).baseUrl;
    const url = `${ENHANCE_TASK_BASE_URL}/${encodeURIComponent(task.taskId)}?baseUrl=${encodeURIComponent(baseUrl)}`;
    const response = await fetch(url, {
      headers: { "x-mediakit-api-key": apiKey || "" },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `刷新画质增强任务失败（${response.status}）`);
    }

    const nextStatus = normalizeVideoStatus(result.status || task.status);
    task.status = nextStatus;
    task.videoUrl = String(result.videoUrl || task.videoUrl || "");
    task.error = String(result.error || "");
    task.updatedAt = new Date().toISOString();
    task.result = {
      resolution: String(result.resolution || task.result?.resolution || ""),
      toolVersion: String(result.toolVersion || task.result?.toolVersion || ""),
      duration: Number.isFinite(Number(result.duration)) ? Number(result.duration) : task.result?.duration || null,
      fps: Number.isFinite(Number(result.fps)) ? Number(result.fps) : task.result?.fps || null,
      expiresAt: Number.isFinite(Number(result.expiresAt)) ? Number(result.expiresAt) : task.result?.expiresAt || null,
      finishedAt: Number.isFinite(Number(result.finishedAt)) ? Number(result.finishedAt) : task.result?.finishedAt || null,
    };

    if (isVideoTaskFinished(nextStatus)) {
      stopEnhancePolling(task.id);
    }

    await persistState(result.message || getVideoStatusMessage(nextStatus));
    renderEnhanceView();

    if (nextStatus === "succeeded") {
      autoSaveEnhanceVideoToLocal(task);
    }
  } catch (error) {
    stopEnhancePolling(task.id);
    task.status = "failed";
    task.error = error.message || "获取画质增强任务状态失败。";
    task.updatedAt = new Date().toISOString();
    await persistState("画质增强任务状态刷新失败。");
    renderEnhanceView();
    if (!silent) {
      setEnhanceStatus(error.message || "获取画质增强任务状态失败。");
    }
  }
}

function startEnhancePolling(taskLocalId) {
  stopEnhancePolling(taskLocalId);
  const timerId = window.setInterval(async () => {
    const task = state.enhanceTasks.find((t) => t.id === taskLocalId);
    if (!task?.taskId || isVideoTaskFinished(task.status)) {
      stopEnhancePolling(taskLocalId);
      return;
    }
    await refreshEnhanceTaskStatus(taskLocalId);
  }, ENHANCE_POLL_INTERVAL_MS);
  enhancePollTimers.set(taskLocalId, timerId);
}

function stopEnhancePolling(taskLocalId) {
  const timerId = enhancePollTimers.get(taskLocalId);
  if (!timerId) return;
  window.clearInterval(timerId);
  enhancePollTimers.delete(taskLocalId);
}

function resumePendingEnhanceTasks() {
  state.enhanceTasks.forEach((task) => {
    if (task.taskId && ["queued", "running"].includes(normalizeVideoStatus(task.status))) {
      startEnhancePolling(task.id);
    }
  });
}

function bindUnderstandEvents() {
  if (!elements.understandView) return;
  const form = uiState.understandForm;

  elements.understandVideoUrl.addEventListener("input", (event) => {
    form.videoUrl = event.target.value;
  });
  elements.understandPrompt.addEventListener("input", (event) => {
    form.prompt = event.target.value;
  });
  elements.understandModel.addEventListener("input", (event) => {
    form.model = event.target.value;
  });
  elements.understandFps.addEventListener("input", (event) => {
    form.fps = event.target.value;
  });
  elements.understandMaxFrames.addEventListener("input", (event) => {
    form.maxFrames = event.target.value;
  });
  elements.understandMaxPixels.addEventListener("input", (event) => {
    form.maxPixels = event.target.value;
  });

  elements.understandSubmitButton.addEventListener("click", (event) => {
    handleSubmitUnderstandTask(event.currentTarget);
  });

  elements.understandClearButton.addEventListener("click", async () => {
    if (!state.understandTasks.length) {
      setUnderstandStatus("暂无视频理解记录。");
      return;
    }
    state.understandTasks = [];
    await persistState("已清空视频理解历史。");
    renderUnderstandView();
  });
}

function setUnderstandStatus(message) {
  if (elements.understandStatusText) {
    elements.understandStatusText.textContent = message;
  }
  setStatus(message);
}

function renderUnderstandView() {
  const form = uiState.understandForm;
  const provider = normalizeUnderstandProvider(state.settings.understandProvider);
  elements.understandVideoUrl.value = form.videoUrl || "";
  elements.understandPrompt.value = form.prompt || "";
  elements.understandModel.value = form.model || provider.model || "";
  elements.understandFps.value = form.fps || "";
  elements.understandMaxFrames.value = form.maxFrames || "";
  elements.understandMaxPixels.value = form.maxPixels || "";

  const tasks = [...state.understandTasks].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  elements.understandTaskCount.textContent = String(state.understandTasks.length);
  elements.understandSucceededCount.textContent = String(state.understandTasks.filter((t) => t.status === "succeeded").length);
  elements.understandHistoryMeta.textContent = tasks.length ? `共 ${tasks.length} 条记录` : "暂无记录";

  const container = elements.understandTaskList;
  container.innerHTML = "";

  if (!tasks.length) {
    container.innerHTML = '<div class="empty-state">还没有提交过视频理解任务。填写视频 URL 和提示词后点击"提交视频理解"即可开始。</div>';
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = `enhance-task-card status-${task.status}`;
    card.dataset.understandTaskId = task.id;

    const statusLabel = getVideoStatusText(task.status);
    const params = task.params || {};
    const summary = [
      params.prompt ? `提问：${truncateText(params.prompt, 40)}` : "",
      task.model ? `模型 ${task.model}` : "",
      Number.isFinite(Number(params.fps)) ? `fps ${params.fps}` : "",
      Number.isFinite(Number(params.maxFrames)) ? `max_frames ${params.maxFrames}` : "",
      Number.isFinite(Number(params.maxPixels)) ? `max_pixels ${params.maxPixels}` : "",
    ].filter(Boolean).join(" · ") || "—";

    const usage = task.usage || {};
    const usageBits = [
      Number.isFinite(Number(usage.prompt_tokens)) ? `输入 ${usage.prompt_tokens}` : "",
      Number.isFinite(Number(usage.completion_tokens)) ? `输出 ${usage.completion_tokens}` : "",
      Number.isFinite(Number(usage.total_tokens)) ? `合计 ${usage.total_tokens}` : "",
    ].filter(Boolean).join(" · ");

    card.innerHTML = `
      <header class="enhance-task-header">
        <div class="enhance-task-status">
          <span class="status-chip status-${escapeHtml(task.status)}">${escapeHtml(statusLabel)}</span>
          <span class="meta">提交于 ${escapeHtml(formatTime(task.createdAt))}</span>
        </div>
        <div class="enhance-task-meta">
          <span class="meta">${escapeHtml(summary)}</span>
        </div>
      </header>
      <div class="enhance-task-body">
        <p class="enhance-task-source">
          <span class="meta">源视频：</span>
          <a href="${escapeHtml(params.videoUrl || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(params.videoUrl || "—")}</a>
        </p>
        ${task.error ? `<p class="enhance-task-error">${escapeHtml(task.error)}</p>` : ""}
        ${task.answer ? `
          <div class="understand-answer">
            <h4>模型回复</h4>
            <pre class="understand-answer-text">${escapeHtml(task.answer)}</pre>
          </div>
        ` : ""}
        ${usageBits ? `<p class="meta">Token 消耗：${escapeHtml(usageBits)}</p>` : ""}
      </div>
      <footer class="enhance-task-footer card-actions">
        ${task.answer ? `<button class="ghost-button understand-copy-answer-button" type="button">复制回复</button>` : ""}
        ${params.videoUrl ? `<button class="ghost-button understand-reuse-button" type="button">重用此条参数</button>` : ""}
        <button class="ghost-button understand-delete-button danger" type="button">删除</button>
      </footer>
    `;

    card.querySelector(".understand-copy-answer-button")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(task.answer);
        setUnderstandStatus("已复制模型回复到剪贴板。");
      } catch (error) {
        setUnderstandStatus("复制失败，请手动选中文字。");
      }
    });
    card.querySelector(".understand-reuse-button")?.addEventListener("click", () => {
      const nextForm = uiState.understandForm;
      nextForm.videoUrl = params.videoUrl || "";
      nextForm.prompt = params.prompt || "";
      nextForm.model = task.model || nextForm.model;
      nextForm.fps = Number.isFinite(Number(params.fps)) ? String(params.fps) : "";
      nextForm.maxFrames = Number.isFinite(Number(params.maxFrames)) ? String(params.maxFrames) : "";
      nextForm.maxPixels = Number.isFinite(Number(params.maxPixels)) ? String(params.maxPixels) : "";
      renderUnderstandView();
      elements.understandPrompt.focus();
    });
    card.querySelector(".understand-delete-button")?.addEventListener("click", async () => {
      state.understandTasks = state.understandTasks.filter((t) => t.id !== task.id);
      await persistState("已删除视频理解记录。");
      renderUnderstandView();
    });

    container.append(card);
  });
}

function truncateText(text, max) {
  const value = String(text || "");
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1))}…`;
}

async function handleSubmitUnderstandTask(button) {
  const form = uiState.understandForm;
  const provider = normalizeUnderstandProvider(state.settings.understandProvider);
  const videoUrl = String(form.videoUrl || "").trim();
  const prompt = String(form.prompt || "").trim();
  const model = String(form.model || provider.model || "").trim();

  if (!videoUrl) {
    setUnderstandStatus("请先填写源视频 URL。");
    return;
  }
  if (!/^https?:\/\//i.test(videoUrl)) {
    setUnderstandStatus("视频 URL 必须是公网可访问的 http(s) 地址。");
    return;
  }
  if (!prompt) {
    setUnderstandStatus("请填写提示词 / 问题。");
    return;
  }
  if (!model) {
    setUnderstandStatus("请填写火山方舟模型 ID。");
    return;
  }

  const arkApiKey = getCurrentVideoApiKey();
  const mediaKitApiKey = getCurrentMediaKitApiKey();
  if (!arkApiKey) {
    setUnderstandStatus("请先在设置里填写 Seedance / ARK API Key（用于视频理解的火山方舟鉴权）。");
    return;
  }
  if (!mediaKitApiKey) {
    setUnderstandStatus("请先在设置里填写 AI MediaKit API Key。");
    return;
  }

  const params = { videoUrl, prompt };
  let fps;
  if (form.fps !== "" && form.fps !== null && form.fps !== undefined) {
    fps = Number(form.fps);
    if (!Number.isFinite(fps) || fps < 0.01 || fps > 5) {
      setUnderstandStatus("fps 范围应为 0.01 ~ 5。");
      return;
    }
    params.fps = fps;
  }
  let maxFrames;
  if (form.maxFrames !== "" && form.maxFrames !== null && form.maxFrames !== undefined) {
    maxFrames = Number.parseInt(form.maxFrames, 10);
    if (!Number.isFinite(maxFrames) || maxFrames < 1) {
      setUnderstandStatus("max_frames 需要大于等于 1 的整数。");
      return;
    }
    params.maxFrames = maxFrames;
  }
  let maxPixels;
  if (form.maxPixels !== "" && form.maxPixels !== null && form.maxPixels !== undefined) {
    maxPixels = Number.parseInt(form.maxPixels, 10);
    if (!Number.isFinite(maxPixels) || maxPixels < 1) {
      setUnderstandStatus("max_pixels 需要大于等于 1 的整数。");
      return;
    }
    params.maxPixels = maxPixels;
  }

  const originalLabel = button.textContent;
  try {
    setButtonLoading(button, "请求中，视频较长时请耐心等待...");
    setUnderstandStatus("视频理解请求已发出，正在抽帧并推理...");

    let response;
    try {
      response = await fetch(UNDERSTAND_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arkApiKey,
          mediaKitApiKey,
          baseUrl: provider.baseUrl,
          model,
          prompt,
          videoUrl,
          fps,
          max_frames: maxFrames,
          max_pixels: maxPixels,
        }),
      });
    } catch (fetchError) {
      throw new Error(
        "无法连接到 /api/understand-video。请确认本地开发服务器已经重启（node dev-server.js），"
          + "或部署环境下已经包含视频理解接口。" + (fetchError?.message ? `（${fetchError.message}）` : "")
      );
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `视频理解请求失败（${response.status}）`);
    }

    const task = normalizeUnderstandTask({
      status: "succeeded",
      answer: String(result.answer || ""),
      model: String(result.model || model),
      usage: result.usage || null,
      params,
    });
    state.understandTasks.unshift(task);
    await persistState("视频理解已完成。");
    setUnderstandStatus("视频理解已完成。");
    renderUnderstandView();
  } catch (error) {
    const task = normalizeUnderstandTask({
      status: "failed",
      error: error.message || "视频理解失败。",
      model,
      params,
    });
    state.understandTasks.unshift(task);
    await persistState("视频理解失败。");
    setUnderstandStatus(error.message || "视频理解失败。");
    renderUnderstandView();
  } finally {
    resetButtonLoading(button, originalLabel);
  }
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
