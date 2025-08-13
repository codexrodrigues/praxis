# Política de LTS — Praxis

## SemVer e versões
- Adoção de **SemVer**: `MAJOR.MINOR.PATCH`.
- O branch `main` acompanha o próximo **MINOR** em desenvolvimento.

## Janela de suporte OSS
- Cada **MINOR** recebe **12 meses** de correções de bugs e **security patches** publicados publicamente.

## LTS Comercial
- **Gold**: até **+18 meses** de **backports de segurança e correções críticas** após o fim do suporte OSS (EOSS) para a mesma **MINOR**.
- **Platinum**: até **+24 meses**.

## Critérios de backport
- Elegíveis: **falhas de segurança**, **corrupção/perda de dados**, **S1/S2** reproduzíveis.
- Não elegíveis: features, refactors amplos, mudanças incompatíveis.

## Processo de EOSS
1. Anúncio de EOSS com 90 dias de antecedência.
2. Último patch público.
3. Transição para **LTS Comercial** (clientes Gold/Platinum).

## Matriz de compatibilidade (exemplo)
- Angular **20.x**: Praxis **>= 1.4**
- Angular **19.x**: Praxis **1.2–1.3**
- Node **>= 20**, NPM **>= 10** (recomendado)
