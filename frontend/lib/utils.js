export function replaceURLsWithMarkdownAnchors(text) {
  const regex = /((http?s:\/\/)?[-a-zA-Z0-9@:%._\+~#=,]{1,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=,]*)(?<!,)(?<!\)))/gi;
  return text.replace(regex, (match) => {
    // Check if the URL starts with http/https, if not, prepend 'http://'
    let url = match.startsWith('http') ? match : `http://${match}`;
    const anchor = match.length > 50 ? `${match.replace(/https?:\/\/(www\.)?/i, '').substring(0, 50)}...` : match;
    return `[${anchor}](${url})`;
    // return `<a href="${url}">${match}</a>`;
  });
}
