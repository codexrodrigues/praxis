# pdx-preload-status

## Lista de inputs/outputs atuais

- **Inputs**: nenhum; o componente consome `ComponentPreloaderService` internamente.
- **Outputs**: nenhum evento exposto.

## Propriedades/eventos ausentes

- Não permite customização de textos, cores ou ícones dos elementos `MatCard`, `MatProgressBar` e botões.
- Não expõe eventos para acompanhar início/fim do preload ou ações de recarregar.

## Integridade do Código e Lógica de Negócio

- Componente voltado para debug com forte acoplamento ao serviço de preload.
- Estilização e idioma fixos no template.
- Forte acoplamento ao `ComponentPreloaderService` dificulta testes e manutenção.
- Ausência de tratamento de erro ou timeout pode travar a interface.
- Não diferencia estados de carregamento parcial ou total.

## Cenários Corporativos e UX

- Requer personalização de mensagens, cores e ícones para alinhamento com a identidade visual corporativa.
- Falta mecanismo de retry ou acionamento de suporte.
- Acessibilidade limitada: sem feedback textual para leitores de tela.

## Ações recomendadas

- Permitir configuração via inputs (títulos, labels, ícones).
- Expor eventos de preload (`reload`, `statusChange`) para integração externa.
- Internacionalizar strings e permitir classes/estilos customizados.
