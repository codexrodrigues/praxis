#!/bin/bash
set -e

echo "📦 Instalando dependências do projeto..."
npm install --registry=https://registry.npmjs.org

echo "🛠️ Instalando Angular CLI localmente..."
npm install @angular/cli --registry=https://registry.npmjs.org

echo "🚀 Iniciando ambiente de desenvolvimento Praxis..."
npm run dev
