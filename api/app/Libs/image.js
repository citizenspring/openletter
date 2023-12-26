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
  const response = await fetch(src);
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
