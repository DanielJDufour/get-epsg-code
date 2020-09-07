module.exports = function clean_esriwkt(esriwkt) {
    esriwkt = esriwkt.replace(`DATUM["D_`, `DATUM["`);
  
    // reduce precision of decimal numbers to 15 digits
    esriwkt = esriwkt.replace(/\.\d{16,}/g, n => n.substr(0, 16));
  
    return esriwkt;
}