import { ApiUrlConfig } from '@praxis/core';

export const environment = {
  production: false,
  apiUrl: {
    default: { baseUrl: 'http://localhost:3000/api', version: 'v1' }
  } as ApiUrlConfig
};
