package org.praxisplatform.meta.ui.web.exception;

import lombok.Getter;

@Getter
public class BusinessLogicException extends RuntimeException{

    public BusinessLogicException(String message) {
        super(message);
    }
}
