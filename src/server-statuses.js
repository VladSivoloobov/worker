import { redirectList, goneList } from '../status-list.js';
import page410 from '/page410.html';

class HttpStatusHandler {
  /**
   * @param {URL} url - The URL object to process.
   * @param {boolean} keepWWW - Whether to keep the "www." prefix in the host.
   */
  constructor(url, keepWWW) {
    this.url = new URL(url);
    this.url.host = keepWWW ? this.url.host : this.url.host.replace('www.', '');
    this.fullPath = `${this.url.pathname}${this.url.search}`;
  }

  /**
   * Checks if two paths match (ignoring slashes).
   * @param {string} pathA - First path.
   * @param {string} pathB - Second path.
   * @returns {boolean} - True if paths match.
   */
  #arePathsMatching(pathA, pathB) {
    return pathA.replaceAll('/', '') === pathB.replaceAll('/', '');
  }

  /**
   * Checks for a 410 Gone status.
   * @returns {Response | undefined} - A 410 response if matched, otherwise undefined.
   */
  #handleGoneStatus() {
    const matched = goneList.find((path) =>
      this.#arePathsMatching(path, this.fullPath)
    );
    if (matched) {
      return new Response(page410, { status: 410 });
    }
  }

  /**
   * Checks for a 301 Redirect status.
   * @returns {Response | undefined} - A 301 redirect response if matched, otherwise undefined.
   */
  #handleRedirectStatus() {
    const matched = redirectList.find(({ from }) =>
      this.#arePathsMatching(from, this.fullPath)
    );

    if (matched) {
      const redirectUrl = new URL(matched.to, this.url.origin);
      return Response.redirect(redirectUrl.href, 301);
    }
  }

  /**
   * Checks the URL for 301 or 410 statuses.
   * @returns {Response | undefined} - A response if a status is matched, otherwise undefined.
   */
  checkHttpStatus() {
    return this.#handleRedirectStatus() || this.#handleGoneStatus();
  }
}

export default HttpStatusHandler;
