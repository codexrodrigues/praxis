package org.praxisplatform.meta.ui.data.service;

import org.praxisplatform.meta.ui.filter.dto.GenericFilterDTO;
import org.praxisplatform.meta.ui.filter.spec.PraxisSpecification;
import org.praxisplatform.meta.ui.filter.spec.GenericSpecificationsBuilder;
import org.praxisplatform.meta.ui.data.repository.PraxisCrudRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Interface base para operações CRUD e paginação com filtragem.
 *
 * @param <E>  Tipo da entidade
 * @param <ID> Tipo do identificador
 */
public interface PraxisCrudService<E, ID> {

    PraxisCrudRepository<E, ID> getRepository();
    GenericSpecificationsBuilder<E> getSpecificationsBuilder();
    default List<E> findAll() { return getRepository().findAll(); }

    default E findById(ID id) { return getRepository().findById(id).orElseThrow(this::getNotFoundException); }

    default E save(E entity) { return getRepository().save(entity); }
    default E mergeUpdate(E existing, E update) {
        return existing;
    }

    default E update(ID id, E entity) {
        return getRepository()
                .findById(id)
                .map(existing -> mergeUpdate(existing, entity))
                .map(existing ->getRepository().save(existing))
                .orElseThrow(this::getNotFoundException);
    }

    default void deleteById(ID id) { getRepository().findById(id).ifPresent(e -> getRepository().delete(e)); }

    // Método para paginação
    default Page<E> findAll(Pageable pageable) { return getRepository().findAll(pageable); }

    default Page<E> filter(GenericFilterDTO filterDTO, Pageable pageable) {
        PraxisSpecification<E> specification = getSpecificationsBuilder().buildSpecification(filterDTO, pageable);
        return getRepository().findAll(specification.spec(), specification.pageable());
    }

    default EntityNotFoundException getNotFoundException() {
        return new EntityNotFoundException("Registro não encontrado");
    }
}
