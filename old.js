const redirectList = [
  {
    from: 'https://simvisa.com/whyus/',
    to: 'https://simvisa.com',
  },
  {
    from: 'https://simvisa.com/contacts/',
    to: 'https://simvisa.com/contact-us',
  },
  {
    from: 'https://simvisa.com/contactus/',
    to: 'https://simvisa.com/contact-us',
  },
  {
    from: 'https://simvisa.com/resources/',
    to: 'https://simvisa.com/blog',
  },
  {
    from: 'https://simvisa.com/termsandconditions/',
    to: 'https://simvisa.com/terms-of-conditions',
  },
  {
    from: 'https://simvisa.com/privacypolicy/',
    to: 'https://simvisa.com/privacy-policy',
  },
];

async function fetchCSS(url) {
  const response = await fetch(url);
  return response.text();
}

class cssInline {
  constructor(attributeName) {
    this.attributeName = attributeName;
  }

  async element(element) {
    const attribute = element.getAttribute(this.attributeName);

    if (attribute) {
      const styles = await fetchCSS(attribute);
      const stylesFontFix = styles
        .replace(
          'https://uploads-ssl.webflow.com/63a3049cfd55c5990d4651c0/63a30d0465af1c63ff4ebbbd_OpenSans-Regular.woff2',
          'https://assets-global.website-files.com/63a3049cfd55c5990d4651c0/63a30d0465af1c63ff4ebbbd_OpenSans-Regular.woff2'
        )
        .replace(
          'https://uploads-ssl.webflow.com/63a3049cfd55c5990d4651c0/63a3118b5884a7fd744cfc10_Manrope-Semibold.woff2',
          'https://assets-global.website-files.com/63a3049cfd55c5990d4651c0/63a3118b5884a7fd744cfc10_Manrope-Semibold.woff2'
        )
        .replace(
          'https://uploads-ssl.webflow.com/63a3049cfd55c5990d4651c0/63a3118b0a748d4d8f8a9f1d_Manrope-Bold.woff2',
          'https://assets-global.website-files.com/63a3049cfd55c5990d4651c0/63a3118b0a748d4d8f8a9f1d_Manrope-Bold.woff2'
        )
        .replace(
          'https://uploads-ssl.webflow.com/63a3049cfd55c5990d4651c0/63bfb1ef79c8e23dd78f6158_OpenSans-SemiBold.woff2',
          'https://assets-global.website-files.com/63a3049cfd55c5990d4651c0/63bfb1ef79c8e23dd78f6158_OpenSans-SemiBold.woff2'
        );
      /*
      element.replace(`<style>${stylesFontFix}</style>`, {
        html: true,
      });*/
    }
  }
}

class WebflowScriptRemover {
  constructor(attributeName) {
    this.attributeName = attributeName;
  }

  async element(element) {
    const attribute = element.getAttribute(this.attributeName);

    if (attribute) {
      element.replace('<script></script>', {
        html: true,
      });
    }
  }
}

async function handleRequest(request) {
  const url = new URL(request.url);
  let { pathname, search, hash } = url;
  let redirect = redirectList.find(
    (x) =>
      new URL(x.from).pathname.replaceAll('/', '') ===
      pathname.replaceAll('/', '')
  );

  // const response = await fetch(request);
  const response = await fetchX(request);
  //const cssInlineResult = new HTMLRewriter().on('link[rel="stylesheet"]', new cssInline('href')).transform(response);

  if (redirect && pathname !== '/') {
    return Response.redirect(redirect.to, 301);
  } else {
    // return new Response(txt.replace(/\s\s+/g, ' ').replace(/\n/g, '').trim(), {
    //   headers: {"content-type": "text/html"}
    // });
    //return cssInlineResult;
    return response;
  }
}

addEventListener('fetch', async (event) => {
  event.respondWith(handleRequest(event.request));
});

async function fetchX(request) {
  try {
    const { pathname } = new URL(request.url);
    if (/^\/about-us\//i.test(pathname)) {
      const token =
        'f8c1695071c9de555c5911781ad5c9591a538c3e255612f1402402b6f67253df';
      const [authors, blogs] = await Promise.all([
        getCMSCollectionAsync(token, '65e5e4fd4fec402bc99a4811', {
          slug: pathname.split('/').pop(),
        }),
        getCMSCollectionAsync(token, '65e5e4fd4fec402bc99a4812', {
          sortBy: 'lastPublished',
        }),
      ]);
      const author = authors?.pop();
      const authorBlogs = blogs?.filter(
        ({ fieldData }) => fieldData?.author === author?.id
      );
      // return await fetchAndInject(request, `<script id="cms-collection-data" type="application/json">${JSON.stringify({ author, authorBlogs })}</script>`)
      if (authorBlogs?.length) {
        const { createdOn, lastUpdated, fieldData } = author;
        const result = {
          author: {
            dateCreated: createdOn,
            dateModified: lastUpdated,
            name: fieldData.name,
            jobTitle: fieldData.position,
            image: fieldData.image?.url,
            description: fieldData['preview-text'],
            sameAs: [
              fieldData['linkedin'],
              fieldData['facebook'],
              fieldData['insta'],
              fieldData['a---link'],
            ],
          },
          blogs: authorBlogs.slice(0, 5).map(({ fieldData }) => ({
            datePublished: fieldData['custom-update-date'],
            url: `/blog/${fieldData['slug']}`,
            image: fieldData['preview-image']?.url,
            headline: fieldData['page-title'],
            articleBody: fieldData['preview-text'],
          })),
          count: authorBlogs.length,
        };
        return await fetchAndInject(
          request,
          `<script id="cms-collection-data" type="application/json">${JSON.stringify(
            result
          )}</script>`
        );
      }
    }
    return await fetch(request);
  } catch (e) {
    return await fetchAndInject(
      request,
      `<script>console.error('🛑 CMS Collection Data Error:', ${JSON.stringify(
        e.message
      )})</script>`
    );
  }
}

async function fetchAndInject(request, injection) {
  const response = await fetch(request);
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return response;
  const html = await response.text();
  const updatedHtml = html.replace('</head>', injection + '</head>');
  return new Response(updatedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Content-Type': 'text/html',
    },
  });
}

async function getCMSCollectionAsync(token, collectionId, params = {}) {
  try {
    let items = [];
    let offset = 0;
    const limit = 100;
    const baseUrl = `https://api.webflow.com/v2/collections/${collectionId}/items/live`;

    while (true) {
      const query = new URLSearchParams({
        ...params,
        limit,
        offset,
      }).toString();
      const url = `${baseUrl}?${query}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      items = items.concat(data.items || []);
      const { pagination } = data;
      if (pagination.offset + pagination.limit >= pagination.total) {
        break;
      }
      offset += limit;
    }
    return items;
  } catch (e) {
    return e.message;
  }
}
