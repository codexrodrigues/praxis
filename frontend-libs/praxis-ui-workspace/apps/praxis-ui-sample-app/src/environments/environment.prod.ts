import { ApiUrlConfig } from '../../../../projects/praxis-ui-core/src/lib/tokens/api-url.token';

export const environment: { production: boolean; apiUrl: ApiUrlConfig } = {
  production: true,
  apiUrl: {
    default: { baseUrl: 'https://api.example.com/api', version: 'v1' }
  }
};
