import { formatDateCn, getLastDays, getSettings, getStats, getStreak, getTodayState, todayKey } from "../store.js";
import { createPage } from "../ui.js";

export function renderHome({ navigate }) {
  const settings = getSettings();
  const today = getTodayState();
  const stats = getStats();
  const streak = getStreak();
  const learnedToday = today.learnedIds.length;
  const goal = settings.dailyGoal;
  const progress = Math.min(1, learnedToday / goal);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - progress);
  const days = getLastDays(7);

  const page = createPage("home-page");
  page.innerHTML = `
    <div class="top-row">
      <div>
        <h1 class="page-title">背单词</h1>
        <p class="subtitle">${formatDateCn()}</p>
      </div>
      <span class="tag orange">${settings.wordSource === "all" ? "全部词书" : settings.wordSource.toUpperCase()}</span>
    </div>

    <div class="stack home-stack">
      <section class="card panel progress-card">
        <div class="ring-wrap">
          <svg class="progress-ring" viewBox="0 0 128 128" aria-label="今日学习进度">
            <circle class="track" cx="64" cy="64" r="54"></circle>
            <circle class="value" cx="64" cy="64" r="54"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashOffset}"></circle>
          </svg>
          <div class="ring-copy">
            <strong>${learnedToday}</strong>
            <span>/ ${goal}</span>
          </div>
        </div>
        <div class="progress-copy">
          <h2>今日进度</h2>
          <p>${learnedToday >= goal ? "今天的任务已经完成，保持节奏。" : `还差 ${goal - learnedToday} 个词完成目标。`}</p>
          <div class="button-row">
            <button class="primary-button" data-action="study">开始学习</button>
            <button class="secondary-button" data-action="quiz">每日测验</button>
          </div>
        </div>
      </section>

      <section class="card panel streak-card">
        <div>
          <span class="fire">🔥</span>
          <strong>${streak} 天</strong>
          <p>连续打卡</p>
        </div>
        <div class="day-dots" aria-label="最近 7 天">
          ${days
            .map((day) => {
              const isToday = day.date === todayKey();
              const done = (day.learned || 0) > 0;
              return `<span class="${done ? "done" : ""} ${isToday ? "today" : ""}" title="${day.date}"></span>`;
            })
            .join("")}
        </div>
      </section>

      <section>
        <p class="section-label">数据速览</p>
        <div class="metric-grid">
          <div class="metric"><strong>${stats.learned}</strong><span>累计已学</span></div>
          <div class="metric"><strong>${stats.mastered}</strong><span>已掌握</span></div>
          <div class="metric"><strong>${stats.due}</strong><span>待复习</span></div>
        </div>
      </section>
    </div>
  `;

  page.querySelector('[data-action="study"]').addEventListener("click", () => navigate("/study"));
  page.querySelector('[data-action="quiz"]').addEventListener("click", () => navigate("/quiz"));

  return page;
}
