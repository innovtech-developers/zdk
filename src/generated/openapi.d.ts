/**
 * GERADO por `npm run sync:api` a partir da união dos swaggers de:
 *   - https://api-zapcontabil.zapcontabil.chat
 *   - https://api-safiracosmeticos.zapplataforma.chat
 * Não editar à mão — a próxima execução sobrescreve (§5.1.2 da spec).
 */

export interface paths {
    "/api/connections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista de Conexões
         * @description Lista todas as conexões.<br> Esse endpoint pode ser utilizado para selecionar conexões para enviar mensagens.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de conexões. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Connection"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/connections/{id}/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista todas as templates de mensagem da API Oficial dessa conexão. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID da conexão. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de templates. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageTemplate"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/contacts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista todas os contatos baseado no critério de pesquisa. Esse endpoint é paginado, ou seja, só pode trazer até no máximo 100 registros por página. */
        get: {
            parameters: {
                query?: {
                    /** @description A página requisitada, o padrão é 1. */
                    page?: number;
                    /** @description O número de registros por página, o padrão é 20. Não há limite para esse valor, por isso pode ser feito uma chamada para trazer todos os contatos com um valor alto para esse campo. No entanto isso pode afetar a performance da aplicação. */
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de contatos. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ContactList"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/contacts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retorna o Contato com o ID informado */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID do contato. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Contato específico. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Contact"];
                    };
                };
                /** @description Contato não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        /** @description Edita um Contato */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Objeto com os dados para editar o Contato. O campo 'name' é obrigatório. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ContactPostData"];
                };
            };
            responses: {
                /** @description Retorna os dados do Contato editado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Contact"];
                    };
                };
                /** @description Erro de validação */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Contato não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/contacts/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Cria um Contato com os dados fornecidos. Esse endpoint não faz uma validação direta do número com ou sem 9, portanto podem acontecer duplicadas em caso de adição ou remoção do 9 no número. <br><br>Antes de verificar se o número existe, o sistema valida se é um número válido e compatível com o Whatsapp. <br>Dessa forma, o número informado pode mudar (sendo adicionado ou removido o 9), pois será pego a identificação desse número pelo próprio WhatsApp. <br><br>Caso deseje que essa validação no Whatsapp seja ignorada, informe o campo 'noCheckNumber' como 'true'. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Objeto com os dados para criar o Contato. <br>Informe o número **sem caracteres especiais** e com **código de país** e **área**. Ex: 5511999999999. <br>Para desabilitar a verificação de número, informe o campo 'noCheckNumber' como 'true'. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ContactPostData"];
                };
            };
            responses: {
                /** @description Retorna os dados do Contato criado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Contact"];
                    };
                };
                /** @description Erro de validação. ERR_NAME_REQUIRED se o campo nome for informado vazio. ERR_NUMBER_REQUIRED se o campo 'number' for informado vazio. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/contacts/{id}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** @description Adiciona ou substitui as tags de um contato específico. O padrão é apenas adicionar as tags informadas, para substituir defina o campo 'replaceTags' como true. Você pode informar IDs de tags ou nomes de tags, se houver o nome informado, a tag apenas será adicionada. Se não houver o nome informado, nova tag será criada com a cor informada. */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Adiciona ou substitui as tags de um contato específico. O padrão é apenas adicionar as tags informadas, para substituir defina o campo 'replaceTags' como true. Você pode informar IDs de tags ou nomes de tags, se houver o nome informado, a tag apenas será adicionada. Se não houver o nome informado, nova tag será criada com a cor informada. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ContactTagsPostData"];
                };
            };
            responses: {
                /** @description Retorna os dados do Contato editado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Contact"];
                    };
                };
                /** @description Erro de validação */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Contato não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/dashboard/tickets-por-atendente": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tickets e TMA por atendente
         * @description Retorna a contagem de tickets e o TMA humano agrupados por atendente no periodo informado.
         *     O TMA e calculado a partir da primeira aceitacao do atendente humano (evento `acceptTicket`)
         *     ate o fechamento, considerando apenas tickets com status `closed`. Retomadas
         *     (`acceptFromPaused`, `acceptFromClosed`) nao redefinem o marco inicial.
         */
        get: {
            parameters: {
                query: {
                    /** @description Data inicial no formato YYYY-MM-DD. */
                    startDate: string;
                    /** @description Data final no formato YYYY-MM-DD. */
                    endDate: string;
                    /** @description IDs dos atendentes para filtro. */
                    "userIds[]"?: number[];
                    /** @description IDs dos setores para filtro. */
                    "queueIds[]"?: number[];
                    /** @description IDs das tags de contato para filtro. */
                    "tagIds[]"?: number[];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de tickets e TMA por atendente. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            userId?: number | null;
                            userName?: string;
                            totalTickets?: number;
                            tmaSegundos?: number;
                            tmaFormatado?: string;
                        }[];
                    };
                };
                /** @description Parametros invalidos. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/dashboard/tickets-por-qualificacao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tickets e TMA por qualificacao
         * @description Retorna a contagem de tickets e o TMA humano agrupados pela qualificacao do atendimento.
         *     O TMA e calculado a partir da primeira aceitacao do atendente humano (evento `acceptTicket`)
         *     ate o fechamento, considerando apenas tickets com status `closed`. Retomadas
         *     (`acceptFromPaused`, `acceptFromClosed`) nao redefinem o marco inicial.
         */
        get: {
            parameters: {
                query: {
                    /** @description Data inicial no formato YYYY-MM-DD. */
                    startDate: string;
                    /** @description Data final no formato YYYY-MM-DD. */
                    endDate: string;
                    /** @description IDs dos atendentes para filtro. */
                    "userIds[]"?: number[];
                    /** @description IDs dos setores para filtro. */
                    "queueIds[]"?: number[];
                    /** @description IDs das tags de contato para filtro. */
                    "tagIds[]"?: number[];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de tickets e TMA por qualificacao. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            qualificacao?: string;
                            totalTickets?: number;
                            tmaSegundos?: number;
                            tmaFormatado?: string;
                        }[];
                    };
                };
                /** @description Parametros invalidos. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/dashboard/tickets-agrupados": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tickets agrupados por dimensao
         * @description Retorna a contagem de tickets agrupada por tag, setor, mes ou dia.
         */
        get: {
            parameters: {
                query: {
                    /** @description Dimensao de agrupamento. */
                    dimensao: "tag" | "setor" | "mes" | "dia";
                    /** @description Data inicial no formato YYYY-MM-DD. */
                    startDate: string;
                    /** @description Data final no formato YYYY-MM-DD. */
                    endDate: string;
                    /** @description IDs dos atendentes para filtro. */
                    "userIds[]"?: number[];
                    /** @description IDs dos setores para filtro. Ignorado quando dimensao=setor. */
                    "queueIds[]"?: number[];
                    /** @description IDs das tags de contato para filtro. Ignorado quando dimensao=tag. */
                    "tagIds[]"?: number[];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de tickets agrupados. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id?: number | null;
                            label?: string;
                            totalTickets?: number;
                        }[];
                    };
                };
                /** @description Parametros invalidos. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista todas as mensagens baseado no critério de pesquisa. Esse endpoint é paginado. */
        get: {
            parameters: {
                query?: {
                    /** @description A página requisitada, o padrão é 1. */
                    page?: number;
                    /** @description O número de registros por página, o padrão é 20. Não há limite para esse valor, por isso pode ser feito uma chamada para trazer todas as mensagens com um valor alto para esse campo. No entanto isso pode afetar a performance da aplicação. */
                    pageSize?: number;
                    /** @description O id do atendimento (opcional) */
                    ticketId?: string;
                    /** @description O id do contato (opcional) */
                    contactId?: string;
                    /** @description Data inicial (incluindo) (opcional). Ex: 2021-01-01 */
                    dateFrom?: string;
                    /** @description Data final (incluindo) (opcional). Ex: 2021-01-31 */
                    dateTo?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de mensagens. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageList"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/messages/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retorna a mensagem com o ID informado */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID da mensagem. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Mensagem específica. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageObject"];
                    };
                };
                /** @description Mensagem não encontrada. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/send/{to}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia uma mensagem para o número informado. Pode ou não receber o ID da conexão para enviar com conexão específica. Caso não seja informado, será usado a conexão padrão ou a primeira da lista. Caso a conexão especificada esteja desconectada, o endpoint trará um erro. Há ainda nesse endpoint a possibilidade de continuar uma conversa com o mesmo número, pela mesma conexão informando no parâmetro connectionFrom o valor 'current' */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Número do Whatsapp para enviar a mensagem. */
                    to: string;
                };
                cookie?: never;
            };
            /** @description Payload */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SendMessage"];
                };
            };
            responses: {
                /** @description Mensagem enviada. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
                /** @description Erro ao enviar a mensagem ou janela de 24 horas da API Oficial fechada. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"] | components["schemas"]["OfficialApiWindowError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/send/{type}/{to}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia um arquivo para o número informado. Pode ou não receber o ID da conexão para enviar com conexão específica. Caso não seja informado, será usado a conexão padrão ou a primeira da lista. Caso a conexão especificada esteja desconectada, o endpoint trará um erro. Você pode enviar o arquivo com multipart/form-data diretamente no corpo da requisição ou enviar uma URL para arquivo externo, e nesse caso utilizar o Content-Type application/json e o campo "url" */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Tipo de arquivo */
                    type: "image" | "video" | "audio" | "voice" | "document";
                    /** @description Número do Whatsapp para enviar a mensagem. */
                    to: string;
                };
                cookie?: never;
            };
            /** @description Payload */
            requestBody?: {
                content: {
                    "multipart/form-data": components["schemas"]["SendMediaMessage"];
                    "application/json": components["schemas"]["SendMediaMessageJson"];
                };
            };
            responses: {
                /** @description Arquivo enviado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
                /** @description Erro ao enviar a mensagem ou janela de 24 horas da API Oficial fechada. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"] | components["schemas"]["OfficialApiWindowError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/messages/multiple/{to}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia múltiplas mensagens para o número informado. Pode anexar arquivos de mídia. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Número do Whatsapp para enviar as mensagens. */
                    to: string;
                };
                cookie?: never;
            };
            /** @description Envie um array de mensagens no campo 'messages'. Cada mensagem deve seguir o schema MessageData. Para anexar arquivos, utilize o campo 'files' (multipart/form-data). */
            requestBody: {
                content: {
                    /**
                     * @example {
                     *       "messages": "[\n  {\n    \"body\": \"Olá, como posso ajudar?\",\n    \"fromMe\": true,\n    \"read\": false\n  },\n  {\n    \"body\": \"Preciso de ajuda com meu pedido\",\n    \"fromMe\": false,\n    \"read\": true,\n    \"quotedMsgId\": \"123456789\"\n  }\n]",
                     *       "files": [
                     *         "arquivo1.png",
                     *         "arquivo2.pdf"
                     *       ]
                     *     }
                     */
                    "multipart/form-data": {
                        /**
                         * @description JSON stringificado de um array de MessageData
                         * @example [
                         *       {
                         *         "body": "Olá, como posso ajudar?",
                         *         "fromMe": true,
                         *         "read": false
                         *       },
                         *       {
                         *         "body": "Preciso de ajuda com meu pedido",
                         *         "fromMe": false,
                         *         "read": true,
                         *         "quotedMsgId": "123456789"
                         *       }
                         *     ]
                         */
                        messages?: string;
                        /**
                         * @description Arquivos de mídia anexados
                         * @example [
                         *       "arquivo1.png",
                         *       "arquivo2.pdf"
                         *     ]
                         */
                        files?: string[];
                    };
                    /**
                     * @example {
                     *       "messages": [
                     *         {
                     *           "body": "Olá, como posso ajudar?",
                     *           "fromMe": true,
                     *           "read": false
                     *         },
                     *         {
                     *           "body": "Preciso de ajuda com meu pedido",
                     *           "fromMe": false,
                     *           "read": true,
                     *           "quotedMsgId": "123456789"
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": {
                        messages?: components["schemas"]["MessageData"][];
                    };
                };
            };
            responses: {
                /** @description Mensagens enviadas com sucesso. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageObject"];
                    };
                };
                /** @description Erro ao enviar as mensagens. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Unauthorized (token inválido ou ausente) */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Erro ao enviar mensagens. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/send-template/{to}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia um template para o contato informado. Devem ser informados o ID do template, os parâmetros de cabeçalho e botões, e os parâmetros do corpo do template, caso existam. **O campo `connectionFrom` é obrigatório** e deve conter o ID de uma conexão do tipo API Oficial (whatsapp-oficial), obtido em /api/connections. Caso a conexão informada não seja do tipo API Oficial, o endpoint retornará erro 400. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O telefone do contato a ser enviado o template. */
                    to: string;
                };
                cookie?: never;
            };
            /** @description Objeto com os dados para enviar o template. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SendTemplate"];
                };
            };
            responses: {
                /** @description Retorna o ID da mensagem enviada. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
                /** @description Erro de validação. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationError"];
                    };
                };
                /** @description Erro interno. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServerError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/send-template-bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia um template para múltiplos contatos informados no campo `to`. O campo `connectionFrom` é obrigatório e deve conter o ID de uma conexão do tipo API Oficial (whatsapp-oficial). Retorna um array de resultados por número, permitindo falhas parciais. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Objeto com os dados para enviar o template para múltiplos números. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SendTemplateBulk"];
                };
            };
            responses: {
                /** @description Resultados do envio por número. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SendTemplateBulkResult"];
                    };
                };
                /** @description Erro de validação. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/metrics/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Traz métricas de atendimento e mensagens como. indicadores de qualidade do atendimento via mensagens ( incluindo rapidez na primeira resposta e agilidade na interação entre agentes e clientes ) e quantidade de mensagens separado por ambiente ( jupiter e outras conexões ) */
        get: {
            parameters: {
                query?: {
                    /** @description Data inicial (incluindo) (opcional). Ex: 2021-01-01 */
                    dateFrom?: string;
                    /** @description Data final (incluindo) (opcional). Ex: 2021-01-31 */
                    dateTo?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Métricas de atendimento e mensagens. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DashboardMetrics"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/queues": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista todos os setores baseado no critério de pesquisa. Esse endpoint é paginado, ou seja, só pode trazer até no máximo 100 registros por página. */
        get: {
            parameters: {
                query?: {
                    /** @description A página requisitada, o padrão é 1. */
                    page?: number;
                    /** @description O número de registros por página, o padrão é 20. Não há limite para esse valor, por isso pode ser feito uma chamada para trazer todos os setores com um valor alto para esse campo. No entanto isso pode afetar a performance da aplicação. */
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de setores. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QueueList"];
                    };
                };
            };
        };
        put?: never;
        /** @description Cria um novo Setor */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Objeto com os dados para criar o Setor. Os campos name e color sao obrigatorios. A cor deve ser hexadecimal no formato #RGB ou #RRGGBB (ex.: #0F0 ou #00FF00). */
            requestBody: {
                content: {
                    /**
                     * @example {
                     *       "name": "setor_1",
                     *       "color": "#00FF00"
                     *     }
                     */
                    "application/json": components["schemas"]["QueuePostData"];
                };
            };
            responses: {
                /** @description Retorna os dados do Setor criado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Queue"];
                    };
                };
                /** @description Erro de validacao. ERR_NAME_REQUIRED se o nome nao for informado, ERR_INVALID_COLOR se a cor nao for hexadecimal valida (#RGB ou #RRGGBB), ERR_QUEUE_NAME_ALREADY_EXISTS ou ERR_QUEUE_COLOR_ALREADY_EXISTS se nome/cor ja existirem. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/queue-users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista setores com os usuarios vinculados. Aceita o parametro opcional search para filtrar pelo nome ou e-mail do usuario. */
        get: {
            parameters: {
                query?: {
                    /** @description Filtra pelo nome ou e-mail do usuario vinculado (busca parcial). */
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de setores com usuarios vinculados. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example [
                         *       {
                         *         "id": 5,
                         *         "name": "setor_3",
                         *         "color": "#FF0000",
                         *         "users": [
                         *           {
                         *             "id": 1,
                         *             "name": "Usuario Exemplo",
                         *             "email": "teste@onecode.com.br"
                         *           }
                         *         ]
                         *       }
                         *     ]
                         */
                        "application/json": components["schemas"]["QueueUsersList"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/queues/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retorna o setor com o ID informado */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID do setor. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Setor específico. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Queue"];
                    };
                };
                /** @description Setor não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        /** @description Atualiza um Setor */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Objeto com os dados para editar o Setor. O campo 'name' é obrigatório. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["QueuePostData"];
                };
            };
            responses: {
                /** @description Retorna os dados do Setor editado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Queue"];
                    };
                };
                /** @description Erro de validação. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Setor não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/many-queues": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Cria multiplos Setores em uma unica requisicao */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Lista de setores a criar. Cada item exige name e color. A cor deve ser hexadecimal no formato #RGB ou #RRGGBB (ex.: #0F0 ou #00FF00). Nome e cor devem ser unicos entre si e em relacao aos setores ja existentes. */
            requestBody: {
                content: {
                    /**
                     * @example [
                     *       {
                     *         "name": "setor_1",
                     *         "color": "#00FF00"
                     *       },
                     *       {
                     *         "name": "setor_2",
                     *         "color": "#0000FF"
                     *       },
                     *       {
                     *         "name": "setor_3",
                     *         "color": "#FF0000"
                     *       }
                     *     ]
                     */
                    "application/json": components["schemas"]["QueuePostData"][];
                };
            };
            responses: {
                /** @description Retorna a lista dos Setores criados. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Queue"][];
                    };
                };
                /** @description Erro de validacao. ERR_INVALID_BODY se o body nao for um array, ERR_NAME_REQUIRED, ERR_INVALID_COLOR, ERR_QUEUE_NAME_ALREADY_EXISTS ou ERR_QUEUE_COLOR_ALREADY_EXISTS. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/storage/signed-url/{filekey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Gera uma URL assinada para acessar um arquivo armazenado de forma segura. */
        get: {
            parameters: {
                query?: {
                    /** @description Tempo em segundos para o qual a URL assinada será válida. O padrão é 300 segundos (5 minutos). O valor máximo permitido é 3600 segundos (1 hora). */
                    expiresInSeconds?: number;
                };
                header?: never;
                path: {
                    /** @description Chave do arquivo para o qual a URL assinada será gerada. */
                    filekey: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description URL assinada gerada com sucesso. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["getSignedUrlResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista todas as tags baseado no critério de pesquisa. Esse endpoint é paginado, ou seja, só pode trazer até no máximo 100 registros por página. */
        get: {
            parameters: {
                query?: {
                    /** @description A página requisitada, o padrão é 1. */
                    page?: number;
                    /** @description O número de registros por página, o padrão é 20. Não há limite para esse valor, por isso pode ser feito uma chamada para trazer todas as tags com um valor alto para esse campo. No entanto isso pode afetar a performance da aplicação. */
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de tags. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["TagList"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tags/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retorna a Tag com o ID informado */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID da tag. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Tag específica. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Tag"];
                    };
                };
                /** @description Tag não encontrada. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        /** @description Edita uma Tag */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Objeto com os dados para editar a Tag. O campo 'name' é obrigatório. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["TagPostData"];
                };
            };
            responses: {
                /** @description Retorna os dados da Tag editada. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Tag"];
                    };
                };
                /** @description Erro de validação. ERR_INVALID_COLOR para cor inválida ou ERR_NAME_REQUIRED se o campo nome for informado vazio. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Tag não encontrada. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tags/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Cria uma Tag */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Objeto com os dados para criar a Tag. O campo 'name' é obrigatório. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["TagPostData"];
                };
            };
            responses: {
                /** @description Retorna os dados da Tag criada. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Tag"];
                    };
                };
                /** @description Erro de validação. ERR_INVALID_COLOR para cor inválida ou ERR_NAME_REQUIRED se o campo nome for informado vazio. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Tag não encontrada. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista todos os atendimentos baseado no critério de pesquisa. Pode ser filtrado por data de abertura (dateFrom/dateTo). Esse endpoint é paginado, ou seja, só pode trazer até no máximo 100 registros por página. */
        get: {
            parameters: {
                query?: {
                    /** @description A página requisitada, o padrão é 1. */
                    page?: number;
                    /** @description O número de registros por página, o padrão é 20. Não há limite para esse valor, por isso pode ser feito uma chamada para trazer todos os atendimentos com um valor alto para esse campo. No entanto isso pode afetar a performance da aplicação. */
                    pageSize?: number;
                    /** @description Filtra os atendimentos abertos a partir desta data (inclusive), pela data de abertura. Formato AAAA-MM-DD. */
                    dateFrom?: string;
                    /** @description Filtra os atendimentos abertos até esta data (inclusive), pela data de abertura. Formato AAAA-MM-DD. */
                    dateTo?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de atendimentos. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["TicketList"];
                    };
                };
                /** @description Data inválida (formato esperado AAAA-MM-DD). */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/search-by-contact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Busca todos os atendimentos de um contato específico pelo número do telefone. Esse endpoint é paginado, ou seja, só pode trazer até no máximo 100 registros por página. */
        get: {
            parameters: {
                query: {
                    /** @description O número do contato para buscar os tickets. */
                    contactNumber: string;
                    /** @description A página requisitada, o padrão é 1. */
                    page?: number;
                    /** @description O número de registros por página, o padrão é 20. Não há limite para esse valor, por isso pode ser feito uma chamada para trazer todos os atendimentos com um valor alto para esse campo. No entanto isso pode afetar a performance da aplicação. */
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de atendimentos do contato. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["TicketList"];
                    };
                };
                /** @description Contato não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retorna o Atendimento com o ID informado */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID do atendimento. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Atendimento específico. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Ticket"];
                    };
                };
                /** @description Atendimento não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        /** @description Atualiza o atendimento. ATENÇÃO! Esse endpoint permite que o atendimento seja atualizado livremente, então as regras de validação não serão contadas para transferência e mudança de status. Para transferências prefira utilizar o endpoint de transferência de atendimento. */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O id do atendimento a ser atualizado. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["TicketUpdateForm"];
                };
            };
            responses: {
                /** @description Retorna o atendimento alterado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Ticket"];
                    };
                };
                /** @description Status, atendente ou setor inválido */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Atendimento não encontrado */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}/transfer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Transfere um atendimento de um usuário, setor, conexão para outro(s). */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O id do atendimento a ser transferido. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["TicketTransferForm"];
                };
            };
            responses: {
                /** @description Retorna o atendimento transferido. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Ticket"];
                    };
                };
                /** @description Usuário, setor ou conexão inválidos */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Atendimento não encontrado */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Finaliza um atendimento com as opções informadas. Em feedbackOption informe "feedback" ou "send-end-message" para ativar a requisição de feedback ao usuário ou apenas enviar mensagem de finalização. O padrão para esse campo é "none", que vai apenas finalizar o atendimento sem enviar nenhuma mensagem */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O id do atendimento a ser finalizado. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["TicketResolveForm"];
                };
            };
            responses: {
                /** @description Retorna o atendimento finalizado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Ticket"];
                    };
                };
                /** @description Opção de feedback inválida */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Atendimento não encontrado */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia uma mensagem para o atendimento especificado. A mensagem será enviada mesmo que o atendimento esteja fechado. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O id do atendimento para o qual a mensagem será enviada. */
                    id: number;
                };
                cookie?: never;
            };
            /** @description Payload */
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SendMessage"];
                };
            };
            responses: {
                /** @description Retorna a mensagem enviada. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Ticket"];
                    };
                };
                /** @description Opção de feedback inválida ou janela de 24 horas da API Oficial fechada. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OfficialApiWindowError"];
                    };
                };
                /** @description Atendimento não encontrado */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}/send/{type}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia um arquivo para o número informado. Pode ou não receber o ID da conexão para enviar com conexão específica. Caso não seja informado, será usado a conexão padrão ou a primeira da lista. Caso a conexão especificada esteja desconectada, o endpoint trará um erro. Você pode enviar o arquivo com multipart/form-data diretamente no corpo da requisição ou enviar uma URL para arquivo externo, e nesse caso utilizar o Content-Type application/json e o campo "url" */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Tipo de arquivo */
                    type: "image" | "video" | "audio" | "voice" | "document";
                    /** @description O id do atendimento para o qual a mensagem será enviada. */
                    id: number;
                };
                cookie?: never;
            };
            /** @description Payload */
            requestBody?: {
                content: {
                    "multipart/form-data": components["schemas"]["SendMediaMessage"];
                    "application/json": components["schemas"]["SendMediaMessageJson"];
                };
            };
            responses: {
                /** @description Arquivo enviado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
                /** @description Erro ao enviar a mensagem ou janela de 24 horas da API Oficial fechada. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"] | components["schemas"]["OfficialApiWindowError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}/send-and-close": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia uma mensagem (com ou sem mídias) e encerra o atendimento em seguida. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O id do atendimento para o qual a mensagem será enviada e encerrada. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "multipart/form-data": {
                        /** @description O conteúdo da mensagem a ser enviada. */
                        body?: string;
                        /** @description Os arquivos de mídia a serem enviados. */
                        files?: string[];
                    };
                };
            };
            responses: {
                /** @description Mensagem enviada e atendimento encerrado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message?: components["schemas"]["Message"];
                            ticket?: components["schemas"]["Ticket"];
                        };
                    };
                };
                /** @description Erro ao enviar a mensagem, encerrar o atendimento ou janela de 24 horas da API Oficial fechada. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OfficialApiWindowError"];
                    };
                };
                /** @description Atendimento não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}/info": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retorna as informações do atendimento com o ID informado. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID do atendimento. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Informações do atendimento. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["TicketInfo"];
                    };
                };
                /** @description Atendimento nao encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}/send-template": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia um template para o contato informado. Devem ser informados o ID do template, os parâmetros de cabeçalho e botões, e os parâmetros do corpo do template, caso existam. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description ID do atendimento em que o template será enviado */
                    id: string;
                };
                cookie?: never;
            };
            /** @description Objeto com os dados para enviar o template. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SendTemplate"];
                };
            };
            responses: {
                /** @description Retorna o ID da mensagem enviada. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"];
                    };
                };
                /** @description Erro de validação. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationError"];
                    };
                };
                /** @description Erro interno. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServerError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista todos os usuários baseado no critério de pesquisa. Esse endpoint é paginado, ou seja, só pode trazer até no máximo 100 registros por página. */
        get: {
            parameters: {
                query?: {
                    /** @description A página requisitada, o padrão é 1. */
                    page?: number;
                    /** @description O número de registros por página, o padrão é 20. Não há limite para esse valor. */
                    pageSize?: number;
                    /** @description Pesquisa por nome ou e-mail */
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de usuários. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserList"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retorna o Usuário com o ID informado */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID do usuário. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Usuário específico. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["User"];
                    };
                };
                /** @description Usuário não encontrada. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/upload-temp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envia um arquivo e retorna uma url pública para ser utilizada com o sendTemplate */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Objeto com os dados para enviar o template. */
            requestBody: {
                content: {
                    "multipart/form-data": components["schemas"]["UploadTemp"];
                };
            };
            responses: {
                /** @description Retorna a URL pública para acesso do arquivo enviado. Essa URL tem validade indeterminada, portanto não deve ser armazenada. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UploadTempResponse"];
                    };
                };
                /** @description Erro de validação. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationError"];
                    };
                };
                /** @description Erro interno. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ServerError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/webhooks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Lista todos os webhooks. Paginado em 20 registros por página. */
        get: {
            parameters: {
                query?: {
                    /** @description A página requisitada, o padrão é 1. Cada página retorna 20 registros. */
                    page?: number;
                    /** @description Pesquisa por nome ou URL do webhook */
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Lista de webhooks. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookList"];
                    };
                };
            };
        };
        put?: never;
        /** @description Cria um novo webhook. O campo `secret` é retornado **somente** nessa resposta — guarde-o para validar as assinaturas HMAC das requisições recebidas. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Dados do webhook a ser criado. Os campos `name`, `url`, `urlType` e `type` são obrigatórios. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["WebhookPostData"];
                };
            };
            responses: {
                /** @description Webhook criado com sucesso. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookWithSecret"];
                    };
                };
                /** @description Dados inválidos (URL bloqueada, JSON de headers inválido, campos obrigatórios ausentes, etc). */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/webhooks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Retorna o webhook com o ID informado. O campo `secret` não é retornado nesse endpoint. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID do webhook. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Webhook encontrado. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Webhook"];
                    };
                };
                /** @description Webhook não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        /** @description Atualiza um webhook existente. O campo `secret` é incluído na resposta. */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID do webhook a ser atualizado. */
                    id: number;
                };
                cookie?: never;
            };
            /** @description Dados para atualização do webhook. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["WebhookPostData"];
                };
            };
            responses: {
                /** @description Webhook atualizado com sucesso. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookWithSecret"];
                    };
                };
                /** @description Dados inválidos. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Webhook não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        /** @description Remove um webhook. Retorna os dados do webhook excluído, incluindo o `secret`. */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description O ID do webhook a ser removido. */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Webhook removido com sucesso. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookWithSecret"];
                    };
                };
                /** @description Webhook não encontrado. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Connection: {
            /** @description Identificador único de cada conexão */
            id?: number;
            /** @enum {string} */
            status?: "CONNECTED" | "DISCONNECTED" | "TIMEOUT";
            /**
             * Format: date-time
             * @description Data de criação da conexão
             */
            createdAt?: string;
            /**
             * Format: date-time
             * @description Data de atualização da conexão
             */
            updatedAt?: string;
            /** @description Indica se a conexão é padrão */
            isDefault?: boolean;
            /** @description Nome da conexão */
            name?: string;
            /** @description Plataforma de onde foi feita a conexão com o Whatsapp. Exemplo: android, ios */
            platform?: string;
            /** @description Número do Whatsapp conectado. Atenção, esse número pode não ser o atual caso a conexão não esteja ativa */
            number?: string;
            /** @description Mensagem de boas-vindas */
            greetingMessage?: string;
            /** @description Mensagem de encerramento */
            endMessage?: string;
            /** @description Mensagem de feedback */
            feedbackMessage?: string;
        };
        MessageTemplate: {
            /** @description Identificador único de cada template no sistema */
            id?: number;
            /** @description Identificador único de cada template na Meta */
            externalId?: string;
            /**
             * @description Tipo de template
             * @enum {string}
             */
            type?: "PHONE" | "URL" | "QUICK_REPLY" | "COPY_CODE";
            /** @description Nome do template */
            name?: string;
            /** @description Idioma do template */
            language?: string;
            /**
             * @description Tipo de variáveis do template
             * @enum {string}
             */
            variableType?: "NAMED" | "POSITIONAL";
            /**
             * @description Formato do cabeçalho
             * @enum {string}
             */
            headType?: "text" | "image" | "video" | "document" | "location";
            header?: {
                /**
                 * @description Formato do cabeçalho
                 * @enum {string}
                 */
                format?: "text" | "image" | "video" | "document" | "location";
                /** @description Texto do cabeçalho */
                text?: string;
                /** @description Exemplos de cabeçalho */
                example?: string[];
            };
            /** @description Variáveis do cabeçalho */
            headerVariables?: string[];
            /** @description Rodapé do template */
            footer?: string;
            buttons?: {
                /**
                 * @description Tipo de botão
                 * @enum {string}
                 */
                type?: "PHONE_NUMBER" | "URL" | "QUICK_REPLY" | "COPY_CODE";
                /** @description Texto do botão */
                text?: string;
                /** @description Código de pais do número de telefone do botão */
                countryCode?: string;
                /** @description Número de telefone do botão */
                phoneNumber?: string;
                /** @description URL do botão */
                url?: string;
                /**
                 * @description Tipo de URL do botão
                 * @enum {string}
                 */
                urlType?: "static" | "dynamic";
            }[];
            /** @description Corpo do template */
            body?: string;
            /**
             * @description Status do template
             * @enum {string}
             */
            status?: "no-sent" | "wait-approval" | "approved" | "rejected" | "blocked";
            stats?: {
                /** @description Quantidade de mensagens enviadas */
                sentMessages?: number;
                /** @description Quantidade de mensagens abertas */
                openedMessages?: number;
                /** @description Motivo do bloqueio */
                blockReason?: string;
            };
            /** @description Variáveis do corpo do template */
            variables?: string[];
        };
        SendMessage: {
            /** @description Mensagem a ser enviada */
            body?: string;
            /** @description Identificador único de cada conexão (obtido em /api/connections). Pode também ser informado a string 'current' que indica que a mensagem será enviada pela mesma conexão que já está em aberto o atendimento */
            connectionFrom?: number;
            /** @description ID opcional do setor. Na criação do atendimento setoriza; se o atendimento já existir, atualiza apenas o setor (mantém responsável e status se não enviar userId). Valores inválidos/inexistentes retornam erro 400. Também se aplica a tickets de grupo existentes. Este roteamento é processado apenas nos endpoints /api/send... */
            queueId?: number;
            /** @description ID opcional do usuário. Na criação direciona e deixa em aberto; se o atendimento já existir, atualiza apenas o responsável e força status em aberto (mantém setor se não enviar queueId). Valores inválidos/inexistentes retornam erro 400. Também se aplica a tickets de grupo existentes. Este roteamento é processado apenas nos endpoints /api/send... */
            userId?: number;
            /**
             * @description Define a estratégia de como será tratado o ticket para essa mensagem. São 3 opções possíveis: 1. Criar atendimento (padrão), 2. Não criar atendimento, 3. Criar a fechar atendimento
             * @enum {string}
             */
            ticketStrategy?: "create" | "nocreate" | "close" | "reuseOrClose";
        };
        SendTemplate: {
            /** @description Identificador único da conexão do tipo API Oficial (obtido em /api/connections). Este campo é obrigatório para que o template seja enviado. A conexão informada deve ser do tipo 'whatsapp-oficial' */
            connectionFrom?: number;
            /** @description ID do template a ser enviado. Obtido em /api/connections/{id}/templates */
            templateId?: string;
            /** @description ID opcional do setor. Na criação do atendimento setoriza; se o atendimento já existir, atualiza apenas o setor (mantém responsável e status se não enviar userId). Valores inválidos/inexistentes retornam erro 400. Também se aplica a tickets de grupo existentes. Este roteamento é processado apenas nos endpoints /api/send... */
            queueId?: number;
            /** @description ID opcional do usuário. Na criação direciona e deixa em aberto; se o atendimento já existir, atualiza apenas o responsável e força status em aberto (mantém setor se não enviar queueId). Valores inválidos/inexistentes retornam erro 400. Também se aplica a tickets de grupo existentes. Este roteamento é processado apenas nos endpoints /api/send... */
            userId?: number;
            /** @description Variáveis do corpo do template. Pode ser no formato NAMED ou POSITIONAL. Em qualquer um dos casos, envie um objeto com as variáveis no formato {variavel: valor}. Ex: {1: 'valor1', 2: 'valor2'} ou {'variavel1': 'valor1', 'variavel2': 'valor2'} */
            bodyParams?: {
                [key: string]: string;
            };
            /** @description URL ou string base64. O tipo vai depender do template escolhido */
            headerParams?: {
                image?: string;
                video?: string;
                document?: string;
                location?: {
                    latitude: number;
                    longitude: number;
                };
            };
            /** @description Variáveis dos botões do template. Aqui o índice inicia em 0, sendo 0 o primeiro botão, 1 o segundo, etc. Enviar como objeto, com os índices como string ao invés de array */
            buttonParams?: {
                [key: string]: string;
            };
            /**
             * @description Define a estratégia de como será tratado o ticket para essa mensagem. São 3 opções possíveis: 1. Criar atendimento (padrão), 2. Não criar atendimento, 3. Criar a fechar atendimento
             * @enum {string}
             */
            ticketStrategy?: "create" | "nocreate" | "close" | "reuseOrClose";
        };
        /**
         * @example {
         *       "to": [
         *         "5511999999999",
         *         "5511888888888"
         *       ],
         *       "connectionFrom": 1,
         *       "templateId": "template_abc123",
         *       "bodyParams": {
         *         "additionalProp1": "valor1",
         *         "additionalProp2": "valor2",
         *         "additionalProp3": "valor3"
         *       },
         *       "headerParams": {
         *         "image": "https://exemplo.com/imagem.jpg",
         *         "video": "https://exemplo.com/video.mp4",
         *         "document": "https://exemplo.com/documento.pdf",
         *         "location": {
         *           "latitude": -23.5505,
         *           "longitude": -46.6333
         *         }
         *       },
         *       "buttonParams": {
         *         "additionalProp1": "https://exemplo.com",
         *         "additionalProp2": "codigo-cupom",
         *         "additionalProp3": "valor-extra"
         *       },
         *       "queueId": 1,
         *       "userId": 1,
         *       "ticketStrategy": "create"
         *     }
         */
        SendTemplateBulk: {
            /** @description Array de números de telefone no formato internacional (ex: 5511999999999) */
            to: string[];
            /** @description ID de uma conexão do tipo API Oficial (whatsapp-oficial), obtido em /api/connections */
            connectionFrom: number;
            /** @description ID do template a ser enviado. Obtido em /api/connections/{id}/templates */
            templateId: string;
            /** @description Variáveis do corpo do template. Formato NAMED ou POSITIONAL. Ex: {"1": "valor1"} ou {"nome": "João"} */
            bodyParams?: {
                [key: string]: string;
            };
            /** @description URL ou string base64 do cabeçalho do template (imagem, vídeo, documento ou localização) */
            headerParams?: {
                image?: string;
                video?: string;
                document?: string;
                location?: {
                    latitude: number;
                    longitude: number;
                };
            };
            /** @description Variáveis dos botões. Índice inicia em 0. Ex: {"0": "https://exemplo.com"} */
            buttonParams?: {
                [key: string]: string;
            };
            /**
             * @description Estratégia de ticket: create (padrão), nocreate, close, reuseOrClose
             * @enum {string}
             */
            ticketStrategy?: "create" | "nocreate" | "close" | "reuseOrClose";
        };
        /**
         * @example {
         *       "results": [
         *         {
         *           "to": "5511999999999",
         *           "status": "success",
         *           "message": {
         *             "id": "msg_abc123",
         *             "body": "Olá João, seu pedido de produto X está confirmado.",
         *             "type": "chat",
         *             "isMedia": false,
         *             "from": "5511900000000",
         *             "contactId": 1,
         *             "ticketId": 42
         *           }
         *         },
         *         {
         *           "to": "5511888888888",
         *           "status": "error",
         *           "error": "ERR_NOT_OFICIAL_CONNECTION"
         *         }
         *       ]
         *     }
         */
        SendTemplateBulkResult: {
            results?: {
                /** @description Número de telefone processado */
                to?: string;
                /** @enum {string} */
                status?: "success" | "error";
                /** @description Dados da mensagem enviada (presente quando status = success) */
                message?: {
                    id?: string;
                    body?: string;
                    type?: string;
                    isMedia?: boolean;
                    from?: string;
                    contactId?: number;
                    ticketId?: number;
                };
                /** @description Código de erro (presente quando status = error) */
                error?: string;
            }[];
        };
        UploadTemp: {
            /** Format: binary */
            media?: string;
        };
        UploadTempResponse: {
            url?: string;
            filename?: string;
            success?: boolean;
        };
        SendMediaMessage: {
            /** Format: binary */
            media?: string;
            /** @description Legenda para imagens, não aplica para outro tipo de arquivo enviado */
            caption?: string;
            /** @description Identificador único de cada conexão (obtido em /api/connections) */
            connectionFrom?: number;
            /** @description ID opcional do setor. Na criação do atendimento setoriza; se o atendimento já existir, atualiza apenas o setor (mantém responsável e status se não enviar userId). Valores inválidos/inexistentes retornam erro 400. Também se aplica a tickets de grupo existentes. Este roteamento é processado apenas nos endpoints /api/send... */
            queueId?: number;
            /** @description ID opcional do usuário. Na criação direciona e deixa em aberto; se o atendimento já existir, atualiza apenas o responsável e força status em aberto (mantém setor se não enviar queueId). Valores inválidos/inexistentes retornam erro 400. Também se aplica a tickets de grupo existentes. Este roteamento é processado apenas nos endpoints /api/send... */
            userId?: number;
            /**
             * @description Define a estratégia de como será tratado o ticket para essa mensagem. São 3 opções possíveis: 1. Criar atendimento (padrão), 2. Não criar atendimento, 3. Criar a fechar atendimento
             * @enum {string}
             */
            ticketStrategy?: "create" | "nocreate" | "close" | "reuseOrClose";
        };
        SendMediaMessageJson: {
            url?: string;
            caption?: string;
            /** @description Identificador único de cada conexão (obtido em /api/connections) */
            connectionFrom?: number;
            /** @description ID opcional do setor. Na criação do atendimento setoriza; se o atendimento já existir, atualiza apenas o setor (mantém responsável e status se não enviar userId). Valores inválidos/inexistentes retornam erro 400. Também se aplica a tickets de grupo existentes. Este roteamento é processado apenas nos endpoints /api/send... */
            queueId?: number;
            /** @description ID opcional do usuário. Na criação direciona e deixa em aberto; se o atendimento já existir, atualiza apenas o responsável e força status em aberto (mantém setor se não enviar queueId). Valores inválidos/inexistentes retornam erro 400. Também se aplica a tickets de grupo existentes. Este roteamento é processado apenas nos endpoints /api/send... */
            userId?: number;
            /**
             * @description Define a estratégia de como será tratado o ticket para essa mensagem. São 3 opções possíveis: 1. Criar atendimento (padrão), 2. Não criar atendimento, 3. Criar a fechar atendimento
             * @enum {string}
             */
            ticketStrategy?: "create" | "nocreate" | "close" | "reuseOrClose";
        };
        Message: {
            /** @description Identificador único de cada mensagem */
            id?: number;
            /** @description Mensagem */
            body?: string;
            /** @description Tipo de mensagem no Whatsapp */
            type?: string;
            /** @description Subtipo da mensagem no Whatsapp */
            subtype?: number;
            /** @description Se a mensagem foi uma mídia, como arquivo, imagem, vídeo, etc */
            isMedia?: string;
            /** @description Se o número para o qual está sendo enviado é contato do número selecionado */
            myContact?: string;
            /** @description O número do qual foi enviado a mensagem. Esse é o número interno usado pelo Whatsapp então ele tem um sufixo no final além do número */
            from?: string;
            /** @description Identificador único do contato para o qual foi enviado a mensagem */
            contactId?: number;
            /** @description Identificador único do ticket para o qual foi enviado a mensagem */
            ticketId?: number;
        };
        Contact: {
            /** @description Identificador único de cada contato */
            id?: number;
            /** @description Nome do contato */
            name?: string;
            /** @description Número do contato incluindo DDI e DDD. Também pode ser o número interno que o Whatsapp utiliza para grupos, caso seja um grupo */
            number?: string;
            /** @description E-mail do contato */
            email?: string;
            /** @description Url da foto do perfil desse contato */
            profilePicUrl?: string;
            /** @description Identifica se o contato é um grupo */
            isGroup?: boolean;
            /**
             * Format: date-time
             * @description Data de criação do contato
             */
            createdAt?: string;
            /**
             * Format: date-time
             * @description Data de atualização do contato
             */
            updatedAt?: string;
            /** @description Identifica se o contato está bloqueado */
            blocked?: boolean;
            /** @description ID do usuário selecionado para carteira de clientes */
            userId?: number;
            /** @description ID do setor selecionado para carteira de clientes */
            queueId?: number;
            /** @description Tags associadas ao contato */
            tags?: components["schemas"]["Tag"][];
        };
        ContactPostData: {
            /** @description Nome do contato */
            name?: string;
            /** @description Número do contato incluindo DDI e DDD. Também pode ser o número interno que o Whatsapp utiliza para grupos, caso seja um grupo */
            number?: string;
            /** @description E-mail do contato */
            email?: string;
            /** @description Url da foto do perfil desse contato */
            profilePicUrl?: string;
            /**
             * @description Identifica se o contato é um grupo
             * @default false
             */
            isGroup: boolean;
            /**
             * @description Identifica se o contato está bloqueado
             * @default false
             */
            blocked: boolean;
            /** @description ID do usuário selecionado para carteira de clientes */
            userId?: number;
            /** @description ID do setor selecionado para carteira de clientes */
            queueId?: number;
            /** @description IDs de tags para adicionar ao contato */
            tagIds?: number[];
            /** @description Informações adicionais do contato */
            extraInfo?: components["schemas"]["ContactExtraInfo"][];
            /**
             * @description Por padrão o sistema verifica se o número é válido para o Whatsapp. Informando essa propriedade, o número não será validado
             * @default false
             */
            noCheckNumber: boolean;
        };
        ContactTagsPostData: {
            /** @description Objetos de tags para serem adicionadas ao contato */
            tags?: Record<string, never>[];
            /** @description IDs de tags para adicionar ao contato */
            tagIds?: number[];
            /**
             * @description Informa se as tags substituirão as existentes, caso seja false, as novas tags serão ADICIONADAS ao contato
             * @default false
             */
            replaceTags: boolean;
            /**
             * @description Informa se a tag deve ser criada caso não exista
             * @default true
             */
            createTagIfNotExists: boolean;
        };
        ContactExtraInfo: {
            /** @description Nome da informação adicional */
            name?: string;
            /** @description Valor da informação adicional */
            value?: string;
        };
        Tag: {
            /** @description Identificador único da Tag */
            id?: string;
            /** @description Nome da Tag */
            name?: string;
            /** @description Cor em código RGB da tag */
            color?: string;
            /**
             * Format: date-time
             * @description Data de criação da tag
             */
            createdAt?: string;
            /**
             * Format: date-time
             * @description Data de atualização da tag
             */
            updatedAt?: string;
        };
        TagPostData: {
            /** @description Nome da Tag */
            name?: string;
            /** @description Cor em código RGB da tag */
            color?: string;
        };
        Ticket: {
            /** @description Identificador do Atendimento */
            id?: string;
            /** @description Status do Atendimento */
            status?: string;
            /** @description ID do usuário (pode ser nulo) */
            userId?: string;
            /** @description ID do contato */
            contactId?: string;
            /** @description ID do Whatsapp associado */
            whatsappId?: string;
            /** @description ID do setor */
            queueId?: string;
            /** @description Número de mensagens não lidas */
            unreadMessages?: number;
            /** @description Última mensagem */
            lastMessage?: string;
            /** @description Se o atendimento é um grupo */
            isGroup?: boolean;
            /** @description Data de criação do atendimento */
            createdAt?: string;
            /** @description Data da última atualização do atendimento (geralmente a última mensagem recebida) */
            updatedAt?: string;
        };
        TicketInfo: {
            /**
             * Format: date-time
             * @description Data da última mensagem recebida
             */
            lastReceivedMessageDate?: string;
            /**
             * Format: date-time
             * @description Data atual
             */
            currentDate?: string;
            /** @description Se pode enviar mensagem com a API oficial. Ou seja, se o cliente enviou mensagem nas últimas 24 horas */
            canSendMessageWithOficialApi?: boolean;
        };
        User: {
            /** @description Identificador único da Tag */
            id?: string;
            /** @description Nome da Tag */
            name?: string;
            email?: string;
            /** @description Data de criação do usuário */
            createdAt?: string;
            /** @description Data da última atualização do usuário */
            updatedAt?: string;
            /** @description Se o usuário está online ou offline */
            status?: string;
            /** @description Perfil do usuário (admin ou usuário comum) */
            profile?: string;
            /** @description Se o usuário está habilitado ou não */
            enabled?: boolean;
        };
        Queue: {
            /** @description Identificador único do setor */
            id?: string;
            /** @description Nome do Setor */
            name?: string;
            /** @description Cor hexadecimal do setor no formato #RGB ou #RRGGBB (ex.: #0F0 ou #00FF00) */
            color?: string;
        };
        /**
         * @example {
         *       "id": "1",
         *       "createdAt": "2024-05-01T12:00:00Z",
         *       "updatedAt": "2024-05-01T12:01:00Z",
         *       "body": "Olá, como posso ajudar?",
         *       "mediaUrl": null,
         *       "mediaType": null,
         *       "fileKey": null,
         *       "isDeleted": false,
         *       "quotedMsgId": null,
         *       "ticketId": "10",
         *       "contactId": "20",
         *       "fromMe": true,
         *       "ack": "1",
         *       "read": false,
         *       "locationLatitude": null,
         *       "locationLongitude": null,
         *       "editedFromId": null,
         *       "editedToId": null,
         *       "error": null
         *     }
         */
        MessageObject: {
            /** @description Identificador da mensagem */
            id?: string;
            /** @description Data de criação da mensagem */
            createdAt?: string;
            /** @description Data de atualizacao da mensagem */
            updatedAt?: string;
            /** @description Conteúdo da mensagem */
            body?: string;
            /** @description URL da imagem */
            mediaUrl?: string;
            /** @description Tipo da imagem */
            mediaType?: string;
            /** @description Chave do arquivo armazenado */
            fileKey?: string;
            /** @description Se a mensagem foi excluída */
            isDeleted?: boolean;
            /** @description ID da mensagem citada */
            quotedMsgId?: string;
            /** @description ID do atendimento */
            ticketId?: string;
            /** @description ID do contato */
            contactId?: string;
            /** @description Se a mensagem foi enviada pelo usuário */
            fromMe?: boolean;
            /** @description Informação do status de entrega da mensagem. Possíveis os seguintes valores: 0 (não entregue), 1 (enviada), 2 (entregue no dispositivo), 3 (lida) */
            ack?: string;
            /** @description Se a mensagem foi lida */
            read?: boolean;
            /** @description Latitude da localização da mensagem */
            locationLatitude?: string;
            /** @description Longitude da localização da mensagem */
            locationLongitude?: string;
            /** @description Caso haja esse ID, ele aponta para a mensagem original que foi editada por essa */
            editedFromId?: string;
            /** @description Em caso de mensagem editada, aponta para a mensagem que foi editada sobre essa. */
            editedToId?: string;
            /** @description Mensagem de erro caso tenha havido ao processar a mensagem */
            error?: string;
        };
        Error: {
            /** @description Mensagem de erro */
            error?: string;
        };
        ValidationError: {
            /** @description Mensagem de erro */
            error?: string;
        };
        ServerError: {
            /** @description Mensagem de erro */
            error?: string;
        };
        OfficialApiWindowError: {
            /**
             * @description Código de erro indicando que a janela de 24 horas da API Oficial está fechada
             * @example ERR_OFFICIAL_API_WINDOW_CLOSED
             */
            error?: string;
            /**
             * @description Mensagem descritiva do erro
             * @example A janela de 24 horas está fechada. O contato não enviou mensagem nas últimas 24 horas. Utilize um template para iniciar uma nova conversa.
             */
            message?: string;
        };
        ContactList: {
            contacts?: components["schemas"]["Contact"][];
            /** @description O total de registros no banco de dados */
            count?: number;
            /** @description A página requisitada */
            page?: number;
            /** @description Número de registros por página */
            pageSize?: number;
            /** @description Quantos registros foram trazidos nessa página */
            pageCount?: number;
        };
        QueueList: {
            queues?: components["schemas"]["Queue"][];
            /** @description O total de registros no banco de dados */
            count?: number;
            /** @description A página requisitada */
            page?: number;
            /** @description Número de registros por página */
            pageSize?: number;
            /** @description Quantos registros foram trazidos nessa página */
            pageCount?: number;
        };
        /**
         * @example {
         *       "name": "setor_1",
         *       "color": "#00FF00"
         *     }
         */
        QueuePostData: {
            /** @description Nome do setor */
            name: string;
            /**
             * @description Cor hexadecimal do setor no formato #RGB ou #RRGGBB (ex.: #0F0 ou #00FF00). Deve ser única.
             * @example #00FF00
             */
            color: string;
        };
        /**
         * @example [
         *       {
         *         "name": "setor_1",
         *         "color": "#00FF00"
         *       },
         *       {
         *         "name": "setor_2",
         *         "color": "#0000FF"
         *       },
         *       {
         *         "name": "setor_3",
         *         "color": "#FF0000"
         *       }
         *     ]
         */
        QueuePostDataList: components["schemas"]["QueuePostData"][];
        /**
         * @example {
         *       "id": 5,
         *       "name": "Vendas",
         *       "color": "#9013fe",
         *       "users": [
         *         {
         *           "id": 1,
         *           "name": "Usuario Exemplo",
         *           "email": "teste@onecode.com.br"
         *         }
         *       ]
         *     }
         */
        QueueWithUsers: {
            /** @description Identificador do setor */
            id?: number;
            /** @description Nome do setor */
            name?: string;
            /** @description Cor hexadecimal do setor no formato #RGB ou #RRGGBB (ex.: #0F0 ou #00FF00) */
            color?: string;
            /** @description Usuarios vinculados ao setor */
            users?: {
                /** @description Identificador do usuario */
                id?: number;
                /** @description Nome do usuario */
                name?: string;
                /** @description E-mail do usuario */
                email?: string;
            }[];
        };
        /**
         * @example [
         *       {
         *         "id": 5,
         *         "name": "Vendas",
         *         "color": "#9013fe",
         *         "users": [
         *           {
         *             "id": 1,
         *             "name": "Usuario Exemplo",
         *             "email": "teste@onecode.com.br"
         *           }
         *         ]
         *       }
         *     ]
         */
        QueueUsersList: components["schemas"]["QueueWithUsers"][];
        TicketList: {
            tickets?: components["schemas"]["Ticket"][];
            /** @description O total de registros no banco de dados */
            count?: number;
            /** @description A página requisitada */
            page?: number;
            /** @description Número de registros por página */
            pageSize?: number;
            /** @description Quantos registros foram trazidos nessa página */
            pageCount?: number;
        };
        TagList: {
            tags?: components["schemas"]["Tag"][];
            /** @description O total de registros no banco de dados */
            count?: number;
            /** @description A página requisitada */
            page?: number;
            /** @description Número de registros por página */
            pageSize?: number;
            /** @description Quantos registros foram trazidos nessa página */
            pageCount?: number;
        };
        MessageList: {
            messages?: components["schemas"]["MessageObject"][];
            /** @description O total de registros no banco de dados */
            count?: number;
            /** @description A página requisitada */
            page?: number;
            /** @description Número de registros por página */
            pageSize?: number;
            /** @description Quantos registros foram trazidos nessa página */
            pageCount?: number;
        };
        UserList: {
            users?: components["schemas"]["User"][];
            /** @description O total de registros no banco de dados */
            count?: number;
            /** @description A página requisitada */
            page?: number;
            /** @description Número de registros por página */
            pageSize?: number;
            /** @description Quantos registros foram trazidos nessa página */
            pageCount?: number;
        };
        TicketUpdateForm: {
            /**
             * @description Novo status do atendimento: 'pending' (Aguardando), 'open' (Em Atendimento) ou 'closed' (Finalizado)
             * @enum {string}
             */
            status?: "pending" | "open" | "closed";
            /** @description ID do novo atendente */
            userId?: number;
            /** @description ID da nova fila */
            queueId?: number;
        };
        TicketTransferForm: {
            /** @description ID da nova fila */
            queueId?: number;
            /** @description ID do novo atendente */
            userId?: number;
            /** @description ID da nova conexão */
            connectionId?: number;
        };
        TicketResolveForm: {
            /**
             * @description Há 3 opções para essa propriedade. Por padrão (none) o sistema fecha esse chamado sem enviar nenhuma mensagem para o usuário. Você pode enviar nesse campo o valor 'feedback' para enviar mensagem de feedback caso esteja configurada, ou enviar 'send-end-message' para apenas enviar a mensagem de finalização do atendimento.
             * @default none
             * @enum {string}
             */
            feedbackOption: "none" | "feedback" | "send-end-message";
        };
        /**
         * @example {
         *       "messages": {
         *         "total": 1184,
         *         "jupyterMessages": {
         *           "sent": 482,
         *           "received": 561,
         *           "total": 1043
         *         },
         *         "otherConnections": {
         *           "omnichatsMessages": {
         *             "sent": 124,
         *             "received": 17,
         *             "total": 141
         *           }
         *         }
         *       },
         *       "avgResponseTime": {
         *         "firstResponseTime": 6855.7468,
         *         "responseTimeToClient": 348885.9572,
         *         "responseTimeToUser": 931051.4884
         *       }
         *     }
         */
        DashboardMetrics: {
            messages?: {
                /** @description Total de mensagens enviadas e recebidas */
                total?: number;
                jupyterMessages?: {
                    /** @description Total de mensagens enviadas e recebidas via jupiter */
                    total?: number;
                    /** @description Total de mensagens enviadas via jupiter */
                    sent?: number;
                    /** @description Total de mensagens recebidas via jupiter */
                    received?: number;
                };
                otherConnections?: {
                    omnichatsMessages?: {
                        /** @description Total de mensagens enviadas e recebidas via omnichats */
                        total?: number;
                        /** @description Total de mensagens enviadas via omnichats */
                        sent?: number;
                        /** @description Total de mensagens recebidas via omnichats */
                        received?: number;
                    };
                };
                avgResponseTime?: {
                    /** @description Tempo médio de espera para o primeiro contato */
                    firstResponseTime?: number;
                    /** @description Tempo médio de resposta do usuário */
                    responseTimeToClient?: number;
                    /** @description Tempo médio de resposta do cliente */
                    responseTimeToUser?: number;
                };
            };
        };
        /**
         * @example {
         *       "body": "Olá, como posso ajudar?",
         *       "fromMe": true,
         *       "read": false,
         *       "quotedMsgId": "123456789"
         *     }
         */
        MessageData: {
            /** @description Conteúdo da mensagem */
            body?: string;
            /** @description Se a mensagem foi enviada pelo usuário */
            fromMe?: boolean;
            /** @description Se a mensagem foi lida */
            read?: boolean;
            /** @description Mensagem citada */
            quotedMsg?: string;
            /** @description Se a mensagem é um áudio */
            isAudio?: boolean;
            /** @description ID da mensagem citada */
            quotedMsgId?: string;
            /** @description Se a mensagem deve ser tratada como áudio */
            asAudio?: boolean;
            /** @description Arquivos anexados à mensagem */
            files?: string[];
        };
        /**
         * @example {
         *       "messages": [
         *         {
         *           "body": "Olá, como posso ajudar?",
         *           "fromMe": true,
         *           "read": false
         *         },
         *         {
         *           "body": "Preciso de ajuda com meu pedido",
         *           "fromMe": false,
         *           "read": true,
         *           "quotedMsgId": "123456789"
         *         }
         *       ]
         *     }
         */
        SendMultipleMessagesRequest: {
            messages?: components["schemas"]["MessageData"][];
        };
        getSignedUrlResponse: {
            /** @description URL assinada para acesso ao arquivo */
            url?: string;
        };
        Webhook: {
            /** @description Identificador único do webhook */
            id?: number;
            /** @description Nome do webhook */
            name?: string;
            /** @description URL de destino do webhook (apenas HTTPS; IPs privados são bloqueados) */
            url?: string;
            /** @description Tipo de URL (ex: static, dynamic) */
            urlType?: string;
            /** @description Tipo de evento que dispara o webhook */
            type?: string;
            /** @description Headers adicionais em formato JSON string */
            headerString?: string;
            /** @description Se o webhook está ativo */
            active?: boolean;
            /** @description Método HTTP utilizado (ex: POST, GET) */
            requestType?: string;
            /** @description Intervalo em minutos para envio periódico (apenas para tipos report_*) */
            sendEveryMinutes?: number;
            /** @description Tipo de intervalo de envio */
            sendIntervalType?: string;
            /**
             * Format: date-time
             * @description Data de criação
             */
            createdAt?: string;
            /**
             * Format: date-time
             * @description Data de atualização
             */
            updatedAt?: string;
        };
        /** @description Webhook com o campo secret incluso. Retornado apenas nas operações de create, update e delete. */
        WebhookWithSecret: components["schemas"]["Webhook"] & {
            /** @description Chave secreta HMAC-SHA256. Enviada no header X-Jupiter-Signature como sha256=<hash>. Guarde-a; não será retornada em GET. */
            secret?: string;
        };
        WebhookPostData: {
            /** @description Nome do webhook */
            name: string;
            /** @description URL de destino do webhook (apenas HTTPS; IPs privados são bloqueados) */
            url: string;
            /** @description Tipo de URL */
            urlType: string;
            /** @description Tipo de evento que dispara o webhook */
            type: string;
            /** @description Método HTTP (ex: POST, GET) */
            requestType?: string;
            /** @description Headers adicionais em formato JSON string */
            headerString?: string;
            /**
             * @description Se o webhook está ativo
             * @default true
             */
            active: boolean;
            /** @description Intervalo em minutos (obrigatório para tipos report_*) */
            sendEveryMinutes?: number;
            /** @description Tipo de intervalo de envio */
            sendIntervalType?: string;
        };
        WebhookList: {
            webhooks?: components["schemas"]["Webhook"][];
            /** @description Total de registros no banco de dados */
            count?: number;
            /** @description Se há mais registros além dos retornados */
            hasMore?: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
