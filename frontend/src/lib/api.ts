export interface ApiErrorPayload {
  status: number;
  code: string;
  message: string;
  fieldErrors: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.fieldErrors = payload.fieldErrors ?? {};
  }
}

interface ApiFetchOptions extends RequestInit {
  redirectOn401?: boolean;
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { redirectOn401 = true, headers, ...rest } = options;

  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...rest,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      redirectOn401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/register")
    ) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      } else {
        window.location.replace("/login");
      }
    }

    const payload = (data ?? {}) as Partial<ApiErrorPayload>;
    throw new ApiError({
      status: payload.status ?? response.status,
      code: payload.code ?? "SERVER_ERROR",
      message: payload.message ?? "Request failed. Please try again.",
      fieldErrors: payload.fieldErrors ?? {},
    });
  }

  return data as T;
}
