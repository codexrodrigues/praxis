export interface HateoasLink {
  href: string;
  templated?: boolean;
  type?: string;
  deprecation?: string;
  profile?: string;
  name?: string;
  title?: string;
  hreflang?: string;
  [prop: string]: any;
}

export interface RestApiLinks {
  [rel: string]: HateoasLink | HateoasLink[];
}

export interface RestApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
  _links?: RestApiLinks;
  errors?: any;
  timestamp?: string;
}
