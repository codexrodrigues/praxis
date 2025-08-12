import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { RestApiResponse } from '../models/rest-api-response.model';
import { Page, Pageable } from '../models/page.model';

import { FieldDefinition } from '../models/field-definition.model';
import { ApiEndpoint } from '../models/api-endpoint.enum';

import { Inject, Injectable } from '@angular/core';
import {
  API_URL,
  ApiUrlConfig,
  ApiUrlEntry,
  buildApiUrl,
  buildHeaders,
} from '../tokens/api-url.token';
import { composeHeadersWithVersion } from '../helpers/version.helper';
import { SchemaNormalizerService } from './schema-normalizer.service';

/**
 * Interface para configuração de endpoints personalizados.
 *
 * Esta interface permite definir URLs específicas para cada operação CRUD,
 * substituindo os caminhos padrão gerados pelo serviço.
 *
 * Os caminhos podem ser:
 * - Absolutos (começando com 'http'): usados diretamente, sem modificação
 * - Relativos: anexados ao URL base da API (API_URL)
 *
 * Exemplo:
 * ```typescript
 * const endpoints: EndpointConfig = {
 *   getAll: 'produtos/disponiveis',          // Relativo: [API_URL]/produtos/disponiveis
 *   filter: 'https://api.externa/buscar'     // Absoluto: usa URL completa
 *   create: 'https://api.externa/criar-produto', // Absoluto: usa URL completa
 * };
 */
export interface EndpointConfig {
  getAll?: string;
  getById?: string;
  create?: string;
  update?: string;
  delete?: string;
  filter?: string;
  schema?: string;
}

/**
 * Opções para operações CRUD que permitem personalizar comportamentos específicos.
 *
 * @interface CrudOperationOptions
 */
export interface CrudOperationOptions {
  /**
   * Caminho do recurso pai para recursos aninhados. Exemplo: 'clientes/123'.
   * Quando fornecido, este caminho é incorporado na URL final, permitindo
   * operações em recursos que pertencem a outro recurso.
   *
   * Exemplos de uso:
   * - Obter endereços de um cliente: `getAll({ parentPath: 'clientes/123' })`
   * - Criar item em uma categoria: `create(novoItem, { parentPath: 'categorias/5' })`
   *
   * Este parâmetro é ignorado se um endpoint personalizado estiver configurado
   * para a operação específica sendo executada.
   */
  parentPath?: string;
  /** Chave do endpoint configurado via ApiUrlConfig */
  endpointKey?: ApiEndpoint;
}

/**
 * Serviço genérico para operações CRUD em APIs REST padronizadas.
 *
 * Permite também:
 * - Trabalhar com recursos aninhados via parentPath (ex: /clientes/123/enderecos)
 * - Definir endpoints customizados para cada operação
 * - Obter schemas dinâmicos de entidades para geração automática de grids e formulários
 *
 * Utilize configure() sempre antes das operações, informando o recurso que será manipulado.
 *
 * Exemplo de uso:
 *
 * ```typescript
 * crudService.configure('usuarios');
 * crudService.getAll().subscribe(usuarios => { ... });
 * ```
 *
 * @template T Tipo da entidade manipulada pelo serviço.
 */
@Injectable({
  providedIn: 'root',
})
export class GenericCrudService<T> {
  private baseApiUrl!: string; // Root URL for the API
  private apiUrl!: string; // Full base path for the configured resource
  private endpoints: EndpointConfig = {}; // Stores user-defined custom endpoints
  private apiUrlConfig: ApiUrlConfig;
  private currentEndpointKey: ApiEndpoint = ApiEndpoint.Default;
  private resourcePath!: string;

  // Nova propriedade para armazenar a URL do schema
  private _schemaUrl: string | null = null;
  private configured = false;

  private ensureConfigured(): void {
    if (!this.configured) {
      throw new Error(GenericCrudService.ERROR_MESSAGES.unconfiguredService);
    }
  }

  private resolveEndpointEntry(key?: ApiEndpoint): ApiUrlEntry {
    const cfgKey = key ?? this.currentEndpointKey;
    return this.apiUrlConfig[cfgKey] || this.apiUrlConfig['default'];
  }

