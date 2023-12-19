export function replaceURLsWithMarkdownAnchors(text) {
  const regex = /((http?s:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
  return text.replace(regex, (match) => {
    // Check if the URL starts with http/https, if not, prepend 'http://'
    let url = match.startsWith('http') ? match : `http://${match}`;
    return `[${match}](${url})`;
  });
}
