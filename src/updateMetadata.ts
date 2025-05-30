interface MetaTags {
  title?: string;
  ogUrl?: string;
  ogTitle?: string;
  ogImage?: string;
  description?: string;
  twitterTitle?: string;
  twitterImage?: string;
  ogDescription?: string;
  twitterDescription?: string;
}

export function updateMetadata(tags: MetaTags) {

  if (tags.title) document.title = tags.title;
  if (tags.ogUrl) document.querySelector('meta[property="og:url"]')?.setAttribute("content", tags.ogUrl);
  if (tags.ogTitle) document.querySelector('meta[property="og:title"]')?.setAttribute("content", tags.ogTitle);
  if (tags.ogImage) document.querySelector('meta[property="og:image"]')?.setAttribute("content", tags.ogImage);
  if (tags.description) document.querySelector('meta[name="description"]')?.setAttribute("content", tags.description);
  if (tags.twitterTitle) document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", tags.twitterTitle);
  if (tags.twitterImage) document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", tags.twitterImage);  
  if (tags.ogDescription) document.querySelector('meta[property="og:description"]')?.setAttribute("content", tags.ogDescription);
  if (tags.twitterDescription) document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", tags.twitterDescription);

}
