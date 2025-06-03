package com.example.praxis.hr.controller;

import com.example.praxis.hr.dto.CargoDTO;
import com.example.praxis.hr.entity.Cargo;
import com.example.praxis.hr.mapper.CargoMapper;
import com.example.praxis.hr.service.CargoService;
import org.praxisplatform.uischema.controller.base.AbstractCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr/cargos")
public class CargoController extends AbstractCrudController<Cargo, CargoDTO, Long> {

    @Autowired
    private CargoService cargoService;

    @Autowired
    private CargoMapper cargoMapper;

    @Override
    protected CargoService getService() {
        return cargoService;
    }

    @Override
    protected CargoDTO toDto(Cargo entity) {
        return cargoMapper.toDto(entity);
    }

    @Override
    protected Cargo toEntity(CargoDTO dto) {
        return cargoMapper.toEntity(dto);
    }

    @Override
    protected Class<? extends AbstractCrudController<Cargo, CargoDTO, Long>> getControllerClass() {
        return CargoController.class;
    }

    @Override
    protected Long getEntityId(Cargo entity) {
        return entity.getId();
    }

    @Override
    protected Long getDtoId(CargoDTO dto) {
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return "/api/hr/cargos";
    }
}
