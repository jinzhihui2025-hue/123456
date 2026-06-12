import { getSettings } from "./store.js";

let context;
let unlocked = false;

function canSpeak() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function initAudioOnGesture() {
  if (unlocked) return;
  unlocked = true;
  if ("AudioContext" in window || "webkitAudioContext" in window) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    context = new AudioContextClass();
  }
}

export function isTtsAvailable() {
  return canSpeak();
}

export function speak(text, options = {}) {
  if (!getSettings().ttsEnabled || !canSpeak() || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || "en-US";
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  window.speechSynthesis.speak(utterance);
}

function tone(frequency, start, duration, gain = 0.08) {
  if (!context || !getSettings().sfxEnabled) return;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  volume.gain.setValueAtTime(0, start);
  volume.gain.linearRampToValueAtTime(gain, start + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playSfx(type) {
  if (!context || !getSettings().sfxEnabled) return;
  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }
  const now = context.currentTime;

  if (type === "flip") {
    tone(520, now, 0.05, 0.035);
  }

  if (type === "success") {
    tone(523.25, now, 0.08);
    tone(659.25, now + 0.08, 0.09);
  }

  if (type === "error") {
    tone(174.61, now, 0.16, 0.09);
  }

  if (type === "complete") {
    tone(523.25, now, 0.1, 0.08);
    tone(659.25, now + 0.1, 0.1, 0.08);
    tone(783.99, now + 0.2, 0.14, 0.08);
  }
}
