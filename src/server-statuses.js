import { list301, list410 } from '../status-list.js';
import page410 from '/page410.html';

class ServerStatuses {
  /**
   * @param {URL} url - The URL object to process.
   * @param {boolean} isWWW - Whether to keep the "www." prefix in the host.
   */
  constructor(url, isWWW) {
    this.url = new URL(url);
    this.url.host = isWWW ? this.url.host : this.url.host.replace('www.', '');
    this.pathname = `${this.url.pathname}${this.url.search}`;
  }

  /**
   * Checks if two pathnames match (ignoring slashes).
   * @param {string} path1 - First pathname.
   * @param {string} path2 - Second pathname.
   * @returns {boolean} - True if pathnames match.
   */
  #isPathnameMatch(path1, path2) {
    return path1.replaceAll('/', '') === path2.replaceAll('/', '');
  }

  /**
   * Checks for a 410 Gone status.
   * @returns {Response | undefined} - A 410 response if matched, otherwise undefined.
   */
  #check410() {
    const matched = list410.find((url) =>
      this.#isPathnameMatch(url, this.pathname)
    );
    if (matched) {
      return new Response(page410, { status: 410 });
    }
  }

  /**
   * Checks for a 301 Redirect status.
   * @returns {Response | undefined} - A 301 redirect response if matched, otherwise undefined.
   */
  #check301() {
    const matched = list301.find(({ from }) =>
      this.#isPathnameMatch(from, this.pathname)
    );
    if (matched) {
      const redirectURL = new URL(matched.to, this.url.origin);
      return Response.redirect(redirectURL.href, 301);
    }
  }

  /**
   * Checks the URL for 301 or 410 statuses.
   * @returns {Response | undefined} - A response if a status is matched, otherwise undefined.
   */
  checkUrlStatuses() {
    return this.#check301() || this.#check410();
  }
}

export default ServerStatuses;
