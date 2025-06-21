import { ApiUrlConfig } from '../../../../projects/praxis-ui-core/src/lib/tokens/api-url.token';

export const environment: { production: boolean; apiUrl: ApiUrlConfig } = {
  production: false,
  apiUrl: {
    default: { baseUrl: 'http://localhost:8080/api' }
  }
};
