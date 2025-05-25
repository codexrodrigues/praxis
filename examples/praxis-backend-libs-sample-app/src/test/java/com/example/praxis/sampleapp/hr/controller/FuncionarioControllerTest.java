package com.example.praxis.sampleapp.hr.controller;

import com.example.praxis.sampleapp.hr.dto.FuncionarioDTO;
import com.example.praxis.sampleapp.hr.mapper.FuncionarioMapper;
import com.example.praxis.sampleapp.hr.model.Funcionario;
import com.example.praxis.sampleapp.hr.service.FuncionarioService;
import org.praxisplatform.meta.ui.data.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FuncionarioController.class)
class FuncionarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FuncionarioService funcionarioService;

    @MockBean
    private FuncionarioMapper funcionarioMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getById_whenExists_returnsOkWithDto() throws Exception {
        Funcionario func = new Funcionario();
        func.setId(1L);
        FuncionarioDTO dto = new FuncionarioDTO();
        dto.setId(1L);
        dto.setNomeCompleto("Test Funcionario");

        when(funcionarioService.findById(1L)).thenReturn(func);
        when(funcionarioMapper.toDto(func)).thenReturn(dto);

        mockMvc.perform(get("/api/hr/funcionarios/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.id").value(1L))
               .andExpect(jsonPath("$.data.nomeCompleto").value("Test Funcionario"));
    }

    @Test
    void getById_whenNotExists_returnsNotFound() throws Exception {
        when(funcionarioService.findById(anyLong())).thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/hr/funcionarios/1"))
               .andExpect(status().isNotFound());
    }

    @Test
    void create_returnsCreatedWithDto() throws Exception {
        FuncionarioDTO requestDto = new FuncionarioDTO();
        requestDto.setNomeCompleto("New Funcionario");
        // Populate other necessary fields for requestDto if needed by the controller/mapper

        Funcionario entityToSave = new Funcionario(); // Entity returned by mapper.toEntity
        // Populate entityToSave based on requestDto if specific fields are expected by service.save
        entityToSave.setNomeCompleto("New Funcionario");


        Funcionario savedEntity = new Funcionario(); // Entity returned by service.save
        savedEntity.setId(1L);
        savedEntity.setNomeCompleto("New Funcionario");
        // Populate other fields in savedEntity that would be set by the service/persistence layer

        FuncionarioDTO responseDto = new FuncionarioDTO(); // DTO returned by mapper.toDto(savedEntity)
        responseDto.setId(1L);
        responseDto.setNomeCompleto("New Funcionario");
        // Populate other fields in responseDto based on savedEntity

        when(funcionarioMapper.toEntity(any(FuncionarioDTO.class))).thenReturn(entityToSave);
        when(funcionarioService.save(any(Funcionario.class))).thenReturn(savedEntity);
        when(funcionarioMapper.toDto(any(Funcionario.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/hr/funcionarios")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDto)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.data.id").value(1L))
               .andExpect(jsonPath("$.data.nomeCompleto").value("New Funcionario"));
    }
}
