package org.praxisplatform.meta.ui.data.mapper;

public interface PraxisMapper<E, D> {

    D toDto(E entity);

    E toEntity(D dto);
}
