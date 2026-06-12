import { answerWord, buildQuizWords, getDistractors, saveQuizScore, shuffle } from "../store.js";
import { playSfx, speak } from "../audio.js";
import { createPage, escapeHtml } from "../ui.js";

export function renderQuiz({ navigate }) {
  const quizWords = buildQuizWords();
  let questions = quizWords.map(createQuestion);
  let index = 0;
  let selected = null;
  const results = [];
  const page = createPage("quiz-page");

  function draw() {
    if (quizWords.length < 4) {
      drawEmpty();
      return;
    }

    if (index >= questions.length) {
      drawResult();
      return;
    }

    const question = questions[index];
    const answered = selected !== null;

    page.innerHTML = `
      <div class="quiz-head">
        <button class="back-button" data-action="home">‹ 首页</button>
        <div class="quiz-dots">
          ${Array.from({ length: 10 })
            .map((_, dotIndex) => {
              const inactive = dotIndex >= questions.length;
              return `<span class="${dotIndex < index ? "done" : ""} ${dotIndex === index ? "active" : ""} ${inactive ? "inactive" : ""}"></span>`;
            })
            .join("")}
        </div>
      </div>

      <section class="quiz-prompt">
        <p>${question.mode === "word-to-meaning" ? "选择正确释义" : "选择对应单词"}</p>
        <h1>${escapeHtml(question.prompt)}</h1>
      </section>

      <div class="option-list">
        ${question.options
          .map((option) => {
            let state = "";
            if (answered && option === question.answer) state = "correct";
            if (answered && option === selected && option !== question.answer) state = "wrong";
            return `<button class="option ${state}" ${answered ? "disabled" : ""} data-option="${escapeHtml(option)}">${escapeHtml(option)}</button>`;
          })
          .join("")}
      </div>
    `;

    page.querySelector('[data-action="home"]').addEventListener("click", () => navigate("/home"));
    page.querySelectorAll(".option").forEach((button) => {
      button.addEventListener("click", () => selectAnswer(button.dataset.option));
    });
  }

  function selectAnswer(option) {
    if (selected !== null) return;
    const question = questions[index];
    selected = option;
    const correct = option === question.answer;
    results.push({ word: question.word.word, correct });

    if (correct) {
      playSfx("success");
      answerWord(question.word.id, true);
    } else {
      playSfx("error");
      answerWord(question.word.id, false);
      speak(question.word.word);
    }

    draw();
    window.setTimeout(() => {
      index += 1;
      selected = null;
      draw();
    }, 800);
  }

  function drawEmpty() {
    page.innerHTML = `
      <div class="empty">
        <div>
          <span class="emoji">?</span>
          <strong>先去学习</strong>
          <p>今天可用于测验的词还少于 4 个。</p>
          <div class="button-row empty-actions">
            <button class="primary-button" data-action="study">开始学习</button>
            <button class="secondary-button" data-action="home">返回首页</button>
          </div>
        </div>
      </div>
    `;
    page.querySelector('[data-action="study"]').addEventListener("click", () => navigate("/study"));
    page.querySelector('[data-action="home"]').addEventListener("click", () => navigate("/home"));
  }

  function drawResult() {
    const score = results.filter((item) => item.correct).length;
    saveQuizScore(score);
    playSfx("complete");
    page.innerHTML = `
      <div class="quiz-result">
        <p>本次得分</p>
        <h1>${score}<span>/${questions.length}</span></h1>
        <div class="review-list">
          ${results
            .map(
              (item) => `
                <div class="review-row">
                  <span>${escapeHtml(item.word)}</span>
                  <strong class="${item.correct ? "ok" : "bad"}">${item.correct ? "正确" : "错误"}</strong>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="button-row">
          <button class="primary-button" data-action="again">再测一次</button>
          <button class="secondary-button" data-action="done">完成</button>
        </div>
      </div>
    `;
    page.querySelector('[data-action="again"]').addEventListener("click", () => {
      questions = shuffle(quizWords).map(createQuestion);
      index = 0;
      selected = null;
      results.length = 0;
      draw();
    });
    page.querySelector('[data-action="done"]').addEventListener("click", () => navigate("/home"));
  }

  draw();
  return page;
}

function createQuestion(word) {
  const mode = Math.random() > 0.5 ? "word-to-meaning" : "meaning-to-word";
  const prompt = mode === "word-to-meaning" ? word.word : word.meaning;
  const answer = mode === "word-to-meaning" ? word.meaning : word.word;
  const options = shuffle([answer, ...getDistractors(word, mode, 3)]);
  return { word, mode, prompt, answer, options };
}
