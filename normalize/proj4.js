/**
 *
 * @param {String} str - PROJ.4 string
 * @returns {String} normalized PROJ.4 string
 */
function normalize_proj4(str, { debug = false, remove_k1 = true, remove_no_defs = true, remove_title = true, remove_init = true, remove_type = true } = {}) {
  str = str.trim();

  // replace any accidental extra spaces
  str = str.replace(/ +/g, " ");

  // sort params
  let parts = str
    .split(/ ?\+/g)
    .filter(it => it.trim() !== "")
    .sort();

  // seems like k=1 is interpreted as default
  // for example https://epsg.io/3031.proj4 dropped it
  if (remove_k1) parts = parts.filter(it => it !== "k=1");
  if (remove_no_defs) parts = parts.filter(it => it !== "no_defs");
  if (remove_type) parts = parts.filter(it => !it.startsWith("type"));
  if (remove_init) parts = parts.filter(it => !it.startsWith("init"));
  if (remove_title) parts = parts.filter(it => !it.startsWith("title"));

  str = parts.map(it => "+" + it).join(" ");

  if (debug) console.log('normalized proj4 string\nfrom "' + arguments[0] + '"\nto "' + str + '"');

  return str;
}

module.exports = normalize_proj4;
module.exports.default = normalize_proj4;
