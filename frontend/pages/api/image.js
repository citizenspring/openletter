import fetch from 'node-fetch';

export default async (req, res) => {
  console.log('API /api/image', req.query.imageUrl);

  if (!req.query.imageUrl) {
    return res.status(200).json({ error: 'no imageUrl provided' });
  }
  if (req.query.imageUrl.substr(0, 4) !== 'http') {
    return res.status(200).json({ error: `Invalid imageUrl: ${req.query.imageUrl}` });
  }

  try {
    const img = await fetchImage(req.query.imageUrl);
    if (!img.buffer || !img.filetype || !img.filesize) {
      throw new Error('Failed to fetch or process the image correctly.');
    }
    const oneYearInSeconds = 31536000;

    res.setHeader('Cache-Control', `public, max-age=${oneYearInSeconds}`);
    res.setHeader('Content-Type', img.filetype); // Adjust the content type as needed
    res.setHeader('Content-Length', img.filesize); // Adjust the content type as needed
    return res.status(200).end(img.buffer);
  } catch (e) {
    console.error('!!! /api/image', req.query.imageUrl, e);
    return res.status(500).json({ error: e.message });
  }
};

async function fetchImage(src) {
  // console.log(">>> fetching", src);
  const response = await fetch(src);
  if (response.status !== 200) {
    console.error('!!! fetchImage > fetch error', src, response.status, response);
    return {};
  }
  const buffer = await response.buffer();
  // console.log(">>> response.headers", response.headers);
  const filesize = response.headers.get('content-length');
  const filetype = response.headers.get('content-type');
  return {
    src,
    filesize,
    filetype,
    buffer,
  };
}
