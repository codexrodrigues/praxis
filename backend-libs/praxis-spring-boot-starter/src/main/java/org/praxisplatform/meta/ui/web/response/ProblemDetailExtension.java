package org.praxisplatform.meta.ui.web.response;

import org.praxisplatform.meta.ui.web.exception.ErrorCategory;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.ProblemDetail;

@Getter
@Setter
public class ProblemDetailExtension extends ProblemDetail {

    private String message;
    private ErrorCategory category;

    public ProblemDetailExtension(String message) {
        this.message = message;
        this.category = null;
    }

}
