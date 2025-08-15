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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * Interface base para operações CRUD e paginação com filtragem.
 *
 * @param <E>  Tipo da entidade
 * @param <D>  Tipo do DTO
 * @param <ID> Tipo do identificador
 * @param <FD> Tipo do DTO de filtro
 */
public interface BaseCrudService<E, D, ID, FD extends GenericFilterDTO> {

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

    /**
     * Exclui todos os registros correspondentes aos IDs fornecidos.
     *
     * @param ids Coleção de identificadores a serem removidos
     */
    default void deleteAllById(Iterable<ID> ids) {
        if (ids == null) {
            throw new IllegalArgumentException("ids must not be null");
        }
        getRepository().deleteAllById(ids);
    }

    // Método para paginação
    default Page<E> findAll(Pageable pageable) {
        Pageable sortedPageable = pageable;
        if (!pageable.getSort().isSorted()) {
            sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), getDefaultSort());
        }
        return getRepository().findAll(sortedPageable);
    }

    default Page<E> filter(FD filterDTO, Pageable pageable) {
        Pageable sortedPageable = pageable;
        if (!pageable.getSort().isSorted()) {
            sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), getDefaultSort());
        }

        GenericSpecification<E> specification = getSpecificationsBuilder().buildSpecification(filterDTO, sortedPageable);
        return getRepository().findAll(specification.spec(), specification.pageable());

    }

    default Sort getDefaultSort() {
        List<Field> sortedFields = getAllFields(getEntityClass()).stream()
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
        return new EntityNotFoundException("Registro não encontrado");
    }

    // Helper method to get all fields from class and its superclasses
    private List<Field> getAllFields(Class<?> clazz) {
        List<Field> fields = new ArrayList<>();
        while (clazz != null && clazz != Object.class) {
            fields.addAll(Arrays.asList(clazz.getDeclaredFields()));
            clazz = clazz.getSuperclass();
        }
        return fields;
    }
}
