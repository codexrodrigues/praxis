package com.example.praxis.hr.mapper;

import com.example.praxis.hr.dto.EnderecoDTO;
import com.example.praxis.hr.entity.Endereco;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    EnderecoDTO toDto(Endereco entity);

    Endereco toEntity(EnderecoDTO dto);
}
