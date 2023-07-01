function parseProj4JS(input, { debug = false } = { debug: false }) {
  const start = input.indexOf(":") + 1;
  const end = input.indexOf('"', start + 2);
  const str = input.substring(start, end);
  if (debug) console.log('parseProj4JS str: "' + str + '"');
  if (str) return Number(str);
}

module.exports = parseProj4JS;
module.exports.default = parseProj4JS;
