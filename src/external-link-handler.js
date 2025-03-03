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
    this.#EXCEPTION_LINKS.forEach((link) => {
      if (!href.includes(link)) {
        element.setAttribute('rel', this.#relAttribute);
      }
    });
  }
}

export default ExternalLinksHandler;