  /**
   * Cria a instância do serviço genérico.
   *
   * @param http Angular HttpClient.
   * @param schemaNormalizer Serviço para normalização do schema.
   * @param apiUrlInjected URL base da API (via token de injeção).
   */
  constructor(
    private http: HttpClient,
    private schemaNormalizer: SchemaNormalizerService,
    @Inject(API_URL) apiUrlInjected: ApiUrlConfig,
  ) {
    this.apiUrlConfig = apiUrlInjected;
  }

  configure(resourcePath: string, endpointKey?: ApiEndpoint): void {
    if (!resourcePath || !resourcePath.trim()) {
      throw new Error(GenericCrudService.ERROR_MESSAGES.emptyResourcePath);
    }

    if (endpointKey) {
      this.currentEndpointKey = endpointKey;
    }
    const entry = this.resolveEndpointEntry(endpointKey);
    this.baseApiUrl = buildApiUrl(entry);

    const base = this.baseApiUrl.replace(/\/+$/, '');
    let resource = resourcePath.trim();

    // Convert absolute URLs to their path component
    if (/^https?:\/\//i.test(resource)) {
      try {
        const url = new URL(resource);
        resource = url.pathname;
      } catch {
        // ignore parse errors and treat as relative string
      }
    }

    resource = resource.replace(/^\/+/, '');

    // Remove duplicated `api` segments only if base URL already contains `/api`
    try {
      const basePath = new URL(base).pathname;
      if (/\/api(\/|$)/.test(basePath)) {
        resource = resource.replace(/^(?:api\/)+/, '');
      }
    } catch {
      // ignore invalid base URLs
    }

    this.resourcePath = resource;
    this.apiUrl = `${base}/${resource}`.replace(/\/+$/, '');
    this.configured = true;
    console.debug('[CRUD:Service] configure', {
      resourcePath,
      baseApiUrl: this.baseApiUrl,
    });
  }

  /**
   * Configura endpoints personalizados para cada operação CRUD, substituindo as URLs padrão.
   *
   * Este método permite definir caminhos específicos para cada tipo de operação (getAll, getById, etc.)
   * Os endpoints podem ser:
   * - Caminhos relativos: serão anexados ao baseApiUrl (ex: 'usuarios/ativos')
   * - URLs absolutas: usadas diretamente (ex: 'https://api.externa.com/usuarios')
   *
   * Exemplo de uso:
   * ```typescript
   * crudService.configureEndpoints({
   *   getAll: 'usuarios/ativos',        // GET [baseApiUrl]/usuarios/ativos
   *   create: 'https://api.ext/dados',  // POST https://api.ext/dados
   *   filter: 'usuarios/busca-avancada' // POST [baseApiUrl]/usuarios/busca-avancada
   * });
   * ```
   *
   * @param customEndpoints Objeto com endpoints customizados.
   */
  public configureEndpoints(customEndpoints: EndpointConfig): void {
    this.endpoints = { ...this.endpoints, ...customEndpoints };
  }

