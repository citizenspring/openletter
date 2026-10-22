const fetch = use('node-fetch');
const imageSize = use('image-size');

async function getImageSize(src) {
  const img = await fetchImage(src);
  if (!img.buffer || !img.filetype || !img.filesize) {
    console.error('!!! getImageSize: Failed to fetch or process the image correctly.');
    return { src };
  }
  return {
    src,
    width: img.width,
    height: img.height,
  };
}

async function fetchImage(src) {
  // compress: false so we never run zlib decoders on attacker-chosen URLs
  // (CVE-2026-111497, Brotli RCE; the API is on Node 16 which won't get the fix).
  // Images are not sent content-encoded in practice.
  const response = await fetch(src, { compress: false });
  if (response.status !== 200) {
    console.error('!!! fetchImage: fetch error', src, response.status, response);
    return {};
  }
  const buffer = await response.buffer();
  const filesize = response.headers.get('content-length');
  const filetype = response.headers.get('content-type');
  const dimensions = imageSize(buffer); // Get image dimensions
  return {
    src,
    filesize,
    filetype,
    width: dimensions.width,
    height: dimensions.height,
    buffer,
  };
}

module.exports = {
  getImageSize,
};
