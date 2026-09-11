[ZDK](../README.md) / ConnectionList

# Interface: ConnectionList

Q18: `GET /api/connections` declara `Connection` (objeto único) na resposta
200, mas o corpo real é uma lista — não existe `ConnectionList` no
contrato, ao contrário de todos os outros recursos.

## Table of contents

### Properties

- [connections](ConnectionList.md#connections)

## Properties

### connections

• `Readonly` **connections**: readonly [`Connection`](../README.md#connection)[]

#### Defined in

[src/schema/types.ts:58](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L58)
