// ========================================
// CONFIGURAÇÕES INICIAIS
// ========================================

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const {
    pegarConfiguracao,
    salvarConfiguracao,
    criarEmbedTicket,
    criarBotaoPrincipal
} = require("./utils/painelConfig.js");


// ========================================
// CANAL DE BANIMENTO AUTOMÁTICO
// ========================================

const CANAL_DE_BANIMENTO =
    "1535058610009145446";


// ========================================
// SERVIDOR HTTP PARA O RENDER
// ========================================

const PORT = process.env.PORT || 3000;

const server = http.createServer(
    (request, response) => {
        response.writeHead(200, {
            "Content-Type": "text/plain"
        });

        response.end("Bot está online!");
    }
);

server.listen(PORT, () => {
    console.log(
        `🌐 Servidor HTTP iniciado na porta ${PORT}`
    );
});


// ========================================
// CRIAR O BOT
// ========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});


// ========================================
// CARREGAR COMANDOS
// ========================================

client.commands = new Collection();

const commandsPath = path.join(
    __dirname,
    "commands"
);

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(
            commandsPath,
            file
        );

        try {
            const command = require(filePath);

            if (
                !command ||
                !command.data ||
                typeof command.execute !== "function"
            ) {
                console.log(
                    `⚠️ Comando ignorado: ${file}`
                );

                continue;
            }

            client.commands.set(
                command.data.name,
                command
            );

            console.log(
                `✅ Comando carregado: ` +
                `${command.data.name}`
            );
        } catch (error) {
            console.error(
                `❌ Erro ao carregar ${file}:`,
                error
            );
        }
    }
}


// ========================================
// CARREGAR BOTÕES DO SISTEMA DE TICKETS
// ========================================

const abrirTicket =
    require("./buttons/abrirTicket.js");

const fecharTicket =
    require("./buttons/fecharTicket.js");

const atendenteTicket =
    require("./buttons/atendenteTicket.js");

const suporte =
    require("./buttons/suporte.js");

const denuncia =
    require("./buttons/denuncia.js");


const botoes = new Map();

botoes.set(
    "abrir_ticket",
    abrirTicket
);

botoes.set(
    "fechar_ticket",
    fecharTicket
);

botoes.set(
    "atendente_ticket",
    atendenteTicket
);

botoes.set(
    "suporte_ticket",
    suporte
);

botoes.set(
    "denuncia_ticket",
    denuncia
);


// ========================================
// FUNÇÃO PARA CRIAR CAMPOS DOS MODAIS
// ========================================

function criarCampo({
    customId,
    label,
    valor,
    estilo = TextInputStyle.Short,
    obrigatorio = true,
    tamanhoMaximo = 100
}) {
    const campo = new TextInputBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(estilo)
        .setRequired(obrigatorio)
        .setMaxLength(tamanhoMaximo);

    if (valor) {
        campo.setValue(
            String(valor).slice(
                0,
                tamanhoMaximo
            )
        );
    }

    return new ActionRowBuilder().addComponents(
        campo
    );
}


// ========================================
// ABRIR MODAL DE CONFIGURAÇÃO
// ========================================

async function abrirModalConfiguracao(
    interaction
) {
    const config = pegarConfiguracao(
        interaction.guild.id
    );

    let modal;

    switch (interaction.customId) {
        case "config_titulo":
            modal = new ModalBuilder()
                .setCustomId("modal_titulo")
                .setTitle("Alterar título")
                .addComponents(
                    criarCampo({
                        customId: "titulo",
                        label: "Título do painel",
                        valor: config.titulo,
                        tamanhoMaximo: 256
                    })
                );
            break;


        case "config_descricao":
            modal = new ModalBuilder()
                .setCustomId("modal_descricao")
                .setTitle("Alterar descrição")
                .addComponents(
                    criarCampo({
                        customId: "descricao",
                        label: "Descrição do painel",
                        valor: config.descricao,
                        estilo:
                            TextInputStyle.Paragraph,
                        tamanhoMaximo: 4000
                    })
                );
            break;


        case "config_imagem":
            modal = new ModalBuilder()
                .setCustomId("modal_imagem")
                .setTitle("Alterar imagem")
                .addComponents(
                    criarCampo({
                        customId: "imagem",
                        label:
                            "Link HTTPS da imagem",
                        valor: config.imagem,
                        obrigatorio: false,
                        tamanhoMaximo: 1000
                    })
                );
            break;


        case "config_cor":
            modal = new ModalBuilder()
                .setCustomId("modal_cor")
                .setTitle("Alterar cor")
                .addComponents(
                    criarCampo({
                        customId: "cor",
                        label:
                            "Cor hexadecimal",
                        valor: config.cor,
                        tamanhoMaximo: 7
                    })
                );
            break;


        case "config_textos_botoes":
            modal = new ModalBuilder()
                .setCustomId(
                    "modal_textos_botoes"
                )
                .setTitle(
                    "Nomes dos botões"
                )
                .addComponents(
                    criarCampo({
                        customId:
                            "texto_principal",

                        label:
                            "Botão principal",

                        valor:
                            config
                                .botaoPrincipalTexto,

                        tamanhoMaximo: 80
                    }),

                    criarCampo({
                        customId:
                            "texto_suporte",

                        label:
                            "Botão de suporte",

                        valor:
                            config
                                .botaoSuporteTexto,

                        tamanhoMaximo: 80
                    }),

                    criarCampo({
                        customId:
                            "texto_denuncia",

                        label:
                            "Botão de denúncia",

                        valor:
                            config
                                .botaoDenunciaTexto,

                        tamanhoMaximo: 80
                    })
                );
            break;


        case "config_emojis_botoes":
            modal = new ModalBuilder()
                .setCustomId(
                    "modal_emojis_botoes"
                )
                .setTitle(
                    "Emojis dos botões"
                )
                .addComponents(
                    criarCampo({
                        customId:
                            "emoji_principal",

                        label:
                            "Emoji principal",

                        valor:
                            config
                                .botaoPrincipalEmoji,

                        tamanhoMaximo: 50
                    }),

                    criarCampo({
                        customId:
                            "emoji_suporte",

                        label:
                            "Emoji de suporte",

                        valor:
                            config
                                .botaoSuporteEmoji,

                        tamanhoMaximo: 50
                    }),

                    criarCampo({
                        customId:
                            "emoji_denuncia",

                        label:
                            "Emoji de denúncia",

                        valor:
                            config
                                .botaoDenunciaEmoji,

                        tamanhoMaximo: 50
                    })
                );
            break;


        default:
            return false;
    }

    await interaction.showModal(modal);

    return true;
}


