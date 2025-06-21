import { Injectable } from '@angular/core';
import { FieldDefinition } from '../models/field-definition.model';

@Injectable({ providedIn: 'root' })
export class SchemaNormalizerService {

  /** Convert value to boolean. Accepts boolean, string or number. */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return false;
  }

  /** Ensure an array of strings from various inputs. */
  private parseStringArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.map((v) => String(v));
    }
    if (typeof value === 'string') {
      return [value];
    }
    return [];
  }

  /** Parse option arrays into `{ key, value }` objects. */
  private parseOptions(value: any): { key: string; value: string }[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.map((opt: any) => {
      if (typeof opt === 'object') {
        const k = opt.key ?? opt.value ?? opt.label ?? '';
        const v = opt.value ?? opt.label ?? opt.key ?? '';
        return { key: String(k), value: String(v) };
      }
      return { key: String(opt), value: String(opt) };
    });
  }

  /** Safely create a function from string. */
  private parseFunction(fn: any): Function | undefined {
    if (typeof fn === 'function') {
      return fn;
    }
    if (typeof fn === 'string' && fn.trim()) {
      try {
        // eslint-disable-next-line no-new-func
        return new Function(`return (${fn});`)();
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  /** Extract validation related properties. */
  private parseValidators(ui: Record<string, any>): Record<string, any> {
    if (!ui || typeof ui !== 'object') {
      return {};
    }
    const out: Record<string, any> = {};
    const props = [
      'required',
      'requiredMessage',
      'minLength',
      'minLengthMessage',
      'maxLength',
      'maxLengthMessage',
      'min',
      'max',
      'rangeMessage',
      'pattern',
      'patternMessage',
      'allowedFileTypes',
      'fileTypeMessage',
      'maxFileSize',
      'customValidator',
      'asyncValidator',
      'minWords'
    ];

    for (const p of props) {
      if (ui[p] !== undefined) {
        if (p === 'allowedFileTypes') {
          out[p] = this.parseStringArray(ui[p]);
        } else if (p === 'customValidator' || p === 'asyncValidator') {
          const fn = this.parseFunction(ui[p]);
          if (fn) {
            out[p] = fn;
          }
        } else {
          out[p] = ui[p];
        }
      }
    }
    return out;
  }

  /** Parse array of button definitions. */
  private parseButtons(value: any): any[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.map((v) => ({ ...v }));
  }

  /**
   * Convert raw schema from backend into a list of FieldDefinition objects.
   * The expected schema follows the OpenAPI structure with properties and
   * optional `x-ui` metadata per property.
   */
  normalizeSchema(schema: any): FieldDefinition[] {
    if (!schema || typeof schema !== 'object') {
      return [];
    }

    const properties: Record<string, any> = schema.properties ?? {};
    const fields: FieldDefinition[] = [];

    for (const [name, prop] of Object.entries(properties)) {
      const field: FieldDefinition = { name };

      const ui = prop && typeof prop === 'object' && typeof prop['x-ui'] === 'object' ? prop['x-ui'] : {};

      // -------------------------------------------------------------------
      // Basic information
      // -------------------------------------------------------------------
      field.label = ui.label ?? prop.title ?? name;
      field.type = ui.type ?? prop.type;
      if (ui.controlType) {
        field.controlType = ui.controlType;
      }
      if (ui.description || prop.description) {
        field.description = ui.description ?? prop.description;
      }
      if (ui.order !== undefined) {
        field.order = Number(ui.order);
      }
      if (ui.group !== undefined) {
        field.group = ui.group;
      }

      // -------------------------------------------------------------------
      // Behaviour and validation
      // -------------------------------------------------------------------
      if (ui.readOnly !== undefined) {
        field.readOnly = this.parseBoolean(ui.readOnly);
      }
      if (ui.disabled !== undefined) {
        field.disabled = this.parseBoolean(ui.disabled);
      }
      if (ui.inlineEditing !== undefined) {
        field.inlineEditing = this.parseBoolean(ui.inlineEditing);
      }
      if (ui.defaultValue !== undefined) {
        field.defaultValue = ui.defaultValue;
      }

      Object.assign(field, this.parseValidators(ui));

      // Inline conditional functions
      const condDisplay = this.parseFunction(ui.conditionalDisplay);
      if (condDisplay) {
        field.conditionalDisplay = condDisplay;
      }
      const condRequired = this.parseFunction(ui.conditionalRequired);
      if (condRequired) {
        field.conditionalRequired = condRequired;
      }
      const transformFn = this.parseFunction(ui.transformValueFunction);
      if (transformFn) {
        field.transformValueFunction = transformFn;
      }

      // -------------------------------------------------------------------
      // Layout and presentation
      // -------------------------------------------------------------------
      if (ui.width !== undefined) {
        field.width = ui.width;
      }
      if (ui.hint !== undefined) {
        field.hint = ui.hint;
      }
      if (ui.icon !== undefined) {
        field.icon = ui.icon;
      }
      if (ui.iconPosition !== undefined) {
        field.iconPosition = ui.iconPosition;
      }
      if (ui.iconSize !== undefined) {
        field.iconSize = ui.iconSize;
      }
      if (ui.tooltipOnHover !== undefined) {
        field.tooltipOnHover = ui.tooltipOnHover;
      }

      // -------------------------------------------------------------------
      // Options and dependencies
      // -------------------------------------------------------------------
      if (ui.options !== undefined) {
        field.options = this.parseOptions(ui.options);
      }
      if (ui.optionGroups !== undefined) {
        field.optionGroups = this.parseOptions(ui.optionGroups);
      }
      if (ui.disabledOptions !== undefined) {
        field.disabledOptions = this.parseStringArray(ui.disabledOptions);
      }
      if (ui.endpoint !== undefined) {
        field.endpoint = ui.endpoint;
      }
      if (ui.dependentField !== undefined) {
        field.dependentField = ui.dependentField;
      }
      if (ui.resetOnDependentChange !== undefined) {
        field.resetOnDependentChange = this.parseBoolean(ui.resetOnDependentChange);
      }

      if (ui.buttons !== undefined) {
        field.buttons = this.parseButtons(ui.buttons);
      }

      fields.push(field);
    }

    // Order by the optional 'order' property when present
    fields.sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    return fields;
  }
}
