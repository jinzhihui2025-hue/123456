import { getAllWords, getRecord } from "../store.js";
import { createPage, escapeHtml, statusClass, statusLabel } from "../ui.js";

export function renderWordbook({ navigate }) {
  const state = { query: "", filter: "all" };
  const page = createPage("wordbook-page");
  page.innerHTML = `
    <div class="stack">
      <div>
        <h1 class="page-title">词库</h1>
        <p class="subtitle">搜索单词、释义和学习状态</p>
      </div>

      <label class="search">
        <span>⌕</span>
        <input type="search" placeholder="搜索单词或释义" autocomplete="off" />
      </label>

      <div class="segmented" role="tablist">
        <button class="active" data-filter="all">全部</button>
        <button data-filter="new">新词</button>
        <button data-filter="learning">学习中</button>
        <button data-filter="mastered">已掌握</button>
      </div>

      <div class="word-list" aria-live="polite"></div>
    </div>
  `;

  const input = page.querySelector("input");
  const list = page.querySelector(".word-list");

  input.addEventListener("input", () => {
    state.query = input.value.trim().toLowerCase();
    drawList();
  });

  page.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      page.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
      drawList();
    });
  });

  function drawList() {
    const words = getAllWords()
      .filter((word) => {
        const record = getRecord(word.id);
        if (state.filter !== "all" && record.status !== state.filter) return false;
        if (!state.query) return true;
        return `${word.word} ${word.meaning}`.toLowerCase().includes(state.query);
      })
      .slice(0, 600);

    list.replaceChildren();

    if (!words.length) {
      list.innerHTML = `
        <div class="empty card">
          <div>
            <span class="emoji">⌕</span>
            <strong>没有匹配结果</strong>
            <p>换个关键词或筛选条件试试。</p>
          </div>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    words.forEach((word) => {
      const record = getRecord(word.id);
      const row = document.createElement("button");
      row.className = "word-row";
      row.type = "button";
      row.innerHTML = `
        <span>
          <h3>${escapeHtml(word.word)}</h3>
          <p>${escapeHtml(word.phonetic)} · ${escapeHtml(word.meaning)}</p>
        </span>
        <span class="status-dot ${statusClass(record.status)}" title="${statusLabel(record.status)}"></span>
      `;
      row.addEventListener("click", () => navigate(`/word/${encodeURIComponent(word.id)}`));
      fragment.append(row);
    });
    list.append(fragment);
  }

  drawList();
  return page;
}
