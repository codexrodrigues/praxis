package com.example.praxis.hr.dto;

import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;
import org.praxisplatform.uischema.extension.annotation.UISchema;

@UISchema(title = "Filtro de Cargos", description = "Critérios de busca para cargos.")
public class CargoFilterDTO implements GenericFilterDTO {
    // No specific filterable fields for Cargo identified for now.
    // If any are needed in the future, they can be added here and should also be documented with @UISchema.
}
