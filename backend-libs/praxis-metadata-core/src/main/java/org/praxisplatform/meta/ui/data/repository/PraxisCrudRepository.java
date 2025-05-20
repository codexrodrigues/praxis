package org.praxisplatform.meta.ui.data.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface PraxisCrudRepository<E, ID> extends JpaRepository<E, ID>, JpaSpecificationExecutor<E> {
}
