import { answerWord, buildStudyQueue, getAllWords } from "../store.js";
import { isTtsAvailable, playSfx, speak } from "../audio.js";
import { createPage, escapeHtml, highlightWord, normalizeLevel } from "../ui.js";

export function renderStudy({ navigate }) {
  let queue = buildStudyQueue();
  let index = 0;
  let flipped = false;
  let known = 0;
  let unknown = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  const page = createPage("study-page");

  function draw() {
    if (!queue.length) {
      drawEmpty();
      return;
    }

    if (index >= queue.length) {
      drawComplete();
      return;
    }

    const word = queue[index];
    const total = queue.length;
    const percent = ((index + 1) / total) * 100;

    page.innerHTML = `
      <div class="study-head">
        <div class="linear-progress"><span style="width: ${percent}%"></span></div>
        <p>第 ${index + 1} / ${total} 个</p>
      </div>

      <div class="study-card-wrap">
        <article class="flash-card ${flipped ? "flipped" : ""}" data-action="flip">
          <div class="flash-inner">
            <div class="flash-face front">
              <span class="tag">${normalizeLevel(word.level)}</span>
              <h1>${escapeHtml(word.word)}</h1>
              <p>${escapeHtml(word.phonetic)}</p>
              ${
                isTtsAvailable()
                  ? `<button class="icon-button speak-button" data-action="speak" aria-label="朗读 ${escapeHtml(word.word)}">🔊</button>`
                  : ""
              }
              <small>轻点翻卡</small>
            </div>
            <div class="flash-face back">
              <div class="tag-row">
                <span class="tag orange">${escapeHtml(word.pos)}</span>
                <span class="tag">${normalizeLevel(word.level)}</span>
              </div>
              <h2>${escapeHtml(word.meaning)}</h2>
              <p class="example">${highlightWord(word.example, word.word)}</p>
              <p class="example-cn">${escapeHtml(word.exampleCn)}</p>
            </div>
          </div>
        </article>
      </div>

      <div class="study-actions">
        <button class="danger-button" data-action="unknown">✕ 不认识</button>
        <button class="success-button" data-action="known">✓ 认识</button>
      </div>
    `;

    page.querySelector('[data-action="flip"]').addEventListener("click", (event) => {
      if (event.target.closest(".speak-button")) return;
      flipped = !flipped;
      playSfx("flip");
      draw();
      if (flipped) speak(word.word);
    });

    const speakButton = page.querySelector('[data-action="speak"]');
    if (speakButton) {
      speakButton.addEventListener("click", (event) => {
        event.stopPropagation();
        speak(word.word);
      });
    }

    page.querySelector('[data-action="unknown"]').addEventListener("click", () => answer(false));
    page.querySelector('[data-action="known"]').addEventListener("click", () => answer(true));

    const card = page.querySelector(".flash-card");
    card.addEventListener("touchstart", onTouchStart, { passive: true });
    card.addEventListener("touchmove", onTouchMove, { passive: true });
    card.addEventListener("touchend", onTouchEnd);
  }

  function answer(isCorrect) {
    const word = queue[index];
    if (!word) return;

    if (isCorrect) {
      known += 1;
      playSfx("success");
    } else {
      unknown += 1;
      playSfx("error");
      speak(word.word);
    }

    answerWord(word.id, isCorrect);
    index += 1;
    flipped = false;
    window.setTimeout(draw, isCorrect ? 120 : 420);
  }

  function drawEmpty() {
    const allWords = getAllWords();
    const hasWords = allWords.length > 0;
    page.innerHTML = `
      <div class="empty">
        <div>
          <span class="emoji">${hasWords ? "✓" : "＋"}</span>
          <strong>${hasWords ? "今日任务已完成" : "内置词库已学完"}</strong>
          <p>${hasWords ? "复习功能仍会按到期时间提醒你。" : "可导入自定义词库继续学习。"}</p>
          <div class="button-row empty-actions">
            <button class="secondary-button" data-action="more">多学一组</button>
            <button class="primary-button" data-action="home">返回首页</button>
          </div>
        </div>
      </div>
    `;

    page.querySelector('[data-action="home"]').addEventListener("click", () => navigate("/home"));
    page.querySelector('[data-action="more"]').addEventListener("click", () => {
      queue = buildStudyQueue(10);
      index = 0;
      flipped = false;
      draw();
    });
  }

  function drawComplete() {
    playSfx("complete");
    page.innerHTML = `
      <div class="complete-view">
        <span class="emoji">✓</span>
        <h1>本轮完成</h1>
        <p>认识 ${known} 个，不认识 ${unknown} 个。</p>
        <div class="metric-grid">
          <div class="metric"><strong>${known}</strong><span>认识</span></div>
          <div class="metric"><strong>${unknown}</strong><span>不认识</span></div>
          <div class="metric"><strong>${queue.length}</strong><span>本轮词数</span></div>
        </div>
        <div class="button-row">
          <button class="primary-button" data-action="quiz">去测验</button>
          <button class="secondary-button" data-action="home">返回首页</button>
        </div>
      </div>
    `;
    page.querySelector('[data-action="quiz"]').addEventListener("click", () => navigate("/quiz"));
    page.querySelector('[data-action="home"]').addEventListener("click", () => navigate("/home"));
  }

  function onTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function onTouchMove(event) {
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = Math.abs(touch.clientY - touchStartY);
    if (deltaY > 80) return;
    const card = page.querySelector(".flash-card");
    if (card) {
      card.style.transform = `translateX(${deltaX}px) rotate(${deltaX / 18}deg)`;
    }
  }

  function onTouchEnd(event) {
    const card = page.querySelector(".flash-card");
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    if (card) card.style.transform = "";
    if (Math.abs(deltaX) > 80) {
      answer(deltaX > 0);
    }
  }

  draw();
  return page;
}
