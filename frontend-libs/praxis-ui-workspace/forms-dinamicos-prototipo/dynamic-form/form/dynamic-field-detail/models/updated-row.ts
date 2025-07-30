import { RowConfig } from "../../../row-configurator/row-configurator/row-configurator.component";

export class UpdatedRow {
    constructor(public updatedRow: RowConfig, public isValid: boolean) { }
}