
export interface ApiError {
    success?: boolean,
    message?: string,
    errors?: Record<string, string>[];
}