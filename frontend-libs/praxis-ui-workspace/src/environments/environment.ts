import { ApiUrlConfig } from '@praxis/core';
import apiRoutes from '../../api-routes.json';

export const environment = {
  production: false,
  apiUrl: {
    default: { baseUrl: apiRoutes.apiBase, version: '' },
    humanResources: { baseUrl: apiRoutes.humanResources, version: '' },
  } as ApiUrlConfig,
};
