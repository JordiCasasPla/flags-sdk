import { isObject, invariant } from "./utils"

type HttpResponse<T> = {
  ok: boolean,
  status: number,
  data: T,
}

export const HttpClient = {
  get: async<T>({ url, headers, timeoutMs = 10_000 }: { url: string, headers?: Record<string, string>, timeoutMs: number}) : Promise<HttpResponse<T>> => {

    invariant(isObject(headers), 'HttpClient: headers must be an object')
    invariant(typeof url === 'string' && url.length > 0, 'HttpClient: url must be a non-empty string')

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    })

    const data = await response.json() as T

    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  },
  post: async<TBody, TResponse>({ url, body, headers, timeoutMs = 10_000 }: { url: string, body: TBody, headers?: Record<string, string>, timeoutMs: number }): Promise<HttpResponse<TResponse>> => {
    invariant(isObject(headers), 'HttpClient: headers must be an object')
    invariant(typeof url === 'string' && url.length > 0, 'HttpClient: url must be a non-empty string')

    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify(body),
    })

    const data = await response.json() as TResponse

    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  }
}
