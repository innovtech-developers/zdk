[ZDK](../README.md) / TemplateList

# Interface: TemplateList

Q22 — CONFIRMADO com uma chamada real: `GET /api/connections/{id}/templates`
declara `MessageTemplate` (objeto único) na resposta 200, mas o corpo real
é `{ templates: MessageTemplate[] }` — mesmo padrão de Q18.

## Table of contents

### Properties

- [templates](TemplateList.md#templates)

## Properties

### templates

• `Readonly` **templates**: readonly [`MessageTemplate`](../README.md#messagetemplate)[]

#### Defined in

[src/schema/types.ts:111](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/schema/types.ts#L111)
