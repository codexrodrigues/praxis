#!/bin/bash
set -e

echo "📦 Instalando dependências do projeto..."
npm install

echo "🛠️ Instalando Angular CLI localmente..."
npm install @angular/cli

echo "🚀 Iniciando ambiente de desenvolvimento Praxis..."
npm run dev
