import axios from "axios";
import { ZodError } from "zod";

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10_000,
});

export function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (failureCount >= 1 || !axios.isAxiosError(error) || axios.isCancel(error)) {
    return false;
  }

  const status = error.response?.status;
  return status === undefined || status === 408 || status === 429 || status >= 500;
}

export function getApiErrorMessage(error: Error): string {
  if (error instanceof ZodError) {
    return "백엔드 응답 형식이 API 계약과 다릅니다.";
  }
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (error.response?.status === 401) return "로그인이 필요합니다.";
    if (error.response?.status === 403) return "접근 권한이 없습니다.";
    if (error.response?.status === 422) return "입력값과 허용된 설정을 확인하세요.";
    if (error.response?.status === 404) return "등록 정보가 없습니다.";
    return "백엔드에 연결하지 못했습니다. 서버 주소와 실행 상태를 확인하십시오.";
  }
  return "요청을 처리하지 못했습니다. 다시 확인하십시오.";
}

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

let csrfToken: string | null = null;
export function setCsrfToken(token: string | null) {
  csrfToken = token;
}
apiClient.interceptors.request.use((config) => {
  if (csrfToken && !["get", "head", "options"].includes((config.method ?? "get").toLowerCase())) {
    config.headers.set("X-CSRF-Token", csrfToken);
  }
  return config;
});
