package com.example.praxis.sampleapp.hr.service.impl;

import com.example.praxis.sampleapp.hr.model.Funcionario;
import com.example.praxis.sampleapp.hr.repository.FuncionarioRepository;
import org.praxisplatform.meta.ui.data.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FuncionarioServiceImplTest {

    @Mock
    private FuncionarioRepository funcionarioRepository;

    @InjectMocks
    private FuncionarioServiceImpl funcionarioService;

    @Test
    void findById_whenExists_returnsFuncionario() {
        Funcionario func = new Funcionario();
        func.setId(1L);
        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(func));
        Funcionario result = funcionarioService.findById(1L);
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(funcionarioRepository, times(1)).findById(1L);
    }

    @Test
    void findById_whenNotExists_throwsResourceNotFoundException() {
        when(funcionarioRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> funcionarioService.findById(1L));
        verify(funcionarioRepository, times(1)).findById(1L);
    }

    @Test
    void save_callsRepositorySave() {
        Funcionario funcToSave = new Funcionario();
        funcToSave.setNomeCompleto("Test Funcionario"); // Add some data to the entity

        // When repository.save is called with any Funcionario instance, return the same instance
        when(funcionarioRepository.save(any(Funcionario.class))).thenReturn(funcToSave);

        Funcionario savedFunc = funcionarioService.save(funcToSave);

        assertNotNull(savedFunc);
        assertEquals("Test Funcionario", savedFunc.getNomeCompleto());
        verify(funcionarioRepository, times(1)).save(funcToSave);
    }
}
