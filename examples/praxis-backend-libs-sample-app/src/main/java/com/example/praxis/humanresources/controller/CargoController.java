package com.example.praxis.humanresources.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.humanresources.dto.CargoDTO;
import com.example.praxis.humanresources.dto.CargoFilterDTO;
import com.example.praxis.humanresources.entity.Cargo;
import com.example.praxis.humanresources.mapper.CargoMapper;
import com.example.praxis.humanresources.service.CargoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.praxisplatform.uischema.controller.base.AbstractCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRouteDefinitions.HR_CARGOS_PATH)
@Tag(name = ApiRouteDefinitions.HR_CARGOS_TAG, description = "Operations related to HR Cargos")
public class CargoController extends AbstractCrudController<Cargo, com.example.praxis.humanresources.dto.CargoDTO, Long, com.example.praxis.humanresources.dto.CargoFilterDTO> {

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
    protected Long getEntityId(Cargo entity) {
        return entity.getId();
    }

    @Override
    protected Long getDtoId(CargoDTO dto) {
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return ApiRouteDefinitions.HR_CARGOS_PATH;
    }
}
