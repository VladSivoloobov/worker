import PageTransformer from './src/page-changer';
import HttpStatusHandler from './src/server-statuses';

/**
 * @constant
 * @type {boolean}
 * @description If url must have 'www', set this variables to true
 */
const keepWWW = false;

/**
 * Worker Entry. Any code starts here
 * @param {Request} request - incoming http request
 * @returns {Promise<Response>} - http response object
 */
async function main(request) {
  const url = new URL(request.url);
  const response = await fetch(url);

  const statusHandler = new HttpStatusHandler(url, keepWWW);
  const pageTransformer = new PageTransformer();

  const output =
    statusHandler.checkHttpStatus(url) ||
    pageTransformer.transformPage(response);

  return output;
}

export default { fetch: main };
