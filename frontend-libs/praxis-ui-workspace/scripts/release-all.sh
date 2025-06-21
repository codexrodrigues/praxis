#!/bin/bash

# Caminho absoluto da raiz do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."

if [ -z "$1" ]; then
  echo "Uso: ./release-all.sh [patch|minor|major|<versão exata>]"
  exit 1
fi

VERSION_TYPE=$1
LIBS=("praxis-core" "praxis-table")

for LIB in "${LIBS[@]}"; do
  echo "Atualizando versão da lib: $LIB"
  cd "$PROJECT_ROOT/projects/$LIB"
  npm version $VERSION_TYPE --no-git-tag-version
done

cd "$PROJECT_ROOT"

git add projects/praxis-core/package.json
git add projects/praxis-table/package.json
git commit -m "chore(release): atualiza versão das libs ($VERSION_TYPE)"

# Pega versão da lib principal
TAG_VERSION=$(node -p "require('./projects/praxis-core/package.json').version")

# git tag v$TAG_VERSION
# git push origin main
# git push origin v$TAG_VERSION
