import { API_BASE_URL, SDK_VERSION, SDK_VERSION_HEADER_NAME } from "../config";

export interface HttpClientOptions {
  baseUrl?: string;
  sdkVersion?: string;
  credentials?: RequestCredentials;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly version: string;
  private readonly fetchOptions: RequestInit;

  constructor(
    public publishableKey: string,
    options: HttpClientOptions = {},
  ) {
    this.baseUrl = options.baseUrl ?? API_BASE_URL;

    if (!this.baseUrl.endsWith("/")) {
      this.baseUrl += "/";
    }

    this.version = options.sdkVersion || SDK_VERSION;
    this.fetchOptions = { credentials: options.credentials };
  }

  getUrl(path: string): URL {
    // Let's ensure it always works even if you put the slash or not
    if (path.startsWith("/")) {
      path = path.slice(1);
    }

    return new URL(path, this.baseUrl);
  }

  async get({
    path,
    params,
  }: {
    path: string;
    params?: URLSearchParams;
  }): ReturnType<typeof fetch> {
    if (!params) {
      params = new URLSearchParams();
    }

    params.set(SDK_VERSION_HEADER_NAME, this.version);
    params.set("publishableKey", this.publishableKey);

    const url = this.getUrl(path);
    url.search = params.toString();

    return fetch(url, this.fetchOptions);
  }

  async post({
    path,
    body,
  }: {
    path: string;
    body: any;
  }): ReturnType<typeof fetch> {
    return fetch(this.getUrl(path), {
      ...this.fetchOptions,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [SDK_VERSION_HEADER_NAME]: this.version,
        Authorization: `Bearer ${this.publishableKey}`,
      },
      body: JSON.stringify(body),
    });
  }
}
