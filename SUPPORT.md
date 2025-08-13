# Suporte Comercial — Praxis

O Praxis é open source e mantido publicamente. Para empresas que precisam de **SLA, LTS estendido, correções priorizadas e orientação direta**, oferecemos planos comerciais.

## Canais
- **Community (gratuito)**: GitHub Issues/Discussões, sem SLA.
- **Clientes**: e-mail dedicado (<support@praxis.com>) e, a partir do plano **Gold**, canal Slack compartilhado.

## Janela de atendimento (BRT)
- **Silver/Gold**: seg–sex, 9h–18h (fuso: América/São_Paulo).
- **Platinum**: S1 24×7; S2–S4 em horário comercial.

## Severidade e SLA
| Severidade | Definição | 1ª resposta | Próx. atualizações | Meta de mitigação |
|---|---|---:|---:|---:|
| **S1** | indisponibilidade total, perda de dados, bloqueio de produção | Silver: 2h • Gold: 1h • Platinum: 30min | Silver: 4h • Gold: 2h • Platinum: 1h | Workaround ≤ 8h (Silver) • 4h (Gold) • 2h (Platinum) |
| **S2** | degradação severa sem workaround estável | Silver: 8h • Gold: 4h • Platinum: 2h | Silver: 1×/dia • Gold: 2×/dia • Platinum: 2×/dia | Workaround ≤ 2 dias (Silver) • 1 dia (Gold/Platinum) |
| **S3** | bug não crítico, performance, dúvidas técnicas | Silver: 2 dias • Gold: 1 dia • Platinum: 4h | Atualizações semanais | Conforme backlog; priorização para Gold/Platinum |
| **S4** | melhoria, consulta de uso, pedidos de feature | Silver: 3 dias • Gold: 2 dias • Platinum: 1 dia | Quinzenais | Roadmap público; clientes Gold+ podem influenciar |

> *Metas indicativas; contratos podem ajustar prazos conforme escopo/ambiente.*

## Planos

### Community (gratuito)
- GitHub Issues/Discussões • Sem SLA • Documentação • Releases públicos.

### Silver (B.H. Brasil)
- Até **3 incidentes S1/S2** por mês (uso justo) • **SLA** conforme tabela.
- **2h/mês de Office Hours** (arquitetura/dúvidas).
- Acesso a **hotfixes** de gravidade alta.
- Sem LTS estendido.

### Gold (B.H. + LTS)
- Canal **Slack** compartilhado • **SLA** melhorado (tabela).
- **8 incidentes S1/S2** por mês (uso justo).
- **6h/mês de Office Hours** • **2 code reviews/mês** (≤ 500 LOC).
- **LTS estendido:** até **18 meses** após EOSS do OSS para a mesma *minor*.
- **Security advisories** antecipados (embargo).

### Platinum (Enterprise 24×7 para S1)
- **S1 24×7**, resposta 30 minutos • **TAM** (Technical Account Manager).
- **Incidentes S1/S2 ilimitados** (uso justo; até 4 P1/mês).
- **12h/mês de Office Hours** • **4 code reviews/mês** (≤ 800 LOC).
- **LTS estendido:** até **24 meses** após EOSS do OSS para a mesma *minor*.
- **Briefings trimestrais** de roadmap e workshops executivos.

## Como abrir chamado (clientes)
Envie para **support@praxis.com** (ou Slack nos planos Gold+), incluindo:
- Versão do Praxis e módulos afetados
- Passos para reproduzir, logs e impacto no negócio
- Ambiente (prod/homol/dev) e janelas de mudança

## Exclusões gerais
- Suporte a bibliotecas de terceiros fora da matriz de compatibilidade
- Desenvolvimento de features sob medida (ver **Serviços Profissionais**)
- Ambientes sem logs/telemetria mínimos ou sem reproduções plausíveis
