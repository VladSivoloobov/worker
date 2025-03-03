class ExternalLinksHandler {
  #EXCEPTION_LINKS = [
    'google',
    'twitter',
    'facebook',
    'youtube',
    'linkedin',
    'x.com',
    'instagram',
    'pinterest',
    'tiktok',
    'yelp',
  ];

  #relAttribute = 'nofollow noopener noreferrer';

  async element(element) {
    const href = element.getAttribute('href');

    const isException = this.#EXCEPTION_LINKS.find((link) =>
      href.includes(link)
    );

    if (!isException) return;

    element.setAttribute('rel', this.#relAttribute);
  }
}

export default ExternalLinksHandler;
