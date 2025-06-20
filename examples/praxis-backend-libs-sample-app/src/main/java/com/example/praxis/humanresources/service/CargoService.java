package com.example.praxis.humanresources.service;

import com.example.praxis.humanresources.dto.CargoDTO;
import com.example.praxis.humanresources.dto.CargoFilterDTO;
import com.example.praxis.humanresources.entity.Cargo;
import com.example.praxis.humanresources.repository.CargoRepository;
import org.praxisplatform.uischema.service.base.AbstractBaseCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CargoService extends AbstractBaseCrudService<Cargo, CargoDTO, Long, CargoFilterDTO> {

    @Autowired
    public CargoService(CargoRepository cargoRepository) {
        super(cargoRepository, Cargo.class);
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
