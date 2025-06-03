package org.praxisplatform.uischema.service.base;

import org.junit.jupiter.api.Test;
import org.praxisplatform.uischema.filter.specification.GenericSpecificationsBuilder;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.praxisplatform.uischema.service.base.annotation.DefaultSortColumn;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BaseCrudServiceTest {

    // --- Test Entity Classes ---
    static class NoAnnotationEntity {}

    static class DirectAnnotationEntity {
        @DefaultSortColumn(ascending = false, priority = 0)
        private String name;

        // Getter needed for reflection if some test utility were to access it, but not for this test.
        public String getName() { return name; }
    }

    static class ParentEntity {
        @DefaultSortColumn(priority = 1) // Default ascending = true
        private String inheritedField;

        public String getInheritedField() { return inheritedField; }
    }

    static class ChildEntity extends ParentEntity {
        @DefaultSortColumn(priority = 0) // Default ascending = true
        private String childField;

        public String getChildField() { return childField; }
    }

    static class GrandparentEntity {
        @DefaultSortColumn(ascending = false, priority = 10)
        private String grandparentField;

        public String getGrandparentField() { return grandparentField; }
    }

    static class ParentNoAnnotationEntity extends GrandparentEntity {
        private String someOtherFieldInParent;

        public String getSomeOtherFieldInParent() { return someOtherFieldInParent; }
    }

    static class ChildWithSpecificAndDeepInheritedEntity extends ParentNoAnnotationEntity {
         @DefaultSortColumn(priority = 0, ascending = true)
        private String specificChildField;

        public String getSpecificChildField() { return specificChildField; }
    }

    // --- Test Service Implementation ---
    private <T> BaseCrudService<T, Long> createTestService(Class<T> entityClass) {
        return new BaseCrudService<T, Long>() {
            @Override
            public BaseCrudRepository<T, Long> getRepository() {
                return null; // Not needed for getDefaultSort
            }

            @Override
            public GenericSpecificationsBuilder<T> getSpecificationsBuilder() {
                return null; // Not needed for getDefaultSort
            }

            @Override
            public Class<T> getEntityClass() {
                return entityClass;
            }
        };
    }

    // --- Test Methods ---
    @Test
    void getDefaultSort_whenNoAnnotations_returnsUnsorted() {
        BaseCrudService<NoAnnotationEntity, Long> service = createTestService(NoAnnotationEntity.class);
        Sort sort = service.getDefaultSort();
        assertFalse(sort.isSorted());
    }

    @Test
    void getDefaultSort_whenDirectAnnotation_returnsCorrectSort() {
        BaseCrudService<DirectAnnotationEntity, Long> service = createTestService(DirectAnnotationEntity.class);
        Sort sort = service.getDefaultSort();
        assertTrue(sort.isSorted());
        Sort.Order order = sort.getOrderFor("name");
        assertNotNull(order);
        assertEquals(Sort.Direction.DESC, order.getDirection());
    }

    @Test
    void getDefaultSort_whenInheritedAndDirectAnnotations_respectsPriority() {
        BaseCrudService<ChildEntity, Long> service = createTestService(ChildEntity.class);
        Sort sort = service.getDefaultSort();
        assertTrue(sort.isSorted());

        List<Sort.Order> orders = sort.toList();
        assertEquals(2, orders.size());

        // childField has priority 0 (higher)
        assertEquals("childField", orders.get(0).getProperty());
        assertEquals(Sort.Direction.ASC, orders.get(0).getDirection());

        // inheritedField has priority 1 (lower)
        assertEquals("inheritedField", orders.get(1).getProperty());
        assertEquals(Sort.Direction.ASC, orders.get(1).getDirection());
    }

    @Test
    void getDefaultSort_whenDeepInheritanceAndSpecificAnnotation_respectsPriority() {
        BaseCrudService<ChildWithSpecificAndDeepInheritedEntity, Long> service =
            createTestService(ChildWithSpecificAndDeepInheritedEntity.class);
        Sort sort = service.getDefaultSort();
        assertTrue(sort.isSorted());

        List<Sort.Order> orders = sort.toList();
        assertEquals(2, orders.size(), "Should find specificChildField and grandparentField");

        // specificChildField has priority 0
        assertEquals("specificChildField", orders.get(0).getProperty());
        assertEquals(Sort.Direction.ASC, orders.get(0).getDirection());

        // grandparentField has priority 10
        assertEquals("grandparentField", orders.get(1).getProperty());
        assertEquals(Sort.Direction.DESC, orders.get(1).getDirection());
    }
}
