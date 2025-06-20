package com.example.praxis.humanresources.service;

import com.example.praxis.humanresources.dto.EventoFolhaFilterDTO;
import com.example.praxis.humanresources.entity.EventoFolha;
import com.example.praxis.humanresources.entity.FolhaPagamento;
import com.example.praxis.humanresources.repository.EventoFolhaRepository;
import com.example.praxis.humanresources.repository.FolhaPagamentoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.praxisplatform.uischema.service.base.AbstractBaseCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventoFolhaService extends AbstractBaseCrudService<EventoFolha, Long, EventoFolhaFilterDTO> {

    private final EventoFolhaRepository eventoFolhaRepository;
    private final FolhaPagamentoRepository folhaPagamentoRepository;

    @Autowired
    public EventoFolhaService(EventoFolhaRepository eventoFolhaRepository,
                              FolhaPagamentoRepository folhaPagamentoRepository) {
        super(eventoFolhaRepository, EventoFolha.class);
        this.eventoFolhaRepository = eventoFolhaRepository;
        this.folhaPagamentoRepository = folhaPagamentoRepository;
    }

    private void resolveRelations(EventoFolha evento) {
        if (evento.getFolhaPagamento() != null && evento.getFolhaPagamento().getId() != null) {
            FolhaPagamento folha = folhaPagamentoRepository.findById(evento.getFolhaPagamento().getId())
                    .orElseThrow(() -> new EntityNotFoundException("FolhaPagamento nao encontrada com ID: " + evento.getFolhaPagamento().getId()));
            evento.setFolhaPagamento(folha);
        } else {
            evento.setFolhaPagamento(null);
        }
    }

    @Override
    @Transactional
    public EventoFolha save(EventoFolha evento) {
        resolveRelations(evento);
        return eventoFolhaRepository.save(evento);
    }

    @Override
    @Transactional
    public EventoFolha mergeUpdate(EventoFolha existing, EventoFolha payload) {
        existing.setDescricao(payload.getDescricao());
        existing.setTipo(payload.getTipo());
        existing.setValor(payload.getValor());
        existing.setFolhaPagamento(payload.getFolhaPagamento());
        resolveRelations(existing);
        return existing;
    }
}

