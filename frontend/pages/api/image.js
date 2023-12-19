import fetch from "node-fetch";

export default async (req, res) => {
  if (!req.query.imageUrl) {
    return res.status(200).json({ error: "no imageUrl provided" });
  }

  const img = await fetchImage(req.query.imageUrl);   

  const oneYearInSeconds = 31536000;
  res.setHeader("Cache-Control", `public, max-age=${oneYearInSeconds}`);
  res.setHeader("Content-Type", img.filetype); // Adjust the content type as needed
  res.setHeader("Content-Length", img.filesize); // Adjust the content type as needed
  return res.status(200).end(img.buffer);
};

async function fetchImage(src) {
  // console.log(">>> fetching", src);
  const response = await fetch(src);
  if (response.status !== 200) {
    console.error("!!! fetchImage > fetch error", response.status, response);
    return {};
  }
  const buffer = await response.buffer();
  // console.log(">>> response.headers", response.headers);
  const filesize = response.headers.get("content-length");
  const filetype = response.headers.get("content-type");
  return {
    src,
    filesize,
    filetype,
    buffer,
  };
}
