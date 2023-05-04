function shortenString(s, length = 20, lastchars = 5) {
  if (s.length > length + lastchars) {
    return (
      s.substring(0, length) +
      "..." +
      s.substring(s.length - lastchars, s.length)
    );
  }
}

export { shortenString };