// ========================================
// SALVAR MODAL
// ========================================

async function salvarModalConfiguracao(
    interaction
) {
    const guildId = interaction.guild.id;

    let alteracoes = {};

    switch (interaction.customId) {
        case "modal_titulo":
            alteracoes = {
                titulo:
                    interaction.fields
                        .getTextInputValue(
                            "titulo"
                        )
                        .trim()
            };
            break;


        case "modal_descricao":
            alteracoes = {
                descricao:
                    interaction.fields
                        .getTextInputValue(
                            "descricao"
                        )
                        .trim()
            };
            break;


        case "modal_imagem": {
            const imagem =
                interaction.fields
                    .getTextInputValue(
                        "imagem"
                    )
                    .trim();

            if (
                imagem &&
                !imagem.startsWith("https://")
            ) {
                await interaction.reply({
                    content:
                        "❌ O link precisa começar com `https://`.",

                    flags:
                        MessageFlags.Ephemeral
                });

                return true;
            }

            alteracoes = {
                imagem
            };

            break;
        }


        case "modal_cor": {
            let cor =
                interaction.fields
                    .getTextInputValue("cor")
                    .trim()
                    .toUpperCase();

            if (!cor.startsWith("#")) {
                cor = `#${cor}`;
            }

            if (
                !/^#[0-9A-F]{6}$/.test(cor)
            ) {
                await interaction.reply({
                    content:
                        "❌ Cor inválida. Use algo como `#5865F2`.",

                    flags:
                        MessageFlags.Ephemeral
                });

                return true;
            }

            alteracoes = {
                cor
            };

            break;
        }


        case "modal_textos_botoes":
            alteracoes = {
                botaoPrincipalTexto:
                    interaction.fields
                        .getTextInputValue(
                            "texto_principal"
                        )
                        .trim(),

                botaoSuporteTexto:
                    interaction.fields
                        .getTextInputValue(
                            "texto_suporte"
                        )
                        .trim(),

                botaoDenunciaTexto:
                    interaction.fields
                        .getTextInputValue(
                            "texto_denuncia"
                        )
                        .trim()
            };
            break;


        case "modal_emojis_botoes":
            alteracoes = {
                botaoPrincipalEmoji:
                    interaction.fields
                        .getTextInputValue(
                            "emoji_principal"
                        )
                        .trim(),

                botaoSuporteEmoji:
                    interaction.fields
                        .getTextInputValue(
                            "emoji_suporte"
                        )
                        .trim(),

                botaoDenunciaEmoji:
                    interaction.fields
                        .getTextInputValue(
                            "emoji_denuncia"
                        )
                        .trim()
            };
            break;


        default:
            return false;
    }

    salvarConfiguracao(
        guildId,
        alteracoes
    );

    await interaction.reply({
        content:
            "✅ Configuração salva com sucesso.\n" +
            "Use `/painel` novamente para ver os valores atualizados.",

        flags: MessageFlags.Ephemeral
    });

    return true;
}


// ========================================
// BOT CONECTADO
// ========================================

client.once(
    Events.ClientReady,
    readyClient => {
        console.log(
            `✅ Bot conectado como ` +
            `${readyClient.user.tag}`
        );

        console.log(
            `✅ Bot está em ` +
            `${readyClient.guilds.cache.size} ` +
            `servidor(es)`
        );

        console.log(
            `🔨 Canal de banimento: ` +
            `${CANAL_DE_BANIMENTO}`
        );
    }
);


