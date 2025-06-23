import { ApiUrlConfig } from '@praxis/core';

export const environment = {
  production: false,
  apiUrl: {
    default: { baseUrl: 'http://localhost:8086/api/human-resources', version: '' }
  } as ApiUrlConfig
};
