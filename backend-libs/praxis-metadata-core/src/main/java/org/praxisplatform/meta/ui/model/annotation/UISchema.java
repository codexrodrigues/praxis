package org.praxisplatform.meta.ui.model.annotation;

 import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
 import io.swagger.v3.oas.annotations.media.Schema;
 import org.praxisplatform.meta.ui.model.property.FieldControlType;

 import java.lang.annotation.Documented;
 import java.lang.annotation.Retention;
 import java.lang.annotation.RetentionPolicy;
 import java.lang.annotation.Target;

 import static java.lang.annotation.ElementType.*;

 /**
  * Anotação para definir metadados específicos do Praxis para renderização de UI,
  * complementando a anotação @Schema padrão da OpenAPI.
  *
  * Uso simplificado:
  * @UISchema(label = "Nome Completo", controlType = FieldControlType.INPUT, placeholder = "Digite seu nome")
  *
  * Uso avançado:
  * @UISchema(
  *     label = "Nome Completo",
  *     controlType = FieldControlType.INPUT,
  *     placeholder = "Digite seu nome",
  *     metadata = @PraxisUiProperties(properties = {
  *         @ExtensionProperty(name = "customProp", value = "customValue")
  *     })
  * )
  */
 @Target({FIELD, METHOD, PARAMETER, TYPE, ANNOTATION_TYPE})
 @Retention(RetentionPolicy.RUNTIME)
 @Documented
 @Schema
 public @interface UISchema {

     /**
      * Rótulo (label) a ser exibido na UI para o elemento anotado.
      * Este valor será adicionado às extensões x-ui.
      *
      * <p><b>Exemplo:</b> label = "Nome do Cliente"</p>
      */
     String label() default "";

     /**
      * Tipo de controle para renderização na UI.
      * Recomenda-se usar as constantes de {@link FieldControlType}.
      *
      * <p><b>Exemplo:</b> controlType = FieldControlType.DATE_PICKER</p>
      */
     String controlType() default "";

     /**
      * Texto de placeholder para campos de entrada.
      */
     String placeholder() default "";

     /**
      * Define se o campo é somente leitura.
      */
     boolean readonly() default false;

     /**
      * Define se o campo deve ser oculto na UI.
      */
     boolean hidden() default false;

     /**
      * Define uma dica de ajuda para o campo.
      */
     String helpText() default "";

     /**
      * Metadados extras específicos do Praxis para customizar o comportamento da UI.
      * Para propriedades avançadas que não estão disponíveis como atributos diretos.
      */
     PraxisUiProperties metadata() default @PraxisUiProperties(properties = {});
 }
