package org.praxisplatform.meta.ui.model.property;

/**
 * Interface que define os tipos de dados (`TYPE`) disponíveis para configuração dos campos de formulário.
 */
public interface FieldDataType {
    String TEXT = "text";
    String NUMBER = "number";
    String EMAIL = "email";
    String DATE = "date";
    String PASSWORD = "password";
    String FILE = "file";
    String URL = "url";
    String BOOLEAN = "boolean";
    String JSON = "json";
}
