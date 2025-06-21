export interface RestApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
  links?: any;
  errors?: any;
  timestamp?: string;
}
