package com.example.praxis.sampleapp.hr.mapper;

import com.example.praxis.sampleapp.hr.dto.FuncionarioDTO;
import com.example.praxis.sampleapp.hr.model.Funcionario;
import com.example.praxis.sampleapp.hr.model.Cargo; // Assuming this entity exists
import com.example.praxis.sampleapp.hr.model.Departamento; // Assuming this entity exists
import com.example.praxis.sampleapp.hr.model.Endereco; // Assuming this entity exists
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring", uses = {}) // Add services to 'uses' if they are used for lookups
public interface FuncionarioMapper {

    @Mappings({
        @Mapping(source = "cargo.id", target = "cargoId"),
        @Mapping(source = "cargo.nome", target = "nomeCargo"),
        @Mapping(source = "departamento.id", target = "departamentoId"),
        @Mapping(source = "departamento.nome", target = "nomeDepartamento"),
        @Mapping(source = "endereco.logradouro", target = "logradouro"),
        @Mapping(source = "endereco.numero", target = "numero"),
        @Mapping(source = "endereco.complemento", target = "complemento"),
        @Mapping(source = "endereco.bairro", target = "bairro"),
        @Mapping(source = "endereco.cidade", target = "cidade"),
        @Mapping(source = "endereco.estado", target = "estado"),
        @Mapping(source = "endereco.cep", target = "cep")
    })
    FuncionarioDTO toDto(Funcionario funcionario);

    @Mappings({
        @Mapping(target = "cargo", expression = "java(cargoIdToCargo(dto.getCargoId()))"),
        @Mapping(target = "departamento", expression = "java(departamentoIdToDepartamento(dto.getDepartamentoId()))"),
        // nomeCargo and nomeDepartamento are derived in DTO, no need to map back to entity if not direct fields
        @Mapping(source = "logradouro", target = "endereco.logradouro"),
        @Mapping(source = "numero", target = "endereco.numero"),
        @Mapping(source = "complemento", target = "endereco.complemento"),
        @Mapping(source = "bairro", target = "endereco.bairro"),
        @Mapping(source = "cidade", target = "endereco.cidade"),
        @Mapping(source = "estado", target = "endereco.estado"),
        @Mapping(source = "cep", target = "endereco.cep")
    })
    Funcionario toEntity(FuncionarioDTO dto);

    // Default helper method for cargo lookup.
    // In a real application, this would involve fetching from a CargoRepository/Service.
    default Cargo cargoIdToCargo(Long cargoId) {
        if (cargoId == null) {
            return null;
        }
        Cargo cargo = new Cargo(); // Placeholder
        cargo.setId(cargoId);
        // cargo.setNome("Fetched Cargo Name"); // Example if name needs to be populated
        return cargo;
    }

    // Default helper method for departamento lookup.
    // In a real application, this would involve fetching from a DepartamentoRepository/Service.
    default Departamento departamentoIdToDepartamento(Long departamentoId) {
        if (departamentoId == null) {
            return null;
        }
        Departamento departamento = new Departamento(); // Placeholder
        departamento.setId(departamentoId);
        // departamento.setNome("Fetched Departamento Name"); // Example
        return departamento;
    }

    // MapStruct will generate the implementation for this method.
    // If Endereco is null in DTO, it should result in null in Entity.
    // If Endereco fields are present, it should create a new Endereco object.
    // This is typically handled by MapStruct automatically if target "endereco" is a complex object.
    // No explicit default method is needed for Endereco mapping unless custom logic is required.
}
