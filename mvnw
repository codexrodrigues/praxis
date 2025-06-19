#!/usr/bin/env sh

# Simplified Maven Wrapper
if [ "$(uname)" = "Darwin" ] || [ "$(expr substr $(uname -s) 1 5)" = "Linux" ]; then
  MAVEN_CMD="mvn"
else
  MAVEN_CMD="mvn"
fi

if command -v "$MAVEN_CMD" >/dev/null 2>&1; then
  exec "$MAVEN_CMD" "$@"
fi

echo "Error: Maven is not installed and Maven Wrapper jar is missing." >&2
exit 1
