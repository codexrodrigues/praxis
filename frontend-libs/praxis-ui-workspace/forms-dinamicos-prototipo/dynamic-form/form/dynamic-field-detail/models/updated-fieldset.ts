import { FieldsetConfig } from "../../../fieldset-configurator/fieldset-configurator/fieldset-configurator.component";

export class UpdatedFieldSet {
    constructor(public updatedFieldset: FieldsetConfig, public isValid: boolean) { }
}