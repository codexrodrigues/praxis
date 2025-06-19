package org.praxisplatform.uischema.util;

import org.springdoc.core.models.GroupedOpenApi;

import java.util.Collections;
import java.util.List;

/**
 * Helper to resolve which OpenAPI group a request path belongs to.
 * It checks the {@link GroupedOpenApi#getPathsToMatch()} patterns and
 * returns the group name when the path matches one of them.
 */
public class OpenApiGroupResolver {

    private final List<GroupedOpenApi> groupedOpenApis;

    public OpenApiGroupResolver(List<GroupedOpenApi> groupedOpenApis) {
        this.groupedOpenApis = groupedOpenApis == null ? Collections.emptyList() : groupedOpenApis;
    }

    /**
     * Resolve the group name for a given request path.
     *
     * @param requestPath path of the incoming request
     * @return matching group name or {@code null} if none match
     */
    public String resolveGroup(String requestPath) {
        if (requestPath == null) {
            return null;
        }
        for (GroupedOpenApi groupedOpenApi : groupedOpenApis) {
            List<String> patterns = groupedOpenApi.getPathsToMatch();
            if (patterns == null) {
                continue;
            }
            for (String pattern : patterns) {
                String normalized = normalize(pattern);
                if (requestPath.startsWith(normalized)) {
                    return groupedOpenApi.getGroup();
                }
            }
        }
        return null;
    }

    private String normalize(String pattern) {
        if (pattern == null) {
            return "";
        }
        if (pattern.endsWith("/**")) {
            return pattern.substring(0, pattern.length() - 3);
        }
        if (pattern.endsWith("/*")) {
            return pattern.substring(0, pattern.length() - 2);
        }
        return pattern;
    }
}
