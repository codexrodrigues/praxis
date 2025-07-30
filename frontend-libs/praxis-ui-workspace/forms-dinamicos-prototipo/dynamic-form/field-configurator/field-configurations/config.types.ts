// Arquivo: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\config.types.ts
/**
 * Este arquivo (config.types.ts) define a função auxiliar e os tipos que são utilizados
 * em todos os arquivos de configuração de campos do projeto.
 *
 * O objetivo deste arquivo é padronizar a criação das configurações de campos, garantindo que
 * cada configuração siga uma estrutura consistente.
 *
 * Principais componentes:
 *
 *   1. Função `createField`:
 *      - Uma função genérica auxiliar utilizada para criar objetos de configuração para cada campo.
 *      - Garante que qualquer configuração passada inclua obrigatoriamente a propriedade `controlType`.
 *      - Aceita uma definição parcial dos metadados do campo (permitindo substituições opcionais)
 *        e retorna o mesmo objeto para posterior normalização.
 *
 *   2. Tipo `FieldConfigMap`:
 *      - Define um mapeamento entre tipos de controle de campo (como 'input', 'select', etc.)
 *        e arrays de objetos de configuração desses campos.
 *      - Esse tipo é utilizado para combinar todas as configurações individuais de controle em uma estrutura unificada.
 *
 * No fluxo geral, cada arquivo de configuração de controle específico (como `input.config.ts`, `button.config.ts`, etc.)
 * importa este arquivo para utilizar a função `createField`. Esses arquivos de configuração exportam arrays de definições de campos.
 * Um arquivo central de índice então agrega essas configurações utilizando o tipo `FieldConfigMap`, permitindo que os
 * desenvolvedores recuperem facilmente a configuração correta com base no tipo de controle utilizado no assistente de formulários
 * ou em qualquer outro componente.
 *
 * Essa abordagem modular promove a separação de responsabilidades, manutenção facilitada e maior reutilização do código em todo o sistema.
 */
import { ComponentMetadata, FieldControlType, FieldMetadata } from '../../../models/field-metadata.model';

/**
 * Função auxiliar para criar um objeto de configuração de campo.
 *
 * @param config - Definição parcial de `FieldMetadata`, incluindo obrigatoriamente a propriedade `controlType`.
 * @returns O objeto de configuração fornecido.
 *
 * @example
 * // Exemplo de uso em um arquivo de configuração de controle (e.g. input.config.ts):
 * const inputConfig = [
 *   createField({
 *     name: 'placeholder',
 *     label: 'Texto de apoio',
 *     type: 'text',
 *     required: false,
 *     placeholder: 'Digite um texto...',
 *     controlType: 'input'
 *   })
 * ];
 */
export function createField<T extends FieldControlType>(
  config: Partial<FieldMetadata> & { controlType: T }
): Partial<FieldMetadata> {
  return config;
}

/**
 * Define um mapeamento tipado entre tipos de controle de campo e arrays de objetos de configuração desses campos.
 *
 * Cada tipo de controle de campo (ex.: 'input', 'select', 'button', etc.) é associado a um array de objetos
 * `Partial<FieldMetadata>`, que descrevem as propriedades personalizáveis desse tipo. Esse mapeamento permite
 * que o sistema carregue e construa formulários dinamicamente, selecionando as configurações corretas com base no tipo de controle.
 */
export type FieldConfigMap = Partial<Record<FieldControlType, Partial<ComponentMetadata>[]>>;
