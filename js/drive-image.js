import { driveThumbUrl } from "./drive.js";

const MAX_RETRIES = 6;

/**
 * Creates an <img> that loads a Google Drive thumbnail, retrying with
 * backoff on failure (Drive's thumbnail endpoint throttles bursts of
 * simultaneous requests) and optionally staggering its initial request
 * so many images mounting at once (galleries) don't all fire together.
 *
 * options: { fileId, alt, width, className, sizes, initialDelayMs, priority, onLoad }
 * Returns the <img> element; caller appends it wherever needed.
 */
export function createDriveImage({
  fileId,
  alt,
  width = 1600,
  className = "",
  sizes,
  initialDelayMs = 0,
  priority = false,
}) {
  const img = document.createElement("img");
  img.alt = alt;
  if (className) img.className = className;
  if (sizes) img.sizes = sizes;
  img.loading = priority ? "eager" : "lazy";
  img.decoding = "async";

  let retryCount = 0;

  const load = () => {
    img.src = driveThumbUrl(fileId, width);
  };

  img.addEventListener("error", () => {
    if (retryCount >= MAX_RETRIES) return;
    const delay = 700 * (retryCount + 1) + Math.random() * 900;
    setTimeout(() => {
      retryCount += 1;
      load();
    }, delay);
  });

  if (initialDelayMs > 0 && !priority) {
    setTimeout(load, initialDelayMs);
  } else {
    load();
  }

  return img;
}
