# 🤖 CODEX.md

## 📌 Propósito

Este arquivo fornece as diretrizes para o uso da IA Codex neste repositório. Codex deve atuar como um agente de desenvolvimento assistido, responsável por gerar, refatorar, testar e validar código de acordo com os padrões do projeto **Praxis UI Workspace**.

---

## 🧠 Contexto do Projeto

- Monorepo Angular 20+ com bibliotecas modulares
- Estrutura orientada a metadados e geração dinâmica de UI
- Utiliza `@angular/material` e SCSS
- Padrão de build baseado em `ng-packagr`
- Projeto com foco em escalabilidade, testabilidade e experiência de desenvolvedor

---

## ⚙️ Regras de Atuação do Codex

### ✅ Codex pode:

- Ler e editar arquivos `.ts`, `.html`, `.scss`, `.spec.ts`, `.md` dentro de `projects/`
- Rodar comandos do `package.json` e `setup.sh`
- Executar builds (`npm run build`, `ng build <lib>`)
- Executar testes (`npm run test`, `ng test <lib>`)
- Analisar estrutura do projeto (`angular.json`, `package.json`)
- Atualizar automaticamente os `public-api.ts` ao gerar novos artefatos

### 🚫 Codex **não pode**:

- Editar arquivos fora de `projects/` (exceto `README.md` e arquivos `.md` auxiliares)
- Inserir código sem testes (`.spec.ts`)
- Alterar `node_modules`, `.angular/`, `dist/`, `docs/` diretamente
- Ignorar convenções de commit ou padrão de estilo

---

## 🧾 Convenções e Estilo

- `camelCase` para variáveis
- `PascalCase` para classes, componentes e enums
- Código formatado com Prettier (`prettier --write`)
- Organização de imports: Angular > 3rd Party > Internos
- Componentes `standalone: true`
- Testes devem cobrir casos positivos e negativos
- Usar `TypedFormGroup` e `ReactiveForms`

---

## 🧪 Comandos Permitidos

### Scripts de desenvolvimento:

```bash
npm run dev                  # Servidor + bibliotecas em watch
npm run build                # Build de todas as libs
npm run test                 # Executa todos os testes unitários
ng test <lib>                # Testa uma lib específica
ng build <lib>               # Build de uma lib específica
```

### Exemplos de prompts úteis:

```bash
/generate:component --lib=praxis-core --name=ApiUrlConfig
/create:service --lib=praxis-core --name=FieldNormalizer
/fix:bug --lib=praxis-table --description="erro no filtro de colunas"
/analyze:coverage --lib=praxis-visual-builder
```

---

## 📦 Padrões de Geração de Código

- Toda nova feature deve ser criada dentro da biblioteca correspondente
- Exports devem ser adicionados ao `public-api.ts`
- Testes `.spec.ts` obrigatórios
- Componentes devem implementar `@Input()` e `@Output()` documentados
- Evite lógica duplicada — utilize helpers reutilizáveis de `@praxis/core`
- Metadados devem ser declarativos e compatíveis com serialização JSON

---

## 🧱 Arquitetura e Conexões

- Componentes devem ser auto-configuráveis por metadados
- Conexões entre componentes devem usar `WidgetConnection`, `FieldMapping` e `ConnectionManagerService`
- Dados reativos via RxJS com `takeUntilDestroyed()`

---

## 🧪 Testes Esperados

- `*.spec.ts` para cada componente, serviço ou pipe
- Validação de integração com metadados e ações
- Cobertura mínima recomendada: **80%**
- Comando útil: `ng test <lib> --code-coverage`

---

## 🧰 Diretrizes para Refatoração

Antes de qualquer refatoração, Codex deve:

1. Validar se a arquitetura original está correta
2. Propor melhorias que não quebrem compatibilidade
3. Garantir que testes existentes continuem passando
4. Atualizar `CLAUDE.md` se uma nova diretriz for aplicada
5. Documentar mudanças em changelogs e arquivos README

---

## 📋 Checklist para Codex

| Item | Descrição |
|------|-----------|
| ✅  | Segue convenções de estilo Angular/TypeScript |
| ✅  | Implementação documentada com JSDoc |
| ✅  | Testes cobrindo múltiplos cenários |
| ✅  | Exports atualizados |
| ✅  | Código limpo, modular, performático |
| ✅  | Responsivo e acessível (se aplicável) |
| ❌  | Nada hardcoded fora dos padrões de tema |

---

## 🔍 Integração com Backend

- Frontend consome schemas via `/schemas/filtered` ou `/api/<recurso>/schemas`
- Componentes e formulários usam esses schemas para renderizar dinamicamente

---

## 📚 Referências

- [`CLAUDE.md`](./CLAUDE.md)
- [`README.md`](./README.md)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Material Theming](https://material.angular.io/guide/theming)
- [RxJS Best Practices](https://rxjs.dev/)
