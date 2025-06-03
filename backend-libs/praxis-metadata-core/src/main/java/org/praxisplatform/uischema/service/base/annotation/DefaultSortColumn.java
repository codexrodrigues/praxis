package org.praxisplatform.uischema.service.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation utilizada para definir a coluna padrão de ordenação em uma consulta JPA.
 * <p>
 *     O padrão é usar a coluna identificadora da entidade, seja ela um campo simples ou um campo composto.
 *     Caso seja desejado alterar essa coluna, essa anotação pode ser usada em um campo de uma entidade para
 *     definir explicitamente a coluna a ser considerada na ordenação.
 *     <ul>
 *          <li><b>ascending</b>: Indica se a ordenação na coluna padrão é em ordem ascendente ou descendente.</li>
 *          <li><b>priority</b>: Define a prioridade da ordenação. A menor prioridade tem a maior prioridade.</li>
 *      </ul>
 * </p>
 **/


@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DefaultSortColumn {
    boolean ascending() default true;
    int priority() default 0;
}
