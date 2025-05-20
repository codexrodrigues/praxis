package org.praxisplatform.meta.ui.filter.spec;

import org.praxisplatform.meta.ui.filter.dto.GenericFilterDTO;

/**
 * Objeto para retornar tanto a {@link Specification} quanto o {@link Pageable} após processamento
 * pelo {@link GenericSpecificationsBuilder}
 *
 * @param spec
 * @param pageable
 * @param <E>      Tipo da entidade alvo da consulta.
 * @see GenericSpecificationsBuilder#buildSpecification(GenericFilterDTO, Pageable)
 */
public record PraxisSpecification<E>(Specification<E> spec, Pageable pageable) {
}
