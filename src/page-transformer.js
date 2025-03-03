import ExternalLinksHandler from './external-link-handler.js';
import RemoveElementHandler from './remove-element-handler.js';

class PageTransformer {
  /**
   * Adds `rel="noopener noreferrer"` to external links.
   *
   * @param {Response} response - Original HTTP response.
   * @returns {Response} Transformed response with updated links.
   */
  #updateExternalLinks(response) {
    const selector = `a[target="_blank"]:not([rel])`;
    const handler = new ExternalLinksHandler();

    return new HTMLRewriter().on(selector, handler).transform(response);
  }

  /**
   * Removes elements with the `.w-condition-invisible` class.
   *
   * @param {Response} response - Original HTTP response.
   * @returns {Response} Transformed response with hidden elements removed.
   */
  #removeInvisibleElements(response) {
    const selector = '.w-condition-invisible';
    const handler = new RemoveElementHandler();

    return new HTMLRewriter().on(selector, handler).transform(response);
  }

  /**
   * Cleans the page by applying all transformations (modifying links and removing hidden elements).
   *
   * @param {Response} response - Original HTTP response.
   * @returns {Response} Fully transformed response.
   */
  transformPage(response) {
    const withUpdatedLinks = this.#updateExternalLinks(response);
    return this.#removeInvisibleElements(withUpdatedLinks);
  }
}

export default PageTransformer;
