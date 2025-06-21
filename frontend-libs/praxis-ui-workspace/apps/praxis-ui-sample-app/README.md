# Praxis UI Sample App

Aplicativo Angular de demonstração que utiliza a biblioteca `praxis-ui-core`.

Estrutura:
```
frontend-libs/
└── praxis-ui-workspace/
    └── apps/
        └── praxis-ui-sample-app/
```

## Executando

1. Instale as dependências na raiz do workspace:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
  npm start
  ```

## Configuração com `app.config.ts`

O projeto utiliza o novo padrão do Angular 20, que dispensa o uso de `AppModule`.
As dependências e provedores globais são registrados no arquivo `src/app/app.config.ts`.

Para adicionar novos módulos ou providers, importe-os e inclua em `app.config.ts`.

Exemplo:

```ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(HttpClientModule)
  ]
};
```

Assim, os providers ficam centralizados e o `main.ts` realiza o bootstrap através de `bootstrapApplication`.
