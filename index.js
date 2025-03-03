import PageChanger from './src/page-changer';
import ServerStatuses from './src/server-statuses';

/**
 * @constant
 * @type {boolean}
 * @description If url must have 'www', set this variables to true
 */
const isWWW = false;

/**
 * Worker Entry. Any code starts here
 * @param {Request} request - incoming http request
 * @returns {Promise<Response>} - http response object
 */
async function main(request) {
  const url = new URL(request.url);
  const response = await fetch(url);

  const serverStatuses = new ServerStatuses(url, isWWW);

  return (
    serverStatuses.checkUrlStatuses(url) || PageChanger.cleanPage(response)
  );
}

export default { fetch: main };
