import { createDriveImage } from "./drive-image.js";
import { driveVideoEmbedUrl } from "./drive.js";

const ICON_CHEVRON_LEFT =
  '<svg class="icon" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>';
const ICON_CHEVRON_RIGHT =
  '<svg class="icon" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>';
const ICON_X = '<svg class="icon" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const ICON_PLAY =
  '<svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

/**
 * Renders a Pinterest-style masonry gallery (no cropping — each image keeps
 * its own aspect ratio) into `container`, with a shared full-screen lightbox.
 * items: [{ fileId, alt }]
 */
export function renderMasonryGallery(container, items, { aspectW = 3, aspectH = 2 } = {}) {
  const grid = document.createElement("div");
  grid.className = "masonry";

  items.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "masonry-item";
    btn.setAttribute("aria-label", `Open photo ${i + 1}: ${item.alt}`);

    const img = createDriveImage({
      fileId: item.fileId,
      alt: item.alt,
      width: 900,
      sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
      initialDelayMs: (i % 12) * 180,
    });
    btn.appendChild(img);
    btn.addEventListener("click", () => lightbox.open(items, i));
    grid.appendChild(btn);
  });

  container.appendChild(grid);
}

/**
 * A single shared lightbox instance (mounted once per page) reused by every
 * masonry gallery on that page.
 */
const lightbox = createLightbox();

function createLightbox() {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="lightbox-header">
      <p class="lightbox-counter"></p>
      <button type="button" class="icon-btn lightbox-close" aria-label="Close">${ICON_X}</button>
    </div>
    <div class="lightbox-body">
      <div class="lightbox-image-wrap"></div>
      <button type="button" class="icon-btn modal-nav-btn prev lightbox-prev" aria-label="Previous image">${ICON_CHEVRON_LEFT}</button>
      <button type="button" class="icon-btn modal-nav-btn next lightbox-next" aria-label="Next image">${ICON_CHEVRON_RIGHT}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const counterEl = overlay.querySelector(".lightbox-counter");
  const imageWrap = overlay.querySelector(".lightbox-image-wrap");
  const closeBtn = overlay.querySelector(".lightbox-close");
  const prevBtn = overlay.querySelector(".lightbox-prev");
  const nextBtn = overlay.querySelector(".lightbox-next");

  let items = [];
  let index = 0;

  function render() {
    counterEl.textContent = `${index + 1} / ${items.length}`;
    imageWrap.innerHTML = "";
    const img = createDriveImage({
      fileId: items[index].fileId,
      alt: items[index].alt,
      width: 1600,
      sizes: "90vw",
      priority: true,
    });
    imageWrap.appendChild(img);
    const hasMultiple = items.length > 1;
    prevBtn.style.display = hasMultiple ? "" : "none";
    nextBtn.style.display = hasMultiple ? "" : "none";
  }

  function open(newItems, startIndex) {
    items = newItems;
    index = startIndex;
    render();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function go(delta) {
    index = (index + delta + items.length) % items.length;
    render();
  }

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  window.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  });

  return { open, close };
}

/**
 * Renders a video grid: poster image (Drive thumbnail) that swaps to an
 * embedded Drive preview iframe on click, matching VideoEmbed/VideoGrid.
 * items: [{ fileId, title }]
 */
export function renderVideoGrid(container, items, { aspect = "video" } = {}) {
  const grid = document.createElement("div");
  grid.className = "video-grid";

  items.forEach((item, i) => {
    const cell = document.createElement("div");
    const embed = createVideoEmbed(item.fileId, item.title, {
      aspect,
      initialDelayMs: (i % 12) * 180,
    });
    cell.appendChild(embed);
    const caption = document.createElement("p");
    caption.className = "video-caption";
    caption.textContent = item.title;
    cell.appendChild(caption);
    grid.appendChild(cell);
  });

  container.appendChild(grid);
}

/**
 * Builds one poster-then-click-to-play Drive video embed element.
 * aspect: "video" | "portrait" | "square" | "fill"
 */
export function createVideoEmbed(fileId, title, { aspect = "video", initialDelayMs = 0 } = {}) {
  const wrap = document.createElement("div");
  wrap.className = `video-embed aspect-${aspect}`;

  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.className = "video-play-btn";
  playBtn.setAttribute("aria-label", `Play video: ${title}`);

  const poster = createDriveImage({ fileId, alt: title, width: 1200, initialDelayMs });
  playBtn.appendChild(poster);

  const scrim = document.createElement("span");
  scrim.className = "video-play-scrim";
  playBtn.appendChild(scrim);

  const iconWrap = document.createElement("span");
  iconWrap.className = "video-play-icon";
  iconWrap.innerHTML = `<span>${ICON_PLAY}</span>`;
  playBtn.appendChild(iconWrap);

  playBtn.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = driveVideoEmbedUrl(fileId);
    iframe.title = title;
    iframe.allow = "autoplay; fullscreen";
    iframe.allowFullscreen = true;
    wrap.innerHTML = "";
    wrap.appendChild(iframe);
  });

  wrap.appendChild(playBtn);
  return wrap;
}
