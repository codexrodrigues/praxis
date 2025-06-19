package org.praxisplatform.uischema.util;

import org.junit.jupiter.api.Test;
import org.springdoc.core.models.GroupedOpenApi;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class OpenApiGroupResolverTest {

    @Test
    void resolvesGroupByPrefixMatch() {
        GroupedOpenApi funcionarios = GroupedOpenApi.builder()
                .group("funcionarios")
                .pathsToMatch("/api/hr/funcionarios/**")
                .build();

        OpenApiGroupResolver resolver = new OpenApiGroupResolver(List.of(funcionarios));

        String group = resolver.resolveGroup("/api/hr/funcionarios/filter");
        assertEquals("funcionarios", group);
    }
}
