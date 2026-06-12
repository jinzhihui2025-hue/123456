import { todayKey, createRecord, reviewRecord, markMastered, resetLearning } from "./srs.js";
import { CET4_WORDS } from "./data/words-cet4.js";
import { CET6_WORDS } from "./data/words-cet6.js";
import { IELTS_WORDS } from "./data/words-ielts.js";

const PREFIX = "vocab_";
const KEYS = {
  settings: `${PREFIX}settings`,
  progress: `${PREFIX}progress`,
  checkins: `${PREFIX}checkins`,
  customWords: `${PREFIX}custom_words`,
  today: `${PREFIX}today_words`
};

const defaultSettings = {
  dailyGoal: 20,
  theme: "auto",
  ttsEnabled: true,
  sfxEnabled: true,
  wordSource: "all"
};

const builtIn = {
  cet4: CET4_WORDS,
  cet6: CET6_WORDS,
  ielts: IELTS_WORDS
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeId(id) {
  return String(id);
}

export function getSettings() {
  return { ...defaultSettings, ...readJSON(KEYS.settings, {}) };
}

export function saveSettings(settings) {
  writeJSON(KEYS.settings, { ...getSettings(), ...settings });
  applyTheme();
}

export function applyTheme() {
  document.documentElement.dataset.theme = getSettings().theme;
}

export function getProgress() {
  return readJSON(KEYS.progress, {});
}

export function saveProgress(progress) {
  writeJSON(KEYS.progress, progress);
}

export function getRecord(id) {
  const progress = getProgress();
  return { ...createRecord(), ...(progress[normalizeId(id)] || {}) };
}

export function setRecord(id, record) {
  const progress = getProgress();
  progress[normalizeId(id)] = record;
  saveProgress(progress);
}

export function answerWord(id, isCorrect) {
  const record = reviewRecord(getRecord(id), isCorrect);
  setRecord(id, record);
  rememberTodayWord(id);
  bumpTodayLearned(id);
  return record;
}

export function setMastered(id) {
  setRecord(id, markMastered(getRecord(id)));
}

export function setLearning(id) {
  setRecord(id, resetLearning(getRecord(id)));
}

export function getCheckins() {
  return readJSON(KEYS.checkins, {});
}

export function saveCheckins(checkins) {
  writeJSON(KEYS.checkins, checkins);
}

export function updateCheckin(updater) {
  const checkins = getCheckins();
  const date = todayKey();
  const current = checkins[date] || { learned: 0, quizScore: null };
  checkins[date] = updater({ ...current });
  saveCheckins(checkins);
}

export function bumpTodayLearned(id) {
  const today = getTodayState();
  const key = normalizeId(id);
  if (!today.learnedIds.includes(key)) {
    today.learnedIds.push(key);
    saveTodayState(today);
    updateCheckin((current) => ({ ...current, learned: today.learnedIds.length }));
  }
}

export function saveQuizScore(score) {
  updateCheckin((current) => ({ ...current, quizScore: score }));
}

export function getCustomWords() {
  return readJSON(KEYS.customWords, []);
}

export function saveCustomWords(words) {
  writeJSON(KEYS.customWords, words);
}

export function validateImportedWords(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("JSON 格式错误，请检查逗号、引号和括号。");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("导入内容必须是 JSON 数组。");
  }

  const required = ["word", "phonetic", "pos", "meaning", "example", "exampleCn"];
  parsed.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`第 ${index + 1} 项不是有效对象。`);
    }
    const missing = required.filter((field) => !String(item[field] || "").trim());
    if (missing.length) {
      throw new Error(`第 ${index + 1} 项缺少字段：${missing.join(", ")}。`);
    }
  });

  return parsed.map((item, index) => ({
    id: `custom-${Date.now()}-${index}`,
    word: String(item.word).trim(),
    phonetic: String(item.phonetic).trim(),
    pos: String(item.pos).trim(),
    meaning: String(item.meaning).trim(),
    example: String(item.example).trim(),
    exampleCn: String(item.exampleCn).trim(),
    level: item.level ? String(item.level).trim() : "自定义"
  }));
}

export function importCustomWords(rawText) {
  const incoming = validateImportedWords(rawText);
  const existing = getCustomWords();
  const known = new Set(existing.map((word) => word.word.toLowerCase()));
  const unique = incoming.filter((word) => !known.has(word.word.toLowerCase()));
  saveCustomWords([...existing, ...unique]);
  return { imported: unique.length, skipped: incoming.length - unique.length };
}

