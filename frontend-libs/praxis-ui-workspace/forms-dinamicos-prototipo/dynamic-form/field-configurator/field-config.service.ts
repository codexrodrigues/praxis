import { Injectable } from '@angular/core';
import { FieldControlType, FieldMetadata, ValidatorOptions } from '../../models/field-metadata.model';
import { FieldConfigs } from './field-configurations/field-configs';

@Injectable({
  providedIn: 'root'
})
export class FieldConfigService {

  constructor() {}

  /**
   * Retorna as configurações disponíveis para um determinado tipo de controle.
   * @param controlType O tipo de controle (por exemplo, 'input', 'select', etc.).
   * @returns Um array de configurações parciais de `FieldMetadata`, se disponíveis; caso contrário, um array vazio.
   */
  getConfig(controlType: FieldControlType): Partial<FieldMetadata>[] {
    return FieldConfigs[controlType] || [];
  }

  /**
   * Atualiza (ou insere) propriedades em uma configuração avançada.
   * Útil para injetar novas validações ou alterar valores padrão.
   * @param config A configuração original (Partial<FieldMetadata>)
   * @param updates Objeto com as propriedades a serem atualizadas
   * @returns A configuração atualizada
   */
  updateAdvancedConfig(config: Partial<FieldMetadata>, updates: Partial<FieldMetadata>): Partial<FieldMetadata> {
    return { ...config, ...updates };
  }

  /**
   * Aplica opções de validação à configuração avançada de um input.
   * Se já houver validadores definidos, mescla as novas opções.
   * @param config A configuração avançada (Partial<FieldMetadata>) de um input
   * @param validatorOptions As opções de validação a aplicar
   * @returns A configuração modificada com os validadores atualizados
   */
  applyValidatorOptions(config: Partial<FieldMetadata>, validatorOptions: ValidatorOptions): Partial<FieldMetadata> {
    config.validators = { ...(config.validators || {}), ...validatorOptions };
    return config;
  }

  /**
   * Realiza uma normalização simples na configuração avançada.
   * Por exemplo, para campos do tipo select ou multiSelect, alerta se nem 'options' nem 'endpoint' forem fornecidos.
   * @param config A configuração avançada a ser normalizada.
   * @returns A configuração, possivelmente modificada.
   */
  normalizeConfig(config: Partial<FieldMetadata>): Partial<FieldMetadata> {
    if ((config.controlType === 'select' || config.controlType === 'multiSelect') &&
      !config.options && !config.endpoint) {
      console.warn(`A configuração para o tipo ${config.controlType} deve definir 'options' ou 'endpoint'.`);
    }
    // Outras regras de normalização podem ser adicionadas aqui.
    return config;
  }
}
