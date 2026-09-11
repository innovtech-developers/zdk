[ZDK](../README.md) / ApiQuirk

# Interface: ApiQuirk

Registry auditável dos defeitos reais do contrato (§5.3 da spec — Q1 a
Q24). Cada entrada aponta pro ponto exato do swagger e explica o motivo;
`tests/contract/quirks.test.ts` valida os que são estruturalmente
verificáveis contra os dois snapshots reais. Se a Zappy corrigir um
defeito, o teste falha — o registry não apodrece em silêncio.

Q19 (confirmação), Q21 (correção), Q22 e Q23 vieram de chamadas REAIS e autenticadas contra
`api-admin1.zapcontabil.chat` (T24), não de inferência — `GET
/api/connections`, `GET /api/connections/{id}/templates` (leitura, sem
efeito colateral) e um único `POST /api/send/{to}` de teste, autorizado
explicitamente com número e conexão fornecidos para esse fim.

## Table of contents

### Properties

- [at](ApiQuirk.md#at)
- [id](ApiQuirk.md#id)
- [reason](ApiQuirk.md#reason)

## Properties

### at

• `Readonly` **at**: `string`

Caminho no documento OpenAPI onde o defeito vive.

#### Defined in

[src/schema/overrides.ts:18](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/schema/overrides.ts#L18)

___

### id

• `Readonly` **id**: `string`

#### Defined in

[src/schema/overrides.ts:16](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/schema/overrides.ts#L16)

___

### reason

• `Readonly` **reason**: `string`

#### Defined in

[src/schema/overrides.ts:19](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/schema/overrides.ts#L19)
