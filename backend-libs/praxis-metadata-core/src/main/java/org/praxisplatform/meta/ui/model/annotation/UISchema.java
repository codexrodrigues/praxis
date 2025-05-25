package org.praxisplatform.meta.ui.model.annotation; // Novo pacote proposto

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.media.Schema; // Importação da anotação padrão da OpenAPI

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;

/**
 * Anotação para definir metadados específicos do Praxis para renderização de UI,
 * complementando a anotação @Schema padrão da OpenAPI.
 *
 * Esta anotação deve ser usada para adicionar o 'label' e metadados 'x-ui' (via UIExtension).
 * Para outras propriedades do schema (como description, example, type, format, etc.),
 * use diretamente a anotação @io.swagger.v3.oas.annotations.media.Schema.
 *
 * Quando @UISchema é usada, ela implicitamente aplica @Schema, permitindo que ambas
 * coexistam e sejam processadas.
 * public class MeuDto {
 *
 *     @Schema(description = "Nome completo do usuário.",
 *             example = "Maria Silva",
 *             type = "string",
 *             maxLength = 150,
 *             requiredMode = Schema.RequiredMode.REQUIRED)
 *     @UISchema(
 *         label = @ExtensionProperty(name = FieldConfigProperty.LABEL, value = "Nome Completo"),
 *         metadata = @UIExtension(properties = {
 *             @ExtensionProperty(name = FieldConfigProperty.PLACEHOLDER, value = "Digite o nome completo")
 *         })
 *     )
 *     private String nomeUsuario;
 * }
 */
@Target({FIELD, METHOD, PARAMETER, TYPE, ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Schema // Faz com que @UISchema TAMBÉM APLIQUE @Schema da OpenAPI
public @interface UISchema {

/**
 * Um {@link ExtensionProperty} opcional definindo o label a ser exibido na UI para o elemento anotado.
 * Este valor será adicionado às extensões x-ui.
 * Exemplo: label = @ExtensionProperty(name = FieldConfigProperty.LABEL, value = "Nome do Cliente")
 *
 * <p><b>Default:</b> Uma {@link ExtensionProperty} vazia.</p>
 */
ExtensionProperty label() default @ExtensionProperty(name = "", value = "");

    /**
     * Metadados extras específicos do Praxis para customizar o comportamento da UI.
     * Utiliza {@link PraxisUiProperties} para definir um conjunto de {@link ExtensionProperty}
     * que serão agrupados sob a extensão "x-ui".
     *
     * <p><b>Default:</b> Um {@link PraxisUiProperties} vazio sem propriedades.</p>
     */
    PraxisUiProperties metadata() default @PraxisUiProperties(properties = {});
}
