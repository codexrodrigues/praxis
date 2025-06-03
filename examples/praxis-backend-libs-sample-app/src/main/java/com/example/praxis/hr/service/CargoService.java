package com.example.praxis.hr.service;

import com.example.praxis.hr.entity.Cargo;
import com.example.praxis.hr.repository.CargoRepository;
import org.praxisplatform.uischema.filter.specification.GenericSpecificationsBuilder;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.praxisplatform.uischema.service.base.BaseCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CargoService implements BaseCrudService<Cargo, Long> {

    @Autowired
    private CargoRepository cargoRepository;

    @Override
    public BaseCrudRepository<Cargo, Long> getRepository() {
        return cargoRepository;
    }

    @Override
    public GenericSpecificationsBuilder<Cargo> getSpecificationsBuilder() {
        // Assuming default behavior is sufficient for now
        return new GenericSpecificationsBuilder<>();
    }

    @Override
    public Class<Cargo> getEntityClass() {
        return Cargo.class;
    }

    @Override
    public Cargo mergeUpdate(Cargo existing, Cargo payload) {
        existing.setNome(payload.getNome());
        existing.setNivel(payload.getNivel());
        existing.setDescricao(payload.getDescricao());
        existing.setSalarioMinimo(payload.getSalarioMinimo());
        existing.setSalarioMaximo(payload.getSalarioMaximo());
        return existing;
    }

    // No need to override save() unless specific pre-save logic for Cargo is required.
}
