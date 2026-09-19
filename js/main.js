import { projects, featuredProject, services, experienceTypes } from "./data-projects.js";
import { contact } from "./data-contact.js";
import { createDriveImage } from "./drive-image.js";
import { createVideoEmbed } from "./gallery.js";

const ICON = {
  menu: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>',
  x: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  arrowUpRight: '<svg class="icon" viewBox="0 0 24 24"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>',
  arrowRight: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  arrowLeft: '<svg class="icon" viewBox="0 0 24 24"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  chevronLeft: '<svg class="icon" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
  chevronRight: '<svg class="icon" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
};

/* ---------------------------------------------------------------------- */
/* Navbar: scroll shadow + mobile menu                                    */
/* ---------------------------------------------------------------------- */
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

/* ---------------------------------------------------------------------- */
/* Reveal-on-scroll: fade+slide for any [data-reveal] element             */
/* ---------------------------------------------------------------------- */
function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "-80px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------------- */
/* Shared project modal (Selected Work cards + Featured Project)          */
/* ---------------------------------------------------------------------- */
const projectModal = createProjectModal();

function createProjectModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="modal-header">
      <div>
        <p class="modal-category"></p>
        <h2 class="modal-title"></h2>
      </div>
      <button type="button" class="icon-btn modal-close" aria-label="Close project view">${ICON.x}</button>
    </div>
    <div class="modal-body">
      <div class="modal-image-wrap"></div>
      <button type="button" class="icon-btn modal-nav-btn prev modal-prev" aria-label="Previous image">${ICON.chevronLeft}</button>
      <button type="button" class="icon-btn modal-nav-btn next modal-next" aria-label="Next image">${ICON.chevronRight}</button>
    </div>
    <div class="modal-footer">
      <p class="modal-desc"></p>
      <p class="modal-counter"></p>
    </div>
  `;
  document.body.appendChild(overlay);

  const categoryEl = overlay.querySelector(".modal-category");
  const titleEl = overlay.querySelector(".modal-title");
  const imageWrap = overlay.querySelector(".modal-image-wrap");
  const descEl = overlay.querySelector(".modal-desc");
  const counterEl = overlay.querySelector(".modal-counter");
  const closeBtn = overlay.querySelector(".modal-close");
  const prevBtn = overlay.querySelector(".modal-prev");
  const nextBtn = overlay.querySelector(".modal-next");

  let project = null;
  let index = 0;

  function render() {
    categoryEl.textContent = `${project.category} · ${project.year}`;
    titleEl.textContent = project.title;
    descEl.textContent = project.description;
    counterEl.textContent = `${index + 1} / ${project.gallery.length}`;
    imageWrap.innerHTML = "";
    imageWrap.appendChild(
      createDriveImage({
        fileId: project.gallery[index].fileId,
        alt: project.gallery[index].alt,
        width: 1600,
        sizes: "90vw",
        priority: true,
      })
    );
    const hasMultiple = project.gallery.length > 1;
    prevBtn.style.display = hasMultiple ? "" : "none";
    nextBtn.style.display = hasMultiple ? "" : "none";
  }

  function open(p) {
    project = p;
    index = 0;
    render();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function go(delta) {
    index = (index + delta + project.gallery.length) % project.gallery.length;
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

/* ---------------------------------------------------------------------- */
/* Selected Work — bento grid of project cards                            */
/* ---------------------------------------------------------------------- */
function initSelectedWork() {
  const grid = document.querySelector(".work-grid");
  if (!grid) return;

  projects.forEach((project, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `work-card size-${project.size}`;
    card.setAttribute("data-reveal", "");

    const media = document.createElement("div");
    media.className = "work-card-media";
    media.appendChild(
      createDriveImage({
        fileId: project.cover.fileId,
        alt: project.cover.alt,
        width: 1200,
        sizes: "(min-width: 768px) 50vw, 100vw",
        priority: i === 0,
      })
    );
    card.appendChild(media);

    const overlay = document.createElement("div");
    overlay.className = "work-card-overlay";
    card.appendChild(overlay);

    const body = document.createElement("div");
    body.className = "work-card-body";
    body.innerHTML = `
      <div>
        <p class="work-card-category">${project.category}</p>
        <h3 class="work-card-title">${project.title}</h3>
        <p class="work-card-year">${project.year}</p>
      </div>
      <span class="work-card-arrow">${ICON.arrowUpRight}</span>
    `;
    card.appendChild(body);

    card.addEventListener("click", () => projectModal.open(project));
    grid.appendChild(card);
  });

  initCardScrub(grid);
}

/** GSAP scroll-scrub scale/opacity on each work-card's media, matching ProjectCard.tsx */
function initCardScrub(grid) {
  if (!window.gsap || !window.ScrollTrigger) return;
  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    grid.querySelectorAll(".work-card-media").forEach((media) => {
      const card = media.closest(".work-card");
      gsap.fromTo(
        media,
        { scale: 1.15, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "top center", scrub: true },
        }
      );
      gsap.to(media, {
        scale: 1.1,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: card, start: "bottom center", end: "bottom top", scrub: true },
      });
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Featured Project                                                       */
/* ---------------------------------------------------------------------- */
function initFeaturedProject() {
  const section = document.querySelector(".featured");
  if (!section) return;

  const media = section.querySelector(".featured-media");
  media.appendChild(
    createDriveImage({ fileId: featuredProject.cover.fileId, alt: featuredProject.cover.alt, width: 1920, sizes: "100vw", priority: true })
  );

  section.querySelector(".featured-eyebrow").textContent = `FEATURED PROJECT · ${featuredProject.category}`;
  section.querySelector(".featured-title").textContent = featuredProject.title;
  section.querySelector(".featured-desc").textContent = featuredProject.description;
  section.querySelector(".featured-cta").addEventListener("click", () => projectModal.open(featuredProject));

  if (!window.gsap || !window.ScrollTrigger) return;
  const gsap = window.gsap;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(
      media,
      { scale: 1.15, filter: "brightness(0.75)" },
      {
        scale: 1,
        filter: "brightness(1)",
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "center center", scrub: true },
      }
    );
  });
}

/* ---------------------------------------------------------------------- */
/* Services — hover-linked sticky preview                                 */
/* ---------------------------------------------------------------------- */
function initServices() {
  const list = document.querySelector(".services-list");
  const previewMedia = document.querySelector(".services-preview-media");
  const previewLink = document.querySelector(".services-preview-link");
  if (!list) return;

  let rows = [];

  function setActive(i) {
    rows.forEach((r, ri) => r.el.classList.toggle("is-active", ri === i));
    const service = services[i];
    if (previewMedia) {
      previewMedia.querySelectorAll("img, .video-embed").forEach((n) => n.remove());
      if (service.media.kind === "video") {
        const embed = createVideoEmbed(service.media.fileId, `${service.title} preview`, { aspect: "fill" });
        embed.classList.add("video-embed");
        previewMedia.insertBefore(embed, previewLink);
      } else {
        const img = createDriveImage({ fileId: service.media.fileId, alt: service.media.alt, width: 1000, sizes: "40vw", priority: true });
        previewMedia.insertBefore(img, previewLink);
      }
    }
    if (previewLink) previewLink.href = `create/${service.slug}.html`;
  }

  services.forEach((service, i) => {
    const row = document.createElement("a");
    row.href = `create/${service.slug}.html`;
    row.className = `service-row${i === services.length - 1 ? " is-last" : ""}`;
    row.innerHTML = `
      <span class="service-index">${service.index}</span>
      <span class="service-main">
        <span class="service-title">${service.title}</span>
        <span class="service-desc mobile-only">${service.description}</span>
        <span class="service-desc desktop-only">${service.description}</span>
      </span>
      <span class="service-arrow">${ICON.arrowUpRight}</span>
      <span class="service-thumb"><span class="service-thumb-inner"></span></span>
    `;
    row.querySelector(".service-thumb-inner").appendChild(
      createDriveImage({ fileId: service.media.fileId, alt: service.media.alt, width: 240, sizes: "120px" })
    );
    row.addEventListener("mouseenter", () => setActive(i));
    row.addEventListener("focus", () => setActive(i));
    list.appendChild(row);
    rows.push({ el: row });
  });

  setActive(0);
}

/* ---------------------------------------------------------------------- */
/* About — word-by-word scroll-scrub reveal (GSAP)                        */
/* ---------------------------------------------------------------------- */
function initAbout() {
  const container = document.querySelector(".about-paragraphs");
  if (!container) return;

  if (!window.gsap || !window.ScrollTrigger) return;
  const gsap = window.gsap;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const words = container.querySelectorAll(".about-word");
    if (!words.length) return;
    gsap.set(words, { opacity: 0.15 });
    gsap.to(words, {
      opacity: 1,
      stagger: 0.02,
      ease: "none",
      scrollTrigger: { trigger: container, start: "top 85%", end: "bottom 55%", scrub: true },
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Experience marquee                                                     */
/* ---------------------------------------------------------------------- */
function initExperience() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;
  const row = [...experienceTypes, ...experienceTypes];
  track.innerHTML = row
    .map(
      (type) => `
      <span class="marquee-item">
        <span>${type}</span>
        <span class="marquee-slash" aria-hidden="true">/</span>
      </span>`
    )
    .join("");
}

/* ---------------------------------------------------------------------- */
/* Contact channels                                                       */
/* ---------------------------------------------------------------------- */
function initContact() {
  const list = document.querySelector(".contact-channels");
  if (!list) return;
  const channels = [
    { label: "EMAIL", value: contact.email, href: `mailto:${contact.email}` },
    { label: "PHONE", value: contact.phone, href: `tel:${contact.phone.replace(/\s+/g, "")}` },
    { label: "INSTAGRAM", value: contact.instagram.label, href: contact.instagram.url },
    { label: "FACEBOOK", value: contact.facebook.label, href: contact.facebook.url },
    { label: "STUDIO", value: contact.studio.label, href: contact.studio.url },
  ];
  list.innerHTML = channels
    .map((c) =>
      c.href
        ? `<a class="channel" href="${c.href}" ${c.href.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}>
            <span class="channel-label">${c.label}</span>
            <span class="channel-value">${c.value}</span>
          </a>`
        : `<span class="channel">
            <span class="channel-label">${c.label}</span>
            <span class="channel-value">${c.value}</span>
          </span>`
    )
    .join("");

  const projectLink = document.querySelector(".contact-cta");
  if (projectLink) {
    projectLink.href = contact.studio.url;
    projectLink.target = "_blank";
    projectLink.rel = "noopener noreferrer";
  }
}

/* ---------------------------------------------------------------------- */
/* Footer socials                                                         */
/* ---------------------------------------------------------------------- */
function initFooter() {
  const socials = document.querySelector(".footer-socials");
  if (!socials) return;
  const links = [
    { label: "Instagram", href: contact.instagram.url },
    { label: "Facebook", href: contact.facebook.url },
  ];
  socials.innerHTML = links
    .map((s) => `<a href="${s.href}" target="_blank" rel="noopener noreferrer">${s.label.toUpperCase()}</a>`)
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initSelectedWork();
  initServices();
  initFeaturedProject();
  initAbout();
  initExperience();
  initContact();
  initFooter();
  initReveal();
});
