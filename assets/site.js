const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function initCaseNavigation() {
  const nav = document.querySelector(".case-nav");
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const targets = links
    .map(link => ({
      link,
      section: document.getElementById(decodeURIComponent(link.hash.slice(1)))
    }))
    .filter(entry => entry.section);

  if (!targets.length) return;

  function updateActiveLink() {
    const stickyHeight = nav.closest(".case-sidebar")?.getBoundingClientRect().height ?? 0;
    const isNarrow = window.matchMedia("(max-width: 960px)").matches;
    const marker = isNarrow ? stickyHeight + 16 : 120;
    let active = targets[0];

    for (const entry of targets) {
      if (entry.section.getBoundingClientRect().top <= marker) active = entry;
    }

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = targets.at(-1);
    }

    for (const entry of targets) {
      if (entry === active) entry.link.setAttribute("aria-current", "location");
      else entry.link.removeAttribute("aria-current");
    }
  }

  let scheduled = false;
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      updateActiveLink();
    });
  }

  for (const entry of targets) {
    entry.link.addEventListener("click", () => {
      for (const item of targets) item.link.removeAttribute("aria-current");
      entry.link.setAttribute("aria-current", "location");
      scheduleUpdate();
    });
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  updateActiveLink();
}

function initMedia() {
  const dialog = document.querySelector(".viewer");
  const body = dialog.querySelector(".viewer-body");
  const title = dialog.querySelector("#viewer-title");
  const closeButton = dialog.querySelector("[data-close]");
  const resumeTools = dialog.querySelector(".viewer-resume-tools");
  const resumeExpand = dialog.querySelector("[data-resume-expand]");
  const videos = new Map();
  let selection = null;
  let phase = "closed";
  let animation = null;

  function setIcon(button, name) {
    button.querySelector(".icon").className = `icon icon-${name}`;
  }

  function syncControl(record) {
    const playing = !record.video.paused;
    const action = playing ? "Pause" : "Play";
    record.button.setAttribute("aria-label", `${action} walkthrough`);
    record.button.title = `${action} walkthrough`;
    setIcon(record.button, playing ? "pause" : "play");
  }

  function syncPlayback(record) {
    const isModal = selection?.kind === "media" && selection.record === record;
    const isVisible = isModal ? phase === "open" : record.visible && phase === "closed";
    const shouldPlay = isVisible && !record.paused && (!reducedMotion.matches || record.manual)
      && document.visibilityState === "visible" && !record.video.error
      && !record.frame.classList.contains("is-unavailable");
    record.frame.classList.toggle("is-playing-manually", record.manual && reducedMotion.matches);
    if (shouldPlay) record.video.play().catch(() => syncControl(record));
    else record.video.pause();
    syncControl(record);
  }

  function syncAll() {
    for (const record of videos.values()) syncPlayback(record);
    if (selection?.kind === "media") syncPlayback(selection.record);
  }

  function bindVideo(frame, video, initial = {}) {
    const record = { frame, video, button: frame.querySelector("[data-play]"), visible: false, paused: false, manual: false, ...initial };
    frame.classList.add("is-enhanced");
    video.controls = false;
    video.muted = true;
    video.pause();
    record.button.addEventListener("click", () => {
      if (!video.paused) record.paused = true;
      else {
        record.paused = false;
        record.manual = true;
      }
      syncPlayback(record);
    });
    video.addEventListener("play", () => syncControl(record));
    video.addEventListener("pause", () => syncControl(record));
    function showFallback() {
      video.pause();
      frame.classList.add("is-unavailable");
      const fallback = frame.closest("figure")?.querySelector(".media-fallback");
      if (fallback) fallback.hidden = false;
    }
    video.addEventListener("error", showFallback);
    video.querySelector("source").addEventListener("error", showFallback);
    if (video.hasAttribute("data-embedded") && (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) showFallback();
    syncControl(record);
    return record;
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = videos.get(entry.target);
      record.visible = entry.isIntersecting && entry.intersectionRatio >= 0.05;
      syncPlayback(record);
    }
  }, { threshold: [0, 0.05] });

  for (const video of document.querySelectorAll("video[data-embedded]")) {
    const frame = video.closest(".media-frame");
    const record = bindVideo(frame, video);
    videos.set(video, record);
    observer.observe(video);
    frame.querySelector("[data-expand]").addEventListener("click", event => openMedia(record, event.currentTarget));
  }

  function animate(keyframes, finish) {
    animation?.cancel();
    if (reducedMotion.matches) {
      finish?.();
      return;
    }
    const current = dialog.animate(keyframes, { duration: 180, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "both" });
    animation = current;
    current.finished.then(() => {
      if (animation !== current) return;
      animation = null;
      current.cancel();
      finish?.();
    }).catch(() => {});
  }

  function openViewer(value) {
    if (phase !== "closed") return false;
    selection = value;
    phase = "open";
    dialog.classList.toggle("is-resume", value.kind === "resume");
    dialog.classList.remove("is-expanded");
    resumeTools.hidden = value.kind !== "resume";
    title.classList.toggle("sr-only", value.kind === "resume");
    document.documentElement.classList.add("viewer-open");
    dialog.showModal();
    syncAll();
    closeButton.focus({ preventScroll: true });
    animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }]);
    return true;
  }

  function openMedia(source, opener) {
    if (phase !== "closed") return;
    const frame = source.frame.cloneNode(true);
    frame.className = "media-frame viewer-media";
    frame.querySelector("[data-expand]").remove();
    const video = frame.querySelector("video");
    video.removeAttribute("data-embedded");
    body.replaceChildren(frame);
    const record = bindVideo(frame, video, { paused: source.paused, manual: source.manual });
    const time = source.video.currentTime;
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(time, video.duration);
      syncPlayback(record);
    }, { once: true });
    title.textContent = source.frame.closest("figure").dataset.title || "Project media";
    openViewer({ kind: "media", record, source, opener, scroll: window.scrollY });
  }

  for (const link of document.querySelectorAll("[data-resume]")) {
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || phase !== "closed") return;
      body.replaceChildren(document.querySelector("#resume-preview").content.cloneNode(true));
      title.textContent = "Viraj Choudhary's resume";
      setIcon(resumeExpand, "expand");
      resumeExpand.setAttribute("aria-label", "Expand resume");
      resumeExpand.title = "Expand resume";
      if (openViewer({ kind: "resume", opener: link, scroll: window.scrollY })) event.preventDefault();
    });
  }

  resumeExpand.addEventListener("click", () => {
    const expanded = dialog.classList.toggle("is-expanded");
    const label = expanded ? "Fit resume" : "Expand resume";
    resumeExpand.setAttribute("aria-label", label);
    resumeExpand.title = label;
    setIcon(resumeExpand, expanded ? "collapse" : "expand");
  });

  function finishClose() {
    if (!selection) return;
    const previous = selection;
    if (previous.kind === "media") {
      previous.record.video.pause();
      previous.source.paused = previous.record.paused;
      previous.source.manual = previous.record.manual;
      if (previous.source.video.readyState >= 1 && previous.record.video.readyState >= 1) previous.source.video.currentTime = previous.record.video.currentTime;
    }
    animation?.cancel();
    animation = null;
    selection = null;
    phase = "closed";
    body.replaceChildren();
    document.documentElement.classList.remove("viewer-open");
    previous.opener.focus({ preventScroll: true });
    window.scrollTo({ top: previous.scroll, behavior: "instant" });
    syncAll();
  }

  function closeViewer() {
    if (phase !== "open") return;
    phase = "closing";
    syncAll();
    animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(4px)" }], () => dialog.close());
  }
  closeButton.addEventListener("click", closeViewer);
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeViewer();
  });
  dialog.addEventListener("close", finishClose);
  dialog.addEventListener("click", event => {
    if (event.target === dialog || event.target === body) closeViewer();
  });
  document.addEventListener("visibilitychange", syncAll);
  reducedMotion.addEventListener("change", () => {
    for (const record of videos.values()) record.manual = false;
    if (selection?.kind === "media") selection.record.manual = false;
    if (phase === "closing") {
      animation?.cancel();
      dialog.close();
    }
    syncAll();
  });
}

initCaseNavigation();
initMedia();
