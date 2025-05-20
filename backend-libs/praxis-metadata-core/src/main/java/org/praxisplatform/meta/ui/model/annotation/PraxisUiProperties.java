package org.praxisplatform.meta.ui.model.annotation;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import org.praxisplatform.meta.ui.model.property.FieldConfigProperties;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;

/**
 * Anotação usada para definir uma extensão customizada para UI como uma coleção de {@link ExtensionProperty}.
 * Esta anotação age como um container para metadados adicionais específicos de UI, normalmente anotado em atributos de
 * um DTO, para influenciar a renderização ou o comportamento da UI.
 *
 * <p>
 * Comumente usado junto com {@link UISchema} para aprimorar os metadados da interface do usuário, mas também pode
 * ser aplicado diretamente aos campos para personalizações específicas da estrutura. Os valores preenchidos nesta
 * anotação serão traduzidos para uma {@link Schema#extensions()} do Swagger de nome {@link PraxisUiProperties#NAME} e com
 * isso farão parte da documentação OpenApi do modelo onde for usada.
 * </p>
 *
 * <p><b>Exemplo de uso em um atributo:</b></p>
 * <pre>
 * {@code
 * public class PessoaFisicaDTO {
 *
 *     // Uso junto com UISchema
 *     @UISchema(
 *         description = "Data de nascimento",
 *         example = "26/11/2024",
 *         label = @ExtensionProperty(name = FieldConfigProperties.LABEL, value = "Data de nascimento"),
 *         metadata =
 *         @UIExtension(properties = {
 *             @ExtensionProperty(name = FieldConfigProperties.PLACEHOLDER, value = "Informe a data de nascimento da pessoa física"),
 *             @ExtensionProperty(name = FieldConfigProperties.HINT, value = "Data de nascimento"),
 *             @ExtensionProperty(name = ValidationProperties.REQUIRED, value = "true"),
 *             @ExtensionProperty(name = FieldConfigProperties.HELP_TEXT, value = "Informe a data de nascimento da pessoa física")
 *         })
 *     )
 *     // Aplicado diretamente no atributo
 *     @UIExtension(properties = {
 *         @ExtensionProperty(name = FieldConfigProperties.TYPE, value = FieldDataType.DATE),
 *         @ExtensionProperty(name = FieldConfigProperties.CONTROL_TYPE, value = FieldControlType.DATE_TIME_PICKER),
 *         @ExtensionProperty(name = FieldConfigProperties.HIDDEN, value = "true"),
 *         @ExtensionProperty(name = ValidationProperties.REQUIRED_MESSAGE, value = "A data é obrigatória.")
 *     })
 *     private LocalDate dataNascimento;
 *
 * }
 * }
 * </pre>
 *
 * @see Schema#extensions()
 * @see ExtensionProperty
 * @see UISchema
 */
@Target({FIELD, METHOD, PARAMETER, TYPE, ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PraxisUiProperties {
    /**
     * Constante identificador para extensão de UI. Usado para agrupar e prefixar propriedades de extensão durante o
     * processamento. Valor padrão no uso da anotação UIExtension e disponibilizado para padronização de nomenclatura.
     */
    String NAME = "x-ui";

    /**
     * Um array de {@link ExtensionProperty} definindo os metadados customizados de UI.
     * Cada propriedade representa um par nome-valor da forma {@code name = FieldConfigProperties.STR, value = "..."}.
     *
     * @return Array de propriedades da extensão.
     * @see FieldConfigProperties
     */
    ExtensionProperty[] properties();
}