export function getBuiltInWords(source = getSettings().wordSource) {
  if (source === "cet4") return builtIn.cet4;
  if (source === "cet6") return builtIn.cet6;
  if (source === "ielts") return builtIn.ielts;
  return [...builtIn.cet4, ...builtIn.cet6, ...builtIn.ielts];
}

export function getAllWords(options = {}) {
  const source = options.source || getSettings().wordSource;
  return [...getBuiltInWords(source), ...getCustomWords()];
}

export function getWordById(id) {
  return getAllWords({ source: "all" }).find((word) => normalizeId(word.id) === normalizeId(id));
}

export function getStats() {
  const progress = getProgress();
  const records = Object.values(progress);
  const learned = records.filter((record) => record.status !== "new").length;
  const mastered = records.filter((record) => record.status === "mastered").length;
  const today = todayKey();
  const due = records.filter((record) => record.dueDate <= today && record.status !== "new").length;
  const checkins = getCheckins();
  const days = Object.values(checkins).filter((day) => (day.learned || 0) > 0).length;
  const quizScores = Object.values(checkins)
    .map((day) => day.quizScore)
    .filter((score) => typeof score === "number");
  const averageQuiz = quizScores.length
    ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
    : 0;

  return {
    learned,
    mastered,
    due,
    days,
    totalWords: getAllWords().length,
    masteryRate: learned ? Math.round((mastered / learned) * 100) : 0,
    averageQuiz
  };
}

export function getTodayState() {
  const date = todayKey();
  const state = readJSON(KEYS.today, {});
  if (state.date !== date) {
    return { date, words: [], learnedIds: [] };
  }
  return {
    date,
    words: Array.isArray(state.words) ? state.words.map(normalizeId) : [],
    learnedIds: Array.isArray(state.learnedIds) ? state.learnedIds.map(normalizeId) : []
  };
}

export function saveTodayState(state) {
  writeJSON(KEYS.today, state);
}

export function rememberTodayWord(id) {
  const today = getTodayState();
  const key = normalizeId(id);
  if (!today.words.includes(key)) {
    today.words.push(key);
    saveTodayState(today);
  }
}

export function buildStudyQueue(extraNew = 0) {
  const words = getAllWords();
  const progress = getProgress();
  const today = todayKey();
  const learnedToday = getTodayState().learnedIds.length;
  const target = extraNew > 0 ? extraNew : Math.max(0, getSettings().dailyGoal - learnedToday);

  const due =
    extraNew > 0
      ? []
      : words.filter((word) => {
          const record = progress[normalizeId(word.id)];
          return record && record.status !== "new" && record.dueDate <= today;
        });

  const remaining = Math.max(0, target - due.length);
  const fresh = words
    .filter((word) => {
      const record = progress[normalizeId(word.id)];
      return !record || record.status === "new";
    })
    .slice(0, remaining);

  return [...due, ...fresh];
}

export function buildQuizWords() {
  const today = getTodayState().words
    .map((id) => getWordById(id))
    .filter(Boolean);

  const progress = getProgress();
  const learning = getAllWords()
    .filter((word) => progress[normalizeId(word.id)]?.status === "learning")
    .filter((word) => !today.some((item) => normalizeId(item.id) === normalizeId(word.id)));

  const pool = [...today, ...learning];
  return shuffle(pool).slice(0, 10);
}

export function getDistractors(correctWord, mode, count = 3) {
  const field = mode === "word-to-meaning" ? "meaning" : "word";
  const correctValue = correctWord[field];
  return shuffle(getAllWords({ source: "all" }))
    .filter((word) => normalizeId(word.id) !== normalizeId(correctWord.id))
    .map((word) => word[field])
    .filter((value, index, array) => value && value !== correctValue && array.indexOf(value) === index)
    .slice(0, count);
}

export function getLastDays(count) {
  const checkins = getCheckins();
  const days = [];
  const now = new Date();
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    const key = todayKey(date);
    days.push({ date: key, ...(checkins[key] || { learned: 0, quizScore: null }) });
  }
  return days;
}

export function getStreak() {
  const checkins = getCheckins();
  let streak = 0;
  const date = new Date();
  while (true) {
    const key = todayKey(date);
    if ((checkins[key]?.learned || 0) <= 0) break;
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

export function exportLearningData() {
  return {
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    progress: getProgress(),
    checkins: getCheckins(),
    customWords: getCustomWords(),
    today: getTodayState()
  };
}

export function resetAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  applyTheme();
}

export function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function formatDateCn(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(date);
}

export { todayKey };
