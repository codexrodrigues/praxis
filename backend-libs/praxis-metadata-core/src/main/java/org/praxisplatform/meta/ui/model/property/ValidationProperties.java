package org.praxisplatform.meta.ui.model.property;
/**
 * Interface que define as configurações de validação para campos de formulário UI em APIs.
 */
public interface ValidationProperties {
    String REQUIRED = "required";
    String MIN_LENGTH = "minLength";
    String MAX_LENGTH = "maxLength";
    String MIN = "min";
    String MAX = "max";
    String PATTERN = "pattern";
    String REQUIRED_MESSAGE = "requiredMessage";
    String MIN_LENGTH_MESSAGE = "minLengthMessage";
    String MAX_LENGTH_MESSAGE = "maxLengthMessage";
    String PATTERN_MESSAGE = "patternMessage";
    String RANGE_MESSAGE = "rangeMessage";
    String CUSTOM_VALIDATOR = "customValidator";
    String ASYNC_VALIDATOR = "asyncValidator";
    String CONDITIONAL_REQUIRED = "conditionalRequired";
    String MIN_WORDS = "minWords";
    String ALLOWED_FILE_TYPES = "allowedFileTypes";
    String MAX_FILE_SIZE = "maxFileSize";
}

