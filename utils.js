function hash(string) {
  // sometimes might have extra space at end from epsg.io
  string = string.trim();

  // remove any extra spaces
  string = string.replace(/  /g, ' ');

  let hash = 0, i, chr;
  if (string.length === 0) return hash;
  const string_length = string.length;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }

  // convert to 16-bit
  hash = Math.round(hash / Math.pow(2, 16));

  return hash;
}

module.exports = { hash };