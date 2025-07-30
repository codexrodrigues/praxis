# MaterialSelectComponent

Componente de seleção avançado utilizado pelo sistema de campos dinâmicos. Foi fragmentado em três subcomponentes menores para simplificar a manutenção:

- **SelectSearchInputComponent**: encapsula o campo de busca exibido no painel do select. Emite eventos de `input`, `keydown` e `clear`.
- **SelectOptionsListComponent**: renderiza a lista de opções, com suporte a agrupamento e virtualização através do CDK.
- **SelectChipsComponent**: mostra as opções selecionadas como chips, permitindo remoção individual.

O `MaterialSelectComponent` atua como orquestrador, repassando dados e escutando eventos desses subcomponentes. A API externa permanece a mesma, portanto os formulários dinâmicos continuam funcionando sem alterações.

```html
<pdx-material-select
  [metadata]="countryMetadata"
  [formControl]="countryControl">
</pdx-material-select>
```

Internamente, quando `searchable` estiver habilitado e `multipleDisplay` for `"chips"`, o select exibirá o campo de busca e as chips conforme apropriado.
