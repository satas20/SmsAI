/**
 * Removes all links (Markdown-style and plain URLs) from a given text.
 * @param text - The input text containing links.
 * @returns The text with all links removed.
 */
export const removeLinks = (text: string): string => {
  // Remove Markdown-style links [text](url)
  const withoutMarkdownLinks = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

  // Remove plain URLs (e.g., https://example.com)
  const withoutPlainUrls = withoutMarkdownLinks.replace(
    /https?:\/\/[^\s]+/g,
    '',
  );

  // Trim any extra spaces left after removing links
  return withoutPlainUrls.trim();
};
