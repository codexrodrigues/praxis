import { ApiUrlConfig } from '@praxis/core';

export const environment = {
  production: true,
  apiUrl: {
    default: { baseUrl: '/api', version: 'v1' }
  } as ApiUrlConfig
};
