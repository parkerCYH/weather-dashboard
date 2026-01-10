/**
 * 統一的 API Client
 * 處理認證、錯誤處理和重導向
 */

interface FetchOptions extends RequestInit {
    requireAuth?: boolean;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = "") {
        this.baseURL = baseURL;
    }

    async fetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const { requireAuth = true, ...fetchOptions } = options;

        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                ...fetchOptions,
                headers: {
                    "Content-Type": "application/json",
                    ...fetchOptions.headers,
                },
            });

            // 處理 401 未授權
            if (response.status === 401) {
                if (requireAuth) {
                    // 跳轉到登入頁面
                    const currentPath = window.location.pathname + window.location.search;
                    window.location.href = `/login?error=unauthorized&redirect=${encodeURIComponent(currentPath)}`;
                    throw new Error("Unauthorized - redirecting to login");
                }
            }

            // 處理其他錯誤狀態
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || errorData.message || `HTTP Error ${response.status}`
                );
            }

            return response.json();
        } catch (error) {
            // 如果是網路錯誤或其他錯誤，直接拋出
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    async get<T>(url: string, options?: FetchOptions): Promise<T> {
        return this.fetch<T>(url, { ...options, method: "GET" });
    }

    async post<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
        return this.fetch<T>(url, {
            ...options,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
        return this.fetch<T>(url, {
            ...options,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(url: string, options?: FetchOptions): Promise<T> {
        return this.fetch<T>(url, { ...options, method: "DELETE" });
    }
}

export const apiClient = new ApiClient();