  /**
   * Constrói a URL completa para uma determinada operação CRUD, considerando endpoints personalizados e caminhos pai.
   *
   * Este método usa a seguinte ordem de prioridade:
   * 1. Endpoint personalizado definido pelo usuário (via configureEndpoints)
   * 2. Construção padrão de URL baseada no recurso configurado
   *
   * Para recursos aninhados, o parentPath é incorporado na URL final (ex: /clientes/123/enderecos).
   *
   * @param operation - A operação CRUD a ser executada (getAll, getById, create, update, delete, filter, schema)
   * @param id - Identificador opcional para operações que exigem ID (getById, update, delete)
   * @param parentPath - Caminho do recurso pai opcional para recursos aninhados (ex: 'clientes/123')
   * @returns A URL completa para a requisição à API
   * @throws Error quando o ID é obrigatório mas não fornecido, ou quando o serviço não está configurado
   */
  private getEndpointUrl(
    operation: keyof EndpointConfig,
    id?: string | number,
    parentPath?: string,
    endpointKey?: ApiEndpoint,
  ): string {
    const entry = this.resolveEndpointEntry(endpointKey);
    const baseApiUrl = buildApiUrl(entry);
    const customUserEndpoint = this.endpoints[operation];

    // Priority 1: User-defined custom endpoint
    if (customUserEndpoint) {
      if (customUserEndpoint.startsWith('http')) {
        // Absolute HTTP/HTTPS URL
        let url = customUserEndpoint.replace(/\/+$/, '');
        if (
          (operation === 'getById' ||
            operation === 'update' ||
            operation === 'delete') &&
          id !== undefined &&
          id !== null
        ) {
          url += `/${id}`;
        }
        return url;
      } else {
        // Relative custom path (relative to baseApiUrl)
        const endpoint = customUserEndpoint.replace(/^\/+/, '');
        let url = `${baseApiUrl}/${endpoint}`;
        url = url.replace(/\/+$/, '');
        if (
          (operation === 'getById' ||
            operation === 'update' ||
            operation === 'delete') &&
          id !== undefined &&
          id !== null
        ) {
          url += `/${id}`;
        }
        return url;
      }
    }

    // Priority 2: Standard path construction (no custom endpoint for this operation)
    if (!this.resourcePath) {
      // requires configure()
      throw new Error(GenericCrudService.ERROR_MESSAGES.unconfiguredService);
    }

    let resourceUrl = `${baseApiUrl}/${this.resourcePath}`; // Default base for the resource e.g. [baseApiUrl]/addresses

    if (parentPath) {
      const resourceNameOnly = this.resourcePath
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

      const cleanedParentPath = parentPath
        .trim()
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

      resourceUrl = `${baseApiUrl}/${cleanedParentPath}`;
      if (resourceNameOnly) {
        resourceUrl += `/${resourceNameOnly}`;
      }
    }

    resourceUrl = resourceUrl.replace(/\/+$/, ''); // Ensure no trailing slash before appending suffixes

    switch (operation) {
      case 'getAll':
        return `${resourceUrl}/all`;
      case 'getById':
        if (id === undefined || id === null)
          throw new Error(`ID is required for ${operation} operation.`);
        return `${resourceUrl}/${id}`;
      case 'create':
        return resourceUrl;
      case 'update':
        if (id === undefined || id === null)
          throw new Error(`ID is required for ${operation} operation.`);
        return `${resourceUrl}/${id}`;
      case 'delete':
        if (id === undefined || id === null)
          throw new Error(`ID is required for ${operation} operation.`);
        return `${resourceUrl}/${id}`;
      case 'filter':
        return `${resourceUrl}/filter`;
      case 'schema':
        return `${resourceUrl}/schemas`;
      default:
        // Should not be reached due to keyof EndpointConfig
        const exhaustiveCheck: never = operation;
        throw new Error(`Unknown operation: ${exhaustiveCheck}`);
    }
  }

  /**
   * Obtém o schema (metadados) do recurso, útil para construção dinâmica de grids e formulários.
   *
   * Exemplo:
   * ```typescript
   * crudService.configure('produtos');
   * crudService.getSchema().subscribe(schema => { ... });
   * ```
   *
   * @param options Parâmetros opcionais, incluindo parentPath para recursos aninhados.
   * @returns Observable com array de FieldDefinition.
   */

  public getSchema(
    options?: CrudOperationOptions,
  ): Observable<FieldDefinition[]> {
    this.ensureConfigured();
    const entry = this.resolveEndpointEntry(options?.endpointKey);
    const url = this.getEndpointUrl(
      'schema',
      undefined,
      options?.parentPath,
      options?.endpointKey,
    );
    // Armazena a URL para referência posterior
    this._schemaUrl = url;
    console.debug('[CRUD:Service] getSchema:url', { url });
    return this.http
      .get<any>(url, { headers: composeHeadersWithVersion(entry) })
      .pipe(
        map((response) => this.schemaNormalizer.normalizeSchema(response)),
        catchError(this.handleError),
      );
  }

