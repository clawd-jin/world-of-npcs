// API Client placeholder
// TODO: Implement API client for backend communication

export interface ApiClient {
  get: (endpoint: string) => Promise<any>;
  post: (endpoint: string, data: any) => Promise<any>;
  put: (endpoint: string, data: any) => Promise<any>;
  delete: (endpoint: string) => Promise<any>;
}

export const apiClient: ApiClient = {
  get: async (endpoint: string) => {
    console.log(`GET ${endpoint}`);
    throw new Error('Not implemented');
  },
  post: async (endpoint: string, data: any) => {
    console.log(`POST ${endpoint}`, data);
    throw new Error('Not implemented');
  },
  put: async (endpoint: string, data: any) => {
    console.log(`PUT ${endpoint}`, data);
    throw new Error('Not implemented');
  },
  delete: async (endpoint: string) => {
    console.log(`DELETE ${endpoint}`);
    throw new Error('Not implemented');
  },
};

export default apiClient;
