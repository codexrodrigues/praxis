package org.praxisplatform.uischema.service.base;

import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;
import org.praxisplatform.uischema.filter.specification.GenericSpecification;
import org.praxisplatform.uischema.filter.specification.GenericSpecificationsBuilder;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.praxisplatform.uischema.service.base.annotation.DefaultSortColumn;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * Interface base para operações CRUD e paginação com filtragem.
 *
 * @param <E>  Tipo da entidade
 * @param <ID> Tipo do identificador
 */
public interface BaseCrudService<E, ID> {

    BaseCrudRepository<E, ID> getRepository();
    GenericSpecificationsBuilder<E> getSpecificationsBuilder();
    Class<E> getEntityClass(); // Classe da entidade
    default List<E> findAll() { return getRepository().findAll(getDefaultSort()); }

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
    default Page<E> findAll(Pageable pageable) {
        Pageable sortedPageable = pageable;
        if (!pageable.getSort().isSorted()) {
            sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), getDefaultSort());
        }
        return getRepository().findAll(sortedPageable);
    }

    default Page<E> filter(GenericFilterDTO filterDTO, Pageable pageable) {
        Pageable sortedPageable = pageable;
        if (!pageable.getSort().isSorted()) {
            sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), getDefaultSort());
        }

        GenericSpecification<E> specification = getSpecificationsBuilder().buildSpecification(filterDTO, sortedPageable);
        return getRepository().findAll(specification.spec(), specification.pageable());

    }

    default Sort getDefaultSort() {
        List<Field> sortedFields = Arrays.stream(getEntityClass().getDeclaredFields())
                .filter(field -> field.isAnnotationPresent(DefaultSortColumn.class))
                .sorted(Comparator.comparingInt(field -> field.getAnnotation(DefaultSortColumn.class).priority()))
                .toList();

        if(sortedFields.isEmpty()) {
            return Sort.unsorted();
        }

        List<Sort.Order> orders = sortedFields.stream()
                .map(field -> {
                    DefaultSortColumn annotation = field.getAnnotation(DefaultSortColumn.class);
                    return new Sort.Order(
                            annotation.ascending() ? Sort.Direction.ASC : Sort.Direction.DESC,
                            field.getName()
                    );
                })
                .toList();

        return Sort.by(orders);
    }

    default EntityNotFoundException getNotFoundException() {
        return new EntityNotFoundException("Registro não encontrado");
    }
}
