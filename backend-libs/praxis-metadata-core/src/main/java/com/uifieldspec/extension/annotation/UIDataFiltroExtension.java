package com.uifieldspec.extension.annotation;

import org.praxisplatform.meta.ui.model.annotation.PraxisUiProperties;
import org.praxisplatform.meta.ui.model.property.FieldConfigProperties;
import org.praxisplatform.meta.ui.model.property.FieldControlType;
import org.praxisplatform.meta.ui.model.property.FieldDataType;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;

/**
 * Especialização de {@link PraxisUiProperties} para campos de filtro de datas na forma de intervalo.
 * <p>
 * E.g. ["2019-01-01", "2022-12-31"]
 *
 * @see PraxisUiProperties
 * @see UISchema
 */
@Target({FIELD, METHOD, PARAMETER, TYPE, ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@PraxisUiProperties(properties = {
        @ExtensionProperty(name = FieldConfigProperties.SORTABLE, value = "true"),
        @ExtensionProperty(name = FieldConfigProperties.FILTERABLE, value = "true"),
        @ExtensionProperty(name = FieldConfigProperties.TYPE, value = FieldDataType.DATE),
        @ExtensionProperty(name = FieldConfigProperties.CONTROL_TYPE, value = FieldControlType.DATE_RANGE),
        @ExtensionProperty(name = FieldConfigProperties.LABEL, value = "Intervalo"),
        @ExtensionProperty(name = FieldConfigProperties.HIDDEN, value = "true")
})
public @interface UIDataFiltroExtension {
}
