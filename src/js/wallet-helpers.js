function getShortUrl(url) {
  url = url.replace("https://", "");
  url = url.replace("http://", "");
  const cut_param = 26;
  if (url.length > cut_param && url.indexOf("/") != -1) {
    url =
      url.substring(0, url.indexOf("/") + 1) +
      "..." +
      url.substring(url.length - cut_param / 2, url.length);
  }
  // cut the url if it is too long, keep the first cut_param/2 characters and the last cut_param/2 characters
  if (url.length > cut_param) {
    url =
      url.substring(0, cut_param / 2) +
      "..." +
      url.substring(url.length - cut_param / 2, url.length);
  }

  return url;
}

export { getShortUrl };
