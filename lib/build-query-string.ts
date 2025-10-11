/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 *used to build query string
 *
 * @param {Record<string, any>} query an object containing all the queries {page:1 , limit:10}
 * @return {*} query string e.g{ "page=1&limit=10"}
 */

export default function buildQueryString(query: Record<string, any>): string {
  return Object.entries(query)
    .filter(([_, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
    .join("&");
}

export function formatSearchString(
  search: string,
  defaultQueries: Record<string, any> = {},
): string {
  const queries = buildQueryString(defaultQueries);
  return search ? `${search}&${queries}` : `?${queries}`;
}