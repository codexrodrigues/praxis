// Modifica o FormEntityMapperService para incluir o método hasChanges
import {Injectable} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {FieldMetadata} from '../../models/field-metadata.model';

@Injectable({providedIn: 'root'})
export class FormEntityMapperService {


  /**
   * Preenche o formulário com os dados da entidade aplicando as conversões necessárias
   * de acordo com os metadados dos campos
   *
   * @param formGroup FormGroup a ser preenchido
   * @param fieldsMetadata Metadados dos campos para orientar as conversões
   * @param entity Entidade com os dados a serem inseridos no formulário
   * @returns Record<string, any> com os valores convertidos que foram aplicados
   */
  patchFormWithEntity(formGroup: FormGroup, fieldsMetadata: FieldMetadata[], entity: any): Record<string, any> {
    // Verifica se a entidade existe
    if (!formGroup || !entity) {
      console.warn('Tentativa de preencher formulário com entidade vazia ou nula');
      return {};
    }

    // Cria uma cópia para não modificar o objeto original
    const formValue: Record<string, any> = {};

    fieldsMetadata.forEach(field => {
      try {
        const fieldName = field.name;

        // Pula campos sem nome ou não presentes na entidade
        if (!fieldName || !(fieldName in entity)) {
          return;
        }

        // Copia o valor original
        const originalValue = entity[fieldName];

        // Se o valor for undefined ou null, não precisa de conversão
        if (originalValue === undefined || originalValue === null) {
          formValue[fieldName] = originalValue;
          return;
        }

        // Tratamento específico para datas
        if (field.controlType === 'date' && originalValue) {
          try {
            if (Array.isArray(originalValue)) {
              // Se for um array [ano, mês, dia], converte para Date
              const [year, month, day] = originalValue;
              if (year && month && day) {
                // Importante: mês em JavaScript é baseado em zero (janeiro = 0)
                formValue[fieldName] = new Date(year, month - 1, day);
              } else {
                console.warn(`Formato de data inválido para ${fieldName}: [${originalValue}]`);
                formValue[fieldName] = null;
              }
            } else if (typeof originalValue === 'string') {
              // Se for string, converte para Date
              const date = new Date(originalValue);
              if (isNaN(date.getTime())) {
                console.warn(`String de data inválida para ${fieldName}: ${originalValue}`);
                formValue[fieldName] = null;
              } else {
                formValue[fieldName] = date;
              }
            } else {
              // Outros formatos de data
              formValue[fieldName] = originalValue;
            }
          } catch (dateError) {
            console.warn(`Erro ao processar data para o campo ${fieldName}:`, dateError);
            formValue[fieldName] = null;
          }
        } else {
          // Valores não-data são usados diretamente
          formValue[fieldName] = originalValue;
        }
      } catch (fieldError) {
        console.warn(`Erro ao processar o campo ${field.name}:`, fieldError);
        // Continue com o próximo campo
      }
    });

    // Preenche o formulário com os dados convertidos
    formGroup.patchValue(formValue);

    // Retorna os valores convertidos para uso opcional
    return formValue;
  }


  /**
   * Compara valores do form com a entidade original
   * Verifica se o formulário tem alterações não salvas em relação à entidade original
   *
   * @param formGroup FormGroup com os valores atuais
   * @param fieldsMetadata Metadados dos campos para orientar a comparação
   * @param originalEntity Entidade original para comparação
   * @returns true se houver alterações não salvas
   */
  hasChanges(formGroup: FormGroup, fieldsMetadata: FieldMetadata[], originalEntity: any): boolean {
    if (!formGroup || !originalEntity) {
      return false;
    }

    const currentValues = formGroup.value;

    // Compara os valores do formulário com os valores originais
    for (const key of Object.keys(currentValues)) {
      // Se o campo existe na entidade original, compara os valores
      if (originalEntity[key] !== undefined) {
        // Tratamento especial para datas
        if (currentValues[key] instanceof Date && originalEntity[key]) {
          if (typeof originalEntity[key] === 'string') {
            const originalDate = new Date(originalEntity[key]);
            if (originalDate.getTime() !== currentValues[key].getTime()) {
              return true;
            }
          } else if (Array.isArray(originalEntity[key])) {
            const [year, month, day] = originalEntity[key];
            const originalDate = new Date(year, month - 1, day);
            if (originalDate.getTime() !== currentValues[key].getTime()) {
              return true;
            }
          }
        } else if (currentValues[key] !== originalEntity[key]) {
          return true;
        }
      }
    }
    return false;
  }
}
