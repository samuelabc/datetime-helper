export function buildBookmarklet(baseUrl: string, encodedState: string): string {
  const target = `${baseUrl}?${encodedState}`;
  return `javascript:(function(){window.open(${JSON.stringify(target)},'_blank');})();`;
}

export function parseBookmarkletSearch(search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const value = params.toString();
  return value.length > 0 ? value : null;
}
