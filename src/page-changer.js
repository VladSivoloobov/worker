import ExternalLinksHandler from './external-link-handler';
import RemoveElementHandler from './remove-element-handler';

class PageChanger {
  /**
   * Adds `rel="noopener noreferrer"` to external links.
   *
   * @param {Response} response - Original HTTP response.
   * @returns {Response} Transformed response with updated links.
   */
  static #modifyExternalLinks(response) {
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
  static #removeHiddenElements(response) {
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
  static cleanPage(response) {
    const withModifiedLinks = this.#modifyExternalLinks(response);
    return this.#removeHiddenElements(withModifiedLinks);
  }
}

export default PageChanger;
