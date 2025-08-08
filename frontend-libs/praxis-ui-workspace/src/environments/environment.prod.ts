import { ApiUrlConfig } from '@praxis/core';
import apiRoutes from '../../api-routes.json';

export const environment = {
  production: true,
  apiUrl: {
    default: { baseUrl: apiRoutes.apiBase, version: 'v1' },
    humanResources: { baseUrl: apiRoutes.humanResources, version: 'v1' },
  } as ApiUrlConfig,
};
