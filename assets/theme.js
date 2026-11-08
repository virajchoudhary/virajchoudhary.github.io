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

  function updateTheme() {
    const dark = themeRoot.dataset.theme === "dark";
    const label = `Switch to ${dark ? "light" : "dark"} mode`;
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", label);
    button.title = label;
    button.querySelector(".icon").className = `icon icon-${dark ? "sun" : "moon"}`;
    if (themeColor) themeColor.content = dark ? "#191919" : "#fdfdfd";
  }

  updateTheme();
  button.hidden = false;
  button.addEventListener("click", () => {
    themeRoot.classList.add("theme-transition");
    themeRoot.dataset.theme = themeRoot.dataset.theme === "dark" ? "light" : "dark";
    updateTheme();
    try {
      localStorage.setItem("portfolio-theme", themeRoot.dataset.theme);
    } catch {}
  });
});
