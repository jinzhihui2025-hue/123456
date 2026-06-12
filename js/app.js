import { applyTheme } from "./store.js";
import { initAudioOnGesture } from "./audio.js";
import { renderHome } from "./pages/home.js";
import { renderStudy } from "./pages/study.js";
import { renderQuiz } from "./pages/quiz.js";
import { renderWordbook } from "./pages/wordbook.js";
import { renderWordDetail } from "./pages/word-detail.js";
import { renderProfile } from "./pages/profile.js";

const app = document.querySelector("#app");
const tabbar = document.querySelector("#tabbar");
const frame = document.querySelector(".phone-frame");

const tabs = [
  { route: "/home", label: "首页", icon: "⌂" },
  { route: "/study", label: "学习", icon: "◩" },
  { route: "/wordbook", label: "词库", icon: "▤" },
  { route: "/profile", label: "我的", icon: "◌" }
];

const context = {
  navigate,
  rerender: render,
  showToast
};

applyTheme();
renderTabbar();
render();

window.addEventListener("hashchange", render);
window.addEventListener("pointerdown", initAudioOnGesture, { once: true });
window.addEventListener("touchstart", initAudioOnGesture, { once: true, passive: true });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

function currentPath() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/home";
}

function navigate(path) {
  if (currentPath() === path) {
    render();
    return;
  }
  window.location.hash = path;
}

function render() {
  const path = currentPath();
  const routeContext = { ...context, path };
  let page;

  if (path === "/home") page = renderHome(routeContext);
  else if (path === "/study") page = renderStudy(routeContext);
  else if (path === "/quiz") page = renderQuiz(routeContext);
  else if (path === "/wordbook") page = renderWordbook(routeContext);
  else if (path === "/profile") page = renderProfile(routeContext);
  else if (path.startsWith("/word/")) page = renderWordDetail({ ...routeContext, id: decodeURIComponent(path.replace("/word/", "")) });
  else {
    navigate("/home");
    return;
  }

  app.replaceChildren(page);
  renderTabbar();
}

function renderTabbar() {
  const path = currentPath();
  tabbar.innerHTML = tabs
    .map((tab) => {
      const active = path === tab.route || (tab.route === "/wordbook" && path.startsWith("/word/"));
      return `
        <a class="tab-item ${active ? "active" : ""}" href="#${tab.route}" aria-label="${tab.label}">
          <span class="tab-icon">${tab.icon}</span>
          <span>${tab.label}</span>
        </a>
      `;
    })
    .join("");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  frame.append(toast);
  window.setTimeout(() => toast.remove(), 2500);
}
