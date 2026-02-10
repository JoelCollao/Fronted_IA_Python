import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { currentEnvironment } from '@core/config/environment';

export class BaseApiService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || currentEnvironment.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('[API Error]', error);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      return new Error(`API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network Error: No response from server');
    } else {
      // Something else happened
      return new Error(`Request Error: ${error.message}`);
    }
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}