  /**
   * Retorna a URL do último schema solicitado
   */
  public schemaUrl(): string {
    this.ensureConfigured();
    let url: string;

    // Se já temos a URL do schema armazenada, usá-la
    if (this._schemaUrl) {
      url = this._schemaUrl;
    } else {
      try {
        // Tentar construir a URL mesmo que getSchema() não tenha sido chamado
        url = this.getEndpointUrl('schema');
      } catch (error) {
        // Se o serviço não estiver configurado, retornar string vazia
        return '';
      }
    }

    // Remover protocolo, domínio e porta da URL
    // Ex: "http://localhost:8080/api/usuarios/schemas" -> "/api/usuarios/schemas"
    try {
      // Usar objeto URL para extrair apenas o caminho
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (error) {
      // Se não for uma URL válida ou já for apenas um caminho
      // Remover protocolo e domínio com regex
      return url.replace(/^(https?:\/\/)?[^\/]+(\/|$)/, '/');
    }
  }

  /**
   * Obtém um schema filtrado diretamente do endpoint `/schemas/filtered`.
   * Permite buscar schemas específicos para operações e tipos de documento.
   */
  public getFilteredSchema(params: {
    path?: string;
    document?: string;
    operation?: string;
    includeInternalSchemas?: boolean;
    schemaType?: string;
  }): Observable<FieldDefinition[]> {
    this.ensureConfigured();

    let httpParams = new HttpParams();
    const path = params.path ?? this.schemaUrl().replace(/\/schemas$/, '');
    httpParams = httpParams.set('path', path);
    if (params.document) {
      httpParams = httpParams.set('document', params.document);
    }
    if (params.operation) {
      httpParams = httpParams.set('operation', params.operation);
    }
    if (params.schemaType) {
      httpParams = httpParams.set('schemaType', params.schemaType);
    }
    if (params.includeInternalSchemas !== undefined) {
      httpParams = httpParams.set(
        'includeInternalSchemas',
        String(params.includeInternalSchemas),
      );
    }

    const entry = this.resolveEndpointEntry();
    const baseUrl = buildApiUrl(entry);
    const origin = new URL(baseUrl).origin;
    const url = `${origin}/schemas/filtered`;
    return this.http
      .get<any>(url, {
        params: httpParams,
        headers: composeHeadersWithVersion(entry),
      })
      .pipe(
        map((response) => this.schemaNormalizer.normalizeSchema(response)),
        catchError(this.handleError),
      );
  }

  /**
   * Retorna todos os registros do recurso.
   *
   * Exemplo:
   * ```typescript
   * crudService.configure('clientes');
   * crudService.getAll().subscribe(clientes => { ... });
   * ```
   *
   * Para recurso aninhado:
   * ```typescript
   * crudService.configure('enderecos');
   * crudService.getAll({ parentPath: 'clientes/123' }).subscribe(enderecos => { ... });
   * ```
   *
   * @param options Parâmetros opcionais, incluindo parentPath.
   * @returns Observable com array de entidades.
   */
  public getAll(options?: CrudOperationOptions): Observable<T[]> {
    return this.getAllResponse(options).pipe(map((r) => r.data));
  }

  public getAllResponse(
    options?: CrudOperationOptions,
  ): Observable<RestApiResponse<T[]>> {
    this.ensureConfigured();
    const entry = this.resolveEndpointEntry(options?.endpointKey);
    const url = this.getEndpointUrl(
      'getAll',
      undefined,
      options?.parentPath,
      options?.endpointKey,
    );
    return this.http
      .get<
        RestApiResponse<T[]>
      >(url, { headers: composeHeadersWithVersion(entry) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Retorna um registro pelo seu ID.
   *
   * Exemplo:
   * ```typescript
   * crudService.configure('usuarios');
   * crudService.getById(10).subscribe(usuario => { ... });
   * ```
   *
   * Para recurso aninhado:
   * ```typescript
   * crudService.configure('enderecos');
   * crudService.getById(5, { parentPath: 'clientes/123' }).subscribe(endereco => { ... });
   * ```
   *
   * @param id Identificador único do registro.
   * @param options Parâmetros opcionais, incluindo parentPath.
   * @returns Observable com a entidade encontrada.
   */
  public getById(
    id: string | number,
    options?: CrudOperationOptions,
  ): Observable<T> {
    return this.getByIdResponse(id, options).pipe(map((r) => r.data));
  }

  public getByIdResponse(
    id: string | number,
    options?: CrudOperationOptions,
  ): Observable<RestApiResponse<T>> {
    if (id === undefined || id === null)
      throw new Error(GenericCrudService.ERROR_MESSAGES.emptyId);
    this.ensureConfigured();
    const entry = this.resolveEndpointEntry(options?.endpointKey);
    const url = this.getEndpointUrl(
      'getById',
      id,
      options?.parentPath,
      options?.endpointKey,
    );
    console.debug('[CRUD:Service] getById:url', { url });
    return this.http
      .get<
        RestApiResponse<T>
      >(url, { headers: composeHeadersWithVersion(entry) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Cria um novo registro.
   *
   * Exemplo:
   * ```typescript
   * crudService.configure('produtos');
   * crudService.create({ nome: 'Mouse', preco: 50 }).subscribe(produto => { ... });
   * ```
   *
   * Para recurso aninhado:
   * ```typescript
   * crudService.configure('enderecos');
   * crudService.create({ rua: 'Rua Nova' }, { parentPath: 'clientes/123' }).subscribe(endereco => { ... });
   * ```
   *
   * @param entity Entidade a ser criada.
   * @param options Parâmetros opcionais, incluindo parentPath.
   * @returns Observable com a entidade criada.
   */
  public create(entity: T, options?: CrudOperationOptions): Observable<T> {
    return this.createResponse(entity, options).pipe(map((r) => r.data));
  }

  public createResponse(
    entity: T,
    options?: CrudOperationOptions,
  ): Observable<RestApiResponse<T>> {
    if (!entity) throw new Error(GenericCrudService.ERROR_MESSAGES.emptyEntity);
    this.ensureConfigured();
    const entry = this.resolveEndpointEntry(options?.endpointKey);
    const url = this.getEndpointUrl(
      'create',
      undefined,
      options?.parentPath,
      options?.endpointKey,
    );
    return this.http
      .post<
        RestApiResponse<T>
      >(url, entity, { headers: composeHeadersWithVersion(entry) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Atualiza um registro existente.
   *
   * Exemplo:
   * ```typescript
   * crudService.configure('usuarios');
   * crudService.update(10, { nome: 'Novo Nome' }).subscribe(usuario => { ... });
   * ```
   *
   * Para recurso aninhado:
   * ```typescript
   * crudService.configure('enderecos');
   * crudService.update(2, { rua: 'Rua Alterada' }, { parentPath: 'clientes/123' }).subscribe(endereco => { ... });
   * ```
   *
   * @param id Identificador único do registro.
   * @param entity Entidade atualizada.
   * @param options Parâmetros opcionais, incluindo parentPath.
   * @returns Observable com a entidade atualizada.
   */
  public update(
    id: string | number,
    entity: T,
    options?: CrudOperationOptions,
  ): Observable<T> {
    return this.updateResponse(id, entity, options).pipe(map((r) => r.data));
  }

  public updateResponse(
    id: string | number,
    entity: T,
    options?: CrudOperationOptions,
  ): Observable<RestApiResponse<T>> {
    if (id === undefined || id === null)
      throw new Error(GenericCrudService.ERROR_MESSAGES.emptyId);
    if (!entity) throw new Error(GenericCrudService.ERROR_MESSAGES.emptyEntity);
    this.ensureConfigured();
    const entry = this.resolveEndpointEntry(options?.endpointKey);
    const url = this.getEndpointUrl(
      'update',
      id,
      options?.parentPath,
      options?.endpointKey,
    );
    return this.http
      .put<
        RestApiResponse<T>
      >(url, entity, { headers: composeHeadersWithVersion(entry) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Remove um registro pelo ID.
   *
   * Exemplo:
   * ```typescript
   * crudService.configure('usuarios');
   * crudService.delete(5).subscribe(() => { ... });
   * ```
   *
   * Para recurso aninhado:
   * ```typescript
   * crudService.configure('enderecos');
   * crudService.delete(2, { parentPath: 'clientes/123' }).subscribe(() => { ... });
   * ```
   *
   * @param id Identificador único do registro.
   * @param options Parâmetros opcionais, incluindo parentPath.
   * @returns Observable vazio quando a remoção for bem-sucedida.
   */
  public delete(
    id: string | number,
    options?: CrudOperationOptions,
  ): Observable<void> {
    return this.deleteResponse(id, options).pipe(map(() => undefined));
  }

  public deleteResponse(
    id: string | number,
    options?: CrudOperationOptions,
  ): Observable<RestApiResponse<void>> {
    if (id === undefined || id === null)
      throw new Error(GenericCrudService.ERROR_MESSAGES.emptyId);
    this.ensureConfigured();
    const entry = this.resolveEndpointEntry(options?.endpointKey);
    const url = this.getEndpointUrl(
      'delete',
      id,
      options?.parentPath,
      options?.endpointKey,
    );
    return this.http
      .delete<
        RestApiResponse<void>
      >(url, { headers: composeHeadersWithVersion(entry) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Realiza busca paginada e filtrada conforme critérios informados.
   *
   * Exemplo:
   * ```typescript
   * crudService.configure('produtos');
   * crudService.filter({ categoria: 'Eletrônicos' }, { pageNumber: 0, pageSize: 10 })
   *   .subscribe(page => { ... });
   * ```
   *
   * @param filterCriteria Critérios para filtragem.
   * @param pageable Opções de paginação.
   * @param options Parâmetros opcionais, incluindo parentPath.
   * @returns Observable com página de entidades.
   */
  public filter(
    filterCriteria: Partial<T>,
    pageable?: Pageable,
    options?: CrudOperationOptions,
  ): Observable<Page<T>> {
    return this.filterResponse(filterCriteria, pageable, options).pipe(
      map((r) => r.data),
    );
  }

  public filterResponse(
    filterCriteria: Partial<T>,
    pageable?: Pageable,
    options?: CrudOperationOptions,
  ): Observable<RestApiResponse<Page<T>>> {
    let params = new HttpParams();
    if (pageable) {
      params = params
        .set('page', pageable.pageNumber.toString())
        .set('size', pageable.pageSize.toString());
      if (pageable.sort) {
        params = params.set('sort', pageable.sort);
      }
    }

    this.ensureConfigured();
    const entry = this.resolveEndpointEntry(options?.endpointKey);
    const url = this.getEndpointUrl(
      'filter',
      undefined,
      options?.parentPath,
      options?.endpointKey,
    );
    console.debug('[CRUD:Service] filter:url', { url });
    return this.http
      .post<
        RestApiResponse<Page<T>>
      >(url, filterCriteria, { params, headers: composeHeadersWithVersion(entry) })
      .pipe(catchError(this.handleError));
  }

  /**
   * Manipula erros de requisição HTTP.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Erro na API:', error);
    const errorMessage =
      error.error instanceof ErrorEvent
        ? `Erro do cliente: ${error.error.message}`
        : `Erro do servidor (status ${error.status}): ${error.message}`;
    return throwError(() => new Error(errorMessage));
  }

  private static readonly ERROR_MESSAGES = {
    emptyResourcePath: 'O caminho do recurso não pode ser vazio.',
    emptyId: 'O ID não pode ser nulo ou vazio.',
    emptyEntity: 'A entidade não pode ser nula ou vazia.',
    unconfiguredService:
      'Serviço não configurado. Chame configure() antes de usar.',
  };

  /**
   * Realiza uma requisição HTTP genérica.
   *
   * Exemplo:
   * ```typescript
   * crudService.genericEndpoint<{ resultado: string }>(
   *   'https://api.meusite.com/teste', 'POST', { parametro: 123 }
   * ).subscribe(resposta => { ... });
   * ```
   *
   * @template R Tipo do dado esperado na resposta.
   * @param url URL completa da requisição.
   * @param method Método HTTP (GET, POST, PUT, DELETE, PATCH).
   * @param body Corpo da requisição (opcional).
   * @param params HttpParams opcionais.
   * @returns Observable de resposta do tipo informado.
   */
  public genericEndpoint<R>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    body?: any,
    params?: HttpParams,
  ): Observable<R> {
    return this.http
      .request<R>(method, url, { body, params })
      .pipe(catchError(this.handleError));
  }
}
