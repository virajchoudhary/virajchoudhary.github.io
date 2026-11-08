const themeRoot = document.documentElement;
const requestedTheme = new URLSearchParams(location.search).get("theme");
let theme = "light";
try {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") theme = savedTheme;
} catch {}
if (requestedTheme === "light" || requestedTheme === "dark") theme = requestedTheme;
themeRoot.dataset.theme = theme;

const themeColor = document.querySelector('meta[name="theme-color"]');
if (themeColor) themeColor.content = theme === "dark" ? "#191919" : "#fdfdfd";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;
  let desiredTheme = theme;
  let activeTransition = null;

  function updateTheme() {
    const dark = themeRoot.dataset.theme === "dark";
    const label = `Switch to ${dark ? "light" : "dark"} mode`;
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", label);
    button.title = label;
    button.querySelector(".icon").className = `icon icon-${dark ? "sun" : "moon"}`;
    if (themeColor) themeColor.content = dark ? "#191919" : "#fdfdfd";
  }

  function applyDesiredTheme() {
    themeRoot.classList.add("theme-switching");
    themeRoot.dataset.theme = desiredTheme;
    updateTheme();
    try {
      localStorage.setItem("portfolio-theme", desiredTheme);
    } catch {}
  }

  function finishThemeSwitch(transition) {
    if (activeTransition !== transition) return;
    activeTransition = null;
    if (!themeRoot.classList.contains("theme-switching")) return;
    themeRoot.classList.remove("theme-switching");
  }

  function clearImmediateSwitch() {
    if (!themeRoot.classList.contains("theme-switching")) return;
    void document.body.offsetHeight;
    themeRoot.classList.remove("theme-switching");
  }

  updateTheme();
  button.hidden = false;
  button.addEventListener("click", () => {
    desiredTheme = desiredTheme === "dark" ? "light" : "dark";

    if (activeTransition) activeTransition.skipTransition();

    if (
      typeof document.startViewTransition !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      applyDesiredTheme();
      if (!activeTransition) clearImmediateSwitch();
      return;
    }

    try {
      const transition = document.startViewTransition(applyDesiredTheme);
      activeTransition = transition;
      transition.ready.catch(() => {});
      transition.finished.then(
        () => finishThemeSwitch(transition),
        () => finishThemeSwitch(transition)
      );
    } catch {
      applyDesiredTheme();
      if (!activeTransition) clearImmediateSwitch();
    }
  });
});
