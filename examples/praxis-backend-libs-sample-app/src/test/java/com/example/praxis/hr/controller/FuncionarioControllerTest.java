package com.example.praxis.hr.controller;

import com.example.praxis.hr.dto.FuncionarioDTO;
import com.example.praxis.hr.dto.FuncionarioFilterDTO;
import com.example.praxis.hr.entity.Funcionario;
import com.example.praxis.hr.mapper.FuncionarioMapper;
import com.example.praxis.hr.service.FuncionarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.praxisplatform.uischema.rest.response.RestApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;

@WebMvcTest(FuncionarioController.class)
public class FuncionarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FuncionarioService funcionarioService;

    @MockBean
    private FuncionarioMapper funcionarioMapper;

    @Autowired
    private ObjectMapper objectMapper; // For converting DTO to JSON

    @Test
    public void whenFilterWithFuncionarioFilterDTO_thenReturnsOkAndFilteredResults() throws Exception {
        FuncionarioFilterDTO filterDTO = new FuncionarioFilterDTO();
        filterDTO.setNomeCompleto("Test User");

        Funcionario mockFuncionario = new Funcionario();
        mockFuncionario.setId(1L);
        mockFuncionario.setNomeCompleto("Test User Name");
        // ... other necessary fields for FuncionarioDTO conversion

        List<Funcionario> mockList = Collections.singletonList(mockFuncionario);
        PageImpl<Funcionario> funcionarioPage = new PageImpl<>(mockList, PageRequest.of(0, 10), 1);

        FuncionarioDTO mockFuncionarioDTO = new FuncionarioDTO();
        mockFuncionarioDTO.setId(1L);
        mockFuncionarioDTO.setNomeCompleto("Test User Name");
        // ... other fields if needed for the DTO

        when(funcionarioMapper.toDto(any(Funcionario.class))).thenReturn(mockFuncionarioDTO);

        when(funcionarioService.filter(any(FuncionarioFilterDTO.class), any(Pageable.class)))
                .thenReturn(funcionarioPage);

        // Mocking the DTO conversion that happens in AbstractCrudController
        // This part is tricky as toDto is protected.
        // A more robust test would involve an integration test or ensuring mapper is available.
        // For this unit test, we'll focus on the endpoint and service call.
        // The response assertion will be basic due to this.

        MvcResult result = mockMvc.perform(post("/api/hr/funcionarios/filter")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(filterDTO))
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                // Example of asserting content - assuming FuncionarioDTO has 'nomeCompleto'
                // and that the mapper correctly converts the mockFuncionario
                .andExpect(jsonPath("$.data.content[0].dto.nomeCompleto", is("Test User Name")))
                .andReturn();

        // System.out.println(result.getResponse().getContentAsString());
    }
}
