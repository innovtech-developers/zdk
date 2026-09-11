#!/usr/bin/env bash
# Smoke test de empacotamento (T32): npm pack real, instala num diretório
# temporário isolado, e confirma que require("zdk")/import "zdk" funcionam
# com os tipos resolvidos — exatamente o que um consumidor real faria.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "==> build"
(cd "$REPO_ROOT" && npm run build >/dev/null)

echo "==> npm pack"
TARBALL="$(cd "$REPO_ROOT" && npm pack --silent)"
TARBALL_PATH="$REPO_ROOT/$TARBALL"
mv "$TARBALL_PATH" "$WORKDIR/"
TARBALL_PATH="$WORKDIR/$TARBALL"

echo "==> conteúdo do tarball não vaza tests/ nem specs/"
if tar -tzf "$TARBALL_PATH" | grep -Eq '(^|/)(tests|specs)/'; then
  echo "FALHA: tarball contém tests/ ou specs/"
  tar -tzf "$TARBALL_PATH" | grep -E '(^|/)(tests|specs)/'
  exit 1
fi
echo "   ok — nenhum arquivo de tests/specs no pacote"

echo "==> instala o tarball num diretório isolado"
cd "$WORKDIR"
npm init -y >/dev/null 2>&1
npm install "$TARBALL_PATH" --silent >/dev/null 2>&1

echo "==> require(\"zdk\") (CJS)"
cat > check-cjs.cjs <<'EOF'
const { Zdk, ZdkConfigError } = require("zdk");
if (typeof Zdk !== "function") throw new Error("Zdk não é uma classe/função");
if (typeof ZdkConfigError !== "function") throw new Error("ZdkConfigError ausente");
const zdk = new Zdk({ baseUrl: "https://api-x.zapcontabil.chat", token: "a".repeat(250) });
if (!zdk) throw new Error("new Zdk() falhou");
console.log("CJS ok");
EOF
node check-cjs.cjs

echo "==> import \"zdk\" (ESM)"
cat > check-esm.mjs <<'EOF'
import { Zdk, ZdkConfigError } from "zdk";
if (typeof Zdk !== "function") throw new Error("Zdk não é uma classe/função");
if (typeof ZdkConfigError !== "function") throw new Error("ZdkConfigError ausente");
const zdk = new Zdk({ baseUrl: "https://api-x.zapcontabil.chat", token: "a".repeat(250) });
if (!zdk) throw new Error("new Zdk() falhou");
console.log("ESM ok");
EOF
node check-esm.mjs

echo "==> tipos resolvem (tsc --noEmit)"
cat > check-types.ts <<'EOF'
import { Zdk, ZdkConfigError, type ZdkOptions } from "zdk";

const options: ZdkOptions = { baseUrl: "https://api-x.zapcontabil.chat", token: "a".repeat(250) };
const zdk = new Zdk(options);

async function example(): Promise<void> {
  try {
    await zdk.verify();
  } catch (error) {
    if (error instanceof ZdkConfigError) {
      console.error(error.message);
    }
  }
}

void example;
EOF
npm install --no-save typescript@5 @types/node@20 >/dev/null 2>&1
npx tsc --noEmit --strict --target es2022 --module nodenext --moduleResolution nodenext check-types.ts

echo ""
echo "SMOKE TEST OK: CJS, ESM e tipos resolvem a partir do tarball real."
