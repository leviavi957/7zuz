/**
 * Starts a real browser download of `blob` under `filename`, then revokes the
 * temporary object URL. Shared by the profile export and the HR report buttons.
 * The revoke is delayed a moment so the browser can begin the download.
 */
export function downloadFile(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
