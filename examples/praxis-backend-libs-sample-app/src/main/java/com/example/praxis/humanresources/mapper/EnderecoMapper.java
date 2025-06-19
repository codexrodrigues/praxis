package com.example.praxis.humanresources.mapper;

import com.example.praxis.humanresources.dto.EnderecoDTO;
import com.example.praxis.humanresources.entity.Endereco;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    EnderecoDTO toDto(Endereco entity);

    Endereco toEntity(EnderecoDTO dto);
}
