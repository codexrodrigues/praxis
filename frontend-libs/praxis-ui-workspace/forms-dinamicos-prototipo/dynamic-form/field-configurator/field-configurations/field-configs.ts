// Arquivo: projects/angular-ui/src/lib/dynamic-form/field-configurator/field-configs.ts

/**
 * Este arquivo (`field-configs.ts`) consolida todas as configurações de campos do sistema
 * em um único objeto `FieldConfigs`, utilizando o tipo `FieldConfigMap`.
 *
 * O objetivo deste arquivo é fornecer um ponto centralizado para o acesso às configurações de campos
 * disponíveis no sistema, permitindo que componentes e módulos dinâmicos acessem e utilizem essas
 * configurações de forma padronizada.
 *
 * Cada tipo de controle de campo (como `input`, `select`, `checkbox`, etc.) possui um arquivo de configuração
 * específico que define as propriedades e metadados personalizáveis para esse tipo.
 * Este arquivo importa todas essas configurações e as agrupa em um único objeto exportado.
 *
 * Esse mapeamento é utilizado, por exemplo, pelo assistente de formulários (`Form Wizard`), garantindo
 * que os formulários sejam gerados dinamicamente com base no tipo de controle utilizado.
 *
 * Componentes importados:
 * - `FieldConfigMap` → Tipo que define a estrutura do mapeamento entre tipos de controle e configurações de campos.
 * - Arquivos de configuração de campo individuais, como `inputConfig`, `selectConfig`, `checkboxConfig`, etc.
 */

import { FieldConfigMap } from './config.types';
import { inputConfig } from './input.config';
import { selectConfig } from './select.config';
import { checkboxConfig } from './checkbox.config';
import { radioConfig } from './radio.config';
import { textareaConfig } from './textarea.config';
import { dateConfig } from './date.config';
import { dateTimeConfig } from './dateTime.config';
import { maskedTextBoxConfig } from './maskedTextBox.config';
import { numericTextBoxConfig } from './numericTextBox.config';
import { calendarConfig } from './calendar.config';
import { dateRangeConfig } from './dateRange.config';
import { timePickerConfig } from './timePicker.config';
import { buttonConfig } from './button.config';
import {listFieldConfig} from './list-field.config';
import { buttonGroupConfig } from './buttonGroup.config';
import { floatingActionButtonConfig } from './floatingActionButton.config ';
import { switchButtonConfig } from './switchButton.config';
import { currencyTextBoxConfig } from './currencyTextBox.config';

// import { stepperConfig } from './stepper.config';

/**
 * Objeto que mapeia os tipos de controle de campo para suas respectivas configurações.
 *
 * Cada chave representa um tipo de campo (como 'input', 'select', 'checkbox', etc.),
 * e seu valor é um array contendo a configuração correspondente para aquele tipo de controle.
 *
 * Esse mapeamento permite que os formulários sejam construídos dinamicamente com base no tipo de controle
 * utilizado, garantindo padronização e reuso das configurações ao longo do sistema.
 */
export const FieldConfigs: FieldConfigMap = {
  input: inputConfig,
  select: selectConfig,
  checkbox: checkboxConfig,
  radio: radioConfig,
  textarea: textareaConfig,
  date: dateConfig,
  dateTime: dateTimeConfig,
  maskedTextBox: maskedTextBoxConfig,
  numericTextBox: numericTextBoxConfig,
  calendar: calendarConfig,
  dateRange: dateRangeConfig,
  timePicker: timePickerConfig,
  button: buttonConfig,
  listField: listFieldConfig,
  buttonGroup: buttonGroupConfig,
  switchButton: switchButtonConfig,
  floatingActionButton: floatingActionButtonConfig,
  currencyTextBox: currencyTextBoxConfig
};
