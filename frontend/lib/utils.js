import fetch from 'node-fetch';

export function replaceURLsWithMarkdownAnchors(text) {
  const regex = /((http?s:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
  return text.replace(regex, (match) => {
    // Check if the URL starts with http/https, if not, prepend 'http://'
    let url = match.startsWith('http') ? match : `http://${match}`;
    return `<a href="${url}">${match}</a>`;
  });
}

export async function getImageSize(src) {
  const baseUrl = process.env.WEBSITE_URL || `https://${process.env.VERCEL_URL}`;
  // console.log('>>> baseUrl', baseUrl);
  const response = await fetch(`${baseUrl}/api/image?method=getDimensions&imageUrl=${encodeURIComponent(src)}`);
  if (response.status !== 200) {
    console.error('Fetch Image Error:', response.status, response.statusText);
    return {};
  }
  return response.json();
}
