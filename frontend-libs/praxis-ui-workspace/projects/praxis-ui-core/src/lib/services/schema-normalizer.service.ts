import { Injectable } from '@angular/core';
import { FieldMetadata } from '../models/field-metadata.model';

@Injectable({ providedIn: 'root' })
export class SchemaNormalizerService {
  /**
   * Convert raw schema from backend into a list of FieldMetadata objects.
   * The expected schema follows the OpenAPI structure with properties and
   * optional `x-ui` metadata per property.
   */
  normalizeSchema(schema: any): FieldMetadata[] {
    if (!schema || typeof schema !== 'object') {
      return [];
    }

    const properties: Record<string, any> = schema.properties ?? {};
    const fields: FieldMetadata[] = [];

    for (const [name, prop] of Object.entries(properties)) {
      const field: FieldMetadata = { name };
      if (prop && typeof prop === 'object') {
        if (prop['x-ui'] && typeof prop['x-ui'] === 'object') {
          Object.assign(field, prop['x-ui']);
        }
        if (!field.label && typeof prop['title'] === 'string') {
          field.label = prop['title'];
        }
        if (!field.type && typeof prop['type'] === 'string') {
          field.type = prop['type'];
        }
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
