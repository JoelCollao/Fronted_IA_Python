import axios from 'axios';

export class BaseApiService {
  async post<T>(url: string, data: any): Promise<T> {
    try {
      console.log(`[API] POST ${url}`, data);

      const response = await axios.post<T>(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      console.log(`[API] Response from POST ${url}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[API Error] POST ${url}:`, error);
      throw this.handleError(error);
    }
  }

  handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unknown error: ${error}`);
  }
}
