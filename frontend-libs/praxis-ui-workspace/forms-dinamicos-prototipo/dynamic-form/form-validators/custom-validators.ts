import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/**
 * Validador customizado que verifica se o valor do input não está em um array de strings.
 * @param forbiddenValues Array de strings que não são permitidas como valor do input.
 * @param errorMessage Mensagem de erro personalizada.
 * @returns ValidatorFn que valida o controle.
 */
export function forbiddenValuesValidator(forbiddenValues: string[], errorMessage?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (forbiddenValues.includes(value)) {
      return {
        forbiddenValue:  errorMessage || `O valor '${value}' não é permitido.`
      };
    }
    return null;
  };
}
