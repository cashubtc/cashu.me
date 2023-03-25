function getShortUrl(url) {
  url = url.replace("https://", "");
  url = url.replace("http://", "");
  const cut_param = 46;
  if (url.length > cut_param && url.indexOf("/") != -1) {
    url =
      url.substring(0, url.indexOf("/") + 1) +
      "..." +
      url.substring(url.length - cut_param / 2, url.length);
  }
  return url;
}

export { getShortUrl };
