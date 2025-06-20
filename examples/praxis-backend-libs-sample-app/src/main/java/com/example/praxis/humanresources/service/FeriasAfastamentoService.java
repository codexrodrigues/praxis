package com.example.praxis.humanresources.service;

import com.example.praxis.humanresources.dto.FeriasAfastamentoFilterDTO;
import com.example.praxis.humanresources.entity.FeriasAfastamento;
import com.example.praxis.humanresources.entity.Funcionario;
import com.example.praxis.humanresources.repository.FeriasAfastamentoRepository;
import com.example.praxis.humanresources.repository.FuncionarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.praxisplatform.uischema.service.base.AbstractBaseCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeriasAfastamentoService extends AbstractBaseCrudService<FeriasAfastamento, Long, FeriasAfastamentoFilterDTO> {

    private final FeriasAfastamentoRepository feriasAfastamentoRepository;
    private final FuncionarioRepository funcionarioRepository;

    @Autowired
    public FeriasAfastamentoService(FeriasAfastamentoRepository feriasAfastamentoRepository,
                                    FuncionarioRepository funcionarioRepository) {
        super(feriasAfastamentoRepository, FeriasAfastamento.class);
        this.feriasAfastamentoRepository = feriasAfastamentoRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    private void resolveRelations(FeriasAfastamento registro) {
        if (registro.getFuncionario() != null && registro.getFuncionario().getId() != null) {
            Funcionario funcionario = funcionarioRepository.findById(registro.getFuncionario().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Funcionario nao encontrado com ID: " + registro.getFuncionario().getId()));
            registro.setFuncionario(funcionario);
        } else {
            registro.setFuncionario(null);
        }
    }

    @Override
    @Transactional
    public FeriasAfastamento save(FeriasAfastamento registro) {
        resolveRelations(registro);
        return feriasAfastamentoRepository.save(registro);
    }

    @Override
    @Transactional
    public FeriasAfastamento mergeUpdate(FeriasAfastamento existing, FeriasAfastamento payload) {
        existing.setTipo(payload.getTipo());
        existing.setDataInicio(payload.getDataInicio());
        existing.setDataFim(payload.getDataFim());
        existing.setObservacoes(payload.getObservacoes());
        existing.setFuncionario(payload.getFuncionario());
        resolveRelations(existing);
        return existing;
    }
}

