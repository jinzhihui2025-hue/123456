import { getRecord, getWordById, setLearning, setMastered } from "../store.js";
import { isTtsAvailable, speak } from "../audio.js";
import { createPage, escapeHtml, highlightWord, normalizeLevel, statusLabel } from "../ui.js";

export function renderWordDetail({ id, navigate, showToast }) {
  const page = createPage("detail-page word-detail-page");
  const word = getWordById(id);

  if (!word) {
    page.innerHTML = `
      <div class="detail-nav">
        <button class="back-button" data-action="back">‹ 返回</button>
      </div>
      <div class="empty">
        <div>
          <span class="emoji">?</span>
          <strong>没有找到这个单词</strong>
          <p>它可能来自已删除的自定义词库。</p>
        </div>
      </div>
    `;
    page.querySelector('[data-action="back"]').addEventListener("click", () => navigate("/wordbook"));
    return page;
  }

  draw();

  function draw() {
    const record = getRecord(word.id);
    const isMastered = record.status === "mastered";
    page.innerHTML = `
      <div class="detail-nav">
        <button class="back-button" data-action="back">‹ 返回</button>
        <strong>${escapeHtml(word.word)}</strong>
      </div>

      <article class="card panel detail-hero">
        <div class="top-row">
          <div>
            <h1>${escapeHtml(word.word)}</h1>
            <p>${escapeHtml(word.phonetic)}</p>
          </div>
          ${
            isTtsAvailable()
              ? `<button class="icon-button" data-action="speak" aria-label="朗读 ${escapeHtml(word.word)}">🔊</button>`
              : ""
          }
        </div>
        <div class="tag-row">
          <span class="tag orange">${escapeHtml(word.pos)}</span>
          <span class="tag">${normalizeLevel(word.level)}</span>
        </div>
        <p class="meaning">${escapeHtml(word.meaning)}</p>
      </article>

      <section class="card panel example-card">
        <p class="example">${highlightWord(word.example, word.word)}</p>
        <p class="example-cn">${escapeHtml(word.exampleCn)}</p>
      </section>

      <section>
        <p class="section-label">学习数据</p>
        <div class="card data-list">
          <div><span>状态</span><strong>${statusLabel(record.status)}</strong></div>
          <div><span>答对</span><strong>${record.correct}</strong></div>
          <div><span>答错</span><strong>${record.wrong}</strong></div>
          <div><span>下次复习</span><strong>${record.dueDate}</strong></div>
        </div>
      </section>

      <div class="button-row">
        <button class="${isMastered ? "secondary-button" : "primary-button"}" data-action="master">
          ${isMastered ? "已掌握" : "标记为已掌握"}
        </button>
        <button class="plain-button" data-action="reset">重新学习</button>
      </div>
    `;

    page.querySelector('[data-action="back"]').addEventListener("click", () => navigate("/wordbook"));

    const speakButton = page.querySelector('[data-action="speak"]');
    if (speakButton) {
      speakButton.addEventListener("click", () => speak(word.word));
    }

    page.querySelector('[data-action="master"]').addEventListener("click", () => {
      setMastered(word.id);
      showToast("已标记为掌握");
      draw();
    });

    page.querySelector('[data-action="reset"]').addEventListener("click", () => {
      setLearning(word.id);
      showToast("已重新加入学习");
      draw();
    });
  }

  return page;
}
