import {
  exportLearningData,
  getLastDays,
  getSettings,
  getStats,
  importCustomWords,
  resetAllData,
  saveSettings
} from "../store.js";
import { createPage, downloadJSON, escapeHtml } from "../ui.js";

const importSample = `[
  {
    "word": "serendipity",
    "phonetic": "/ˌserənˈdɪpəti/",
    "pos": "n.",
    "meaning": "意外发现美好事物的运气",
    "example": "Meeting her was pure serendipity.",
    "exampleCn": "遇见她纯属美丽的意外。",
    "level": "自定义"
  }
]`;

export function renderProfile({ rerender, showToast }) {
  const page = createPage("profile-page");

  function draw() {
    const settings = getSettings();
    const stats = getStats();
    const days = getLastDays(14);
    const maxLearned = Math.max(1, ...days.map((day) => day.learned || 0));

    page.innerHTML = `
      <div class="stack">
        <div>
          <h1 class="page-title">我的</h1>
          <p class="subtitle">学习设置和数据备份</p>
        </div>

        <section class="card panel profile-stats">
          <div>
            <strong>${stats.days}</strong>
            <span>学习天数</span>
          </div>
          <div>
            <strong>${stats.learned}</strong>
            <span>总学习词数</span>
          </div>
          <div>
            <strong>${stats.masteryRate}%</strong>
            <span>掌握率</span>
          </div>
          <div>
            <strong>${stats.averageQuiz}</strong>
            <span>平均测验分</span>
          </div>
        </section>

        <section class="card panel chart-card">
          <div class="top-row">
            <h2>最近 14 天</h2>
            <span class="tag green">学习柱状图</span>
          </div>
          <div class="bar-chart">
            ${days
              .map(
                (day) => `
                  <span title="${day.date}: ${day.learned || 0}" style="height: ${Math.max(8, ((day.learned || 0) / maxLearned) * 92)}%">
                    <i>${day.learned || 0}</i>
                  </span>
                `
              )
              .join("")}
          </div>
        </section>

        <section>
          <p class="section-label">设置</p>
          <div class="card settings-list">
            <div class="setting-row tall">
              <span>每日目标</span>
              <div class="segmented compact" data-setting="dailyGoal">
                ${[10, 20, 30, 50]
                  .map((value) => `<button class="${settings.dailyGoal === value ? "active" : ""}" data-value="${value}">${value}</button>`)
                  .join("")}
              </div>
            </div>

            <div class="setting-row tall">
              <span>主题</span>
              <div class="segmented compact" data-setting="theme">
                ${[
                  ["auto", "系统"],
                  ["light", "浅色"],
                  ["dark", "深色"]
                ]
                  .map(([value, label]) => `<button class="${settings.theme === value ? "active" : ""}" data-value="${value}">${label}</button>`)
                  .join("")}
              </div>
            </div>

            <div class="setting-row">
              <span>发音</span>
              <button class="toggle ${settings.ttsEnabled ? "on" : ""}" data-toggle="ttsEnabled" aria-label="切换发音"><span></span></button>
            </div>

            <div class="setting-row">
              <span>音效</span>
              <button class="toggle ${settings.sfxEnabled ? "on" : ""}" data-toggle="sfxEnabled" aria-label="切换音效"><span></span></button>
            </div>

            <div class="setting-row tall">
              <span>词书选择</span>
              <div class="segmented compact" data-setting="wordSource">
                ${[
                  ["cet4", "CET4"],
                  ["cet6", "CET6"],
                  ["ielts", "雅思"],
                  ["all", "全部"]
                ]
                  .map(([value, label]) => `<button class="${settings.wordSource === value ? "active" : ""}" data-value="${value}">${label}</button>`)
                  .join("")}
              </div>
            </div>

            <button class="setting-row action" data-action="toggle-import">
              <span>导入词库</span>
              <strong>粘贴 JSON</strong>
            </button>

            <button class="setting-row action" data-action="export">
              <span>导出学习数据</span>
              <strong>下载 JSON</strong>
            </button>

            <button class="setting-row action danger-text" data-action="reset">
              <span>重置所有数据</span>
              <strong>二次确认</strong>
            </button>
          </div>
        </section>

        <section class="card panel import-panel hidden">
          <h2>导入自定义词库</h2>
          <p>字段需包含 word、phonetic、pos、meaning、example、exampleCn。</p>
          <textarea spellcheck="false" placeholder="${escapeHtml(importSample)}"></textarea>
          <button class="primary-button" data-action="import">确认导入</button>
        </section>
      </div>
    `;

    page.querySelectorAll("[data-setting]").forEach((group) => {
      group.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const key = group.dataset.setting;
          const rawValue = button.dataset.value;
          const value = key === "dailyGoal" ? Number(rawValue) : rawValue;
          saveSettings({ [key]: value });
          showToast("设置已保存");
          draw();
        });
      });
    });

    page.querySelectorAll("[data-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.toggle;
        saveSettings({ [key]: !getSettings()[key] });
        draw();
      });
    });

    page.querySelector('[data-action="toggle-import"]').addEventListener("click", () => {
      page.querySelector(".import-panel").classList.toggle("hidden");
    });

    page.querySelector('[data-action="export"]').addEventListener("click", () => {
      downloadJSON("vocab-learning-data.json", exportLearningData());
      showToast("学习数据已导出");
    });

    page.querySelector('[data-action="reset"]').addEventListener("click", () => {
      if (!window.confirm("确定要重置所有学习数据吗？")) return;
      if (!window.confirm("再次确认：这会清空进度、打卡和自定义词库。")) return;
      resetAllData();
      showToast("数据已重置");
      rerender();
    });

    page.querySelector('[data-action="import"]').addEventListener("click", () => {
      const textarea = page.querySelector("textarea");
      try {
        const result = importCustomWords(textarea.value);
        textarea.value = "";
        showToast(`导入 ${result.imported} 个，跳过 ${result.skipped} 个重复词`);
        draw();
      } catch (error) {
        showToast(error.message);
      }
    });
  }

  draw();
  return page;
}
