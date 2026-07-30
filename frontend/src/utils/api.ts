const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export const request = async <T = any>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log('API:', method, `${BASE_URL}${path}`, body || '');

    const response = await fetch(`${BASE_URL}${path}`, options);

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401) {
      console.warn('Unauthorized - user may need to login again');
    }

    if (!response.ok) {
      return {
        error: data.message || data.error || 'Something went wrong',
        errors: data.errors,
      };
    }

    return { data };
  } catch (error: any) {
    console.error('API Request failed:', error);
    return {
      error: 'Network error. Please check if the server is running.',
    };
  }
};