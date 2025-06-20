package com.example.praxis.humanresources.service;

import com.example.praxis.humanresources.dto.FolhaPagamentoFilterDTO;
import com.example.praxis.humanresources.entity.FolhaPagamento;
import com.example.praxis.humanresources.entity.Funcionario;
import com.example.praxis.humanresources.repository.FolhaPagamentoRepository;
import com.example.praxis.humanresources.repository.FuncionarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.praxisplatform.uischema.service.base.AbstractBaseCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FolhaPagamentoService extends AbstractBaseCrudService<FolhaPagamento, Long, FolhaPagamentoFilterDTO> {

    private final FolhaPagamentoRepository folhaPagamentoRepository;
    private final FuncionarioRepository funcionarioRepository;

    @Autowired
    public FolhaPagamentoService(FolhaPagamentoRepository folhaPagamentoRepository,
                                 FuncionarioRepository funcionarioRepository) {
        super(folhaPagamentoRepository, FolhaPagamento.class);
        this.folhaPagamentoRepository = folhaPagamentoRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    private void resolveRelations(FolhaPagamento folha) {
        if (folha.getFuncionario() != null && folha.getFuncionario().getId() != null) {
            Funcionario funcionario = funcionarioRepository.findById(folha.getFuncionario().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Funcionario nao encontrado com ID: " + folha.getFuncionario().getId()));
            folha.setFuncionario(funcionario);
        } else {
            folha.setFuncionario(null);
        }
    }

    @Override
    @Transactional
    public FolhaPagamento save(FolhaPagamento folha) {
        resolveRelations(folha);
        return folhaPagamentoRepository.save(folha);
    }

    @Override
    @Transactional
    public FolhaPagamento mergeUpdate(FolhaPagamento existing, FolhaPagamento payload) {
        existing.setAno(payload.getAno());
        existing.setMes(payload.getMes());
        existing.setSalarioBruto(payload.getSalarioBruto());
        existing.setTotalDescontos(payload.getTotalDescontos());
        existing.setSalarioLiquido(payload.getSalarioLiquido());
        existing.setDataPagamento(payload.getDataPagamento());
        existing.setFuncionario(payload.getFuncionario());
        resolveRelations(existing);
        return existing;
    }
}

