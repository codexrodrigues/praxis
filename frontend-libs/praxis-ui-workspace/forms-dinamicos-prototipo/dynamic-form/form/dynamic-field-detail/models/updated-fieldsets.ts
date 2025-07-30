import { FieldsetLayout } from "../../../../models/form-layout.model";

export class UpdatedFieldSets {
    constructor(public updatedFieldsets: FieldsetLayout[], public isValid: boolean) { }
}
