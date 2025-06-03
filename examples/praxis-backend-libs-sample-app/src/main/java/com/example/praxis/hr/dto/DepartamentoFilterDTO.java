package com.example.praxis.hr.dto;

import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;
import org.praxisplatform.uischema.extension.annotation.UISchema;

@UISchema(title = "Filtro de Departamentos", description = "Critérios de busca para departamentos.")
public class DepartamentoFilterDTO implements GenericFilterDTO {
    // No specific filterable fields for Departamento identified for now.
    // If any are needed in the future, they can be added here and should also be documented with @UISchema.
}
