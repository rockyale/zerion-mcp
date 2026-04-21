import { fetch } from "undici";
const BASE_URL = "https://api.zerion.io/v1";

export function getAuthHeader(apiKey: string): string {
  return "Basic " + Buffer.from(`${apiKey}:`).toString("base64");
}

export interface ZerionResponse<T> {
  data: T;
  links?: { self?: string; next?: string };
  meta?: Record<string, unknown>;
}

export interface FetchOptions {
  params?: Record<string, string | number | boolean | undefined>;
  apiKey: string;
}

export async function zerionFetch<T>(
  path: string,
  { params, apiKey }: FetchOptions
): Promise<ZerionResponse<T>> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: getAuthHeader(apiKey),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Zerion API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<ZerionResponse<T>>;
}

// Fetch all pages for paginated endpoints
export async function zerionFetchAll<T>(
  path: string,
  options: FetchOptions
): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = `${BASE_URL}${path}`;

  if (options.params) {
    const base = new URL(url);
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== "") {
        base.searchParams.set(key, String(value));
      }
    }
    url = base.toString();
  }

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: getAuthHeader(options.apiKey),
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Zerion API error ${res.status}: ${body}`);
    }

    const json = (await res.json()) as ZerionResponse<T[]>;
    if (Array.isArray(json.data)) results.push(...json.data);
    url = json.links?.next ?? null;
  }

  return results;
}
