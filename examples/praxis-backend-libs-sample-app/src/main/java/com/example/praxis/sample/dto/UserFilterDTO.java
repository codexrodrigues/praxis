package com.example.praxis.sample.dto;

import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;
import org.praxisplatform.uischema.extension.annotation.UISchema;

@UISchema(title = "Filtro de Usuários", description = "Critérios de busca para usuários.")
public class UserFilterDTO implements GenericFilterDTO {
    // No specific filterable fields for User identified for now.
    // If any are needed in the future, they can be added here and should also be documented with @UISchema.
}
