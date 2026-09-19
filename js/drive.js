/**
 * Media for this portfolio is embedded directly from Daniel's Google Drive
 * library rather than copied into the repo. Swap any fileId in
 * src/data/projects.ts for a new one from Drive and the change ships
 * immediately, no re-upload needed.
 *
 * IMPORTANT: the source files/folders in Drive must be shared as
 * "Anyone with the link" (Viewer) or media will fail to load for visitors.
 */
export function driveThumbUrl(fileId, width = 1600) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}
export function driveVideoEmbedUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
}