// ========================================
// TODAS AS INTERAÇÕES
// ========================================

client.on(
    Events.InteractionCreate,
    async interaction => {
        try {

            // =================================
            // COMANDOS
            // =================================

            if (
                interaction.isChatInputCommand()
            ) {
                const command =
                    client.commands.get(
                        interaction.commandName
                    );

                if (!command) {
                    console.log(
                        `⚠️ Comando não encontrado: ` +
                        interaction.commandName
                    );

                    return;
                }

                await command.execute(
                    interaction
                );

                return;
            }


            // =================================
            // MODAIS
            // =================================

            if (
                interaction.isModalSubmit()
            ) {
                const tratado =
                    await salvarModalConfiguracao(
                        interaction
                    );

                if (tratado) return;
            }


            // =================================
            // BOTÕES
            // =================================

            if (interaction.isButton()) {

                // Botões que abrem modais
                if (
                    interaction.customId
                        .startsWith("config_") &&
                    interaction.customId !==
                        "config_visualizar" &&
                    interaction.customId !==
                        "config_enviar"
                ) {
                    const abriu =
                        await abrirModalConfiguracao(
                            interaction
                        );

                    if (abriu) return;
                }


                // Visualizar o painel
                if (
                    interaction.customId ===
                    "config_visualizar"
                ) {
                    const config =
                        pegarConfiguracao(
                            interaction.guild.id
                        );

                    await interaction.reply({
                        content:
                            "👁️ Esta é a visualização do seu painel:",

                        embeds: [
                            criarEmbedTicket(
                                config
                            )
                        ],

                        components: [
                            criarBotaoPrincipal(
                                config
                            )
                        ],

                        flags:
                            MessageFlags.Ephemeral
                    });

                    return;
                }


                // Publicar o painel
                if (
                    interaction.customId ===
                    "config_enviar"
                ) {
                    const config =
                        pegarConfiguracao(
                            interaction.guild.id
                        );

                    await interaction.channel.send({
                        embeds: [
                            criarEmbedTicket(
                                config
                            )
                        ],

                        components: [
                            criarBotaoPrincipal(
                                config
                            )
                        ]
                    });

                    await interaction.reply({
                        content:
                            "✅ Painel publicado neste canal.",

                        flags:
                            MessageFlags.Ephemeral
                    });

                    return;
                }


                // Botões normais dos tickets
                const botao = botoes.get(
                    interaction.customId
                );

                if (!botao) {
                    console.log(
                        `⚠️ Botão não encontrado: ` +
                        interaction.customId
                    );

                    return;
                }

                await botao.execute(
                    interaction
                );

                return;
            }

        } catch (error) {
            console.error(
                "❌ Erro ao executar interação:",
                error
            );

            try {
                const resposta = {
                    content:
                        "❌ Ocorreu um erro ao executar esta ação.",

                    flags:
                        MessageFlags.Ephemeral
                };

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {
                    await interaction.followUp(
                        resposta
                    );
                } else {
                    await interaction.reply(
                        resposta
                    );
                }
            } catch (responseError) {
                console.error(
                    "❌ Não foi possível responder:",
                    responseError
                );
            }
        }
    }
);


// ========================================
// BAN AUTOMÁTICO
// ========================================

client.on(
    Events.MessageCreate,
    async message => {
        try {
            if (!message.guild) return;
            if (message.author.bot) return;

            if (
                message.channel.id !==
                CANAL_DE_BANIMENTO
            ) {
                return;
            }

            const membro = message.member;

            if (!membro) return;

            if (
                message.guild.ownerId ===
                membro.id
            ) {
                console.log(
                    "⚠️ O dono do servidor " +
                    "não pode ser banido."
                );

                return;
            }

            if (!membro.bannable) {
                console.log(
                    `❌ Não consigo banir ` +
                    `${membro.user.tag}.`
                );

                return;
            }

            const motivo =
                "Enviou uma mensagem no " +
                `canal proibido #${message.channel.name}.`;

            await membro.ban({
                reason: motivo,
                deleteMessageSeconds:
                    60 * 60
            });

            console.log(
                `🔨 Usuário banido: ` +
                `${membro.user.tag}`
            );
        } catch (error) {
            console.error(
                "❌ Erro ao banir usuário:",
                error
            );
        }
    }
);


// ========================================
// ERROS GERAIS
// ========================================

process.on(
    "unhandledRejection",
    error => {
        console.error(
            "❌ Erro não tratado:",
            error
        );
    }
);

process.on(
    "uncaughtException",
    error => {
        console.error(
            "❌ Exceção não tratada:",
            error
        );
    }
);


// ========================================
// CONECTAR AO DISCORD
// ========================================

if (!process.env.TOKEN) {
    console.error(
        "❌ A variável TOKEN não foi configurada."
    );

    process.exit(1);
}

client.login(process.env.TOKEN);