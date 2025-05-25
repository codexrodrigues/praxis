package com.example.praxis.hr.mapper;

import com.example.praxis.hr.dto.FuncionarioDTO;
import com.example.praxis.hr.entity.Funcionario;
import com.example.praxis.hr.entity.Cargo;
import com.example.praxis.hr.entity.Departamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {EnderecoMapper.class})
public interface FuncionarioMapper {

    @Mapping(source = "cargo.id", target = "cargoId")
    @Mapping(source = "departamento.id", target = "departamentoId")
    @Mapping(source = "endereco", target = "endereco") // EnderecoMapper will be used here
    FuncionarioDTO toDto(Funcionario entity);

    @Mapping(source = "cargoId", target = "cargo", qualifiedByName = "cargoFromId")
    @Mapping(source = "departamentoId", target = "departamento", qualifiedByName = "departamentoFromId")
    @Mapping(source = "endereco", target = "endereco") // EnderecoMapper will be used here
    Funcionario toEntity(FuncionarioDTO dto);

    @Named("cargoFromId")
    default Cargo cargoFromId(Long cargoId) {
        if (cargoId == null) {
            return null;
        }
        Cargo cargo = new Cargo();
        cargo.setId(cargoId);
        return cargo;
    }

    @Named("departamentoFromId")
    default Departamento departamentoFromId(Long departamentoId) {
        if (departamentoId == null) {
            return null;
        }
        Departamento departamento = new Departamento();
        departamento.setId(departamentoId);
        return departamento;
    }
}
