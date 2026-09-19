import {
  reelsFull,
  videosFull,
  photomanFull,
  onsiteStudioFull,
  photoShoots,
  photosTotalCount,
} from "./data-galleries.js";
import { renderMasonryGallery, renderVideoGrid } from "./gallery.js";

const ICON = {
  menu: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>',
  x: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

function initNavbar() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!header) return;

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!toggle || !menu) return;
  let open = false;
  const setOpen = (next) => {
    open = next;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = open ? ICON.x : ICON.menu;
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setOpen(!open));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) setOpen(false);
  });
}

function renderGallery() {
  const slug = document.body.dataset.slug;
  const body = document.querySelector(".create-body");
  if (!body) return;

  if (slug === "reels") {
    renderVideoGrid(body, reelsFull, { aspect: "portrait" });
  } else if (slug === "videos") {
    renderVideoGrid(body, videosFull, { aspect: "video" });
  } else if (slug === "photoman") {
    renderMasonryGallery(body, photomanFull, { aspectW: 2, aspectH: 3 });
  } else if (slug === "onsite-studio") {
    renderMasonryGallery(body, onsiteStudioFull, { aspectW: 2, aspectH: 3 });
  } else if (slug === "photos") {
    const count = document.createElement("p");
    count.className = "photos-count";
    count.textContent = `${photosTotalCount} PHOTOS ACROSS ${photoShoots.length} SHOOTS`;
    body.appendChild(count);

    photoShoots.forEach((shoot) => {
      const section = document.createElement("section");
      section.className = "photo-shoot-group";
      section.innerHTML = `
        <div class="photo-shoot-header">
          <h2 class="photo-shoot-name">${shoot.name}</h2>
          <p class="photo-shoot-category">${shoot.category}</p>
        </div>
      `;
      body.appendChild(section);
      renderMasonryGallery(section, shoot.items, { aspectW: 3, aspectH: 2 });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  renderGallery();
});
