const {
    EmbedBuilder,
    MessageFlags
} = require("discord.js");

const {
    pegarConfiguracao,
    criarBotoesTipos
} = require("../utils/painelConfig.js");


// ========================================
// CARGO BLOQUEADO DE ABRIR TICKETS
// ========================================

// Cole entre as aspas o ID do cargo bloqueado.
// Exemplo:
// const CARGO_BLOQUEADO_ID = "123456789012345678";

const CARGO_BLOQUEADO_ID = "";


module.exports = {
    customId: "abrir_ticket",

    async execute(interaction) {
        try {
            // ========================================
            // PEGAR O MEMBRO QUE CLICOU
            // ========================================

            const membro = interaction.member;

            let possuiCargoBloqueado = false;


            // ========================================
            // VERIFICAR O CARGO
            // ========================================

            // Forma normal:
            // interaction.member é um GuildMember completo.
            if (membro?.roles?.cache) {
                possuiCargoBloqueado =
                    membro.roles.cache.has(
                        CARGO_BLOQUEADO_ID
                    );
            }

            // Forma alternativa:
            // o Discord pode retornar uma lista de IDs.
            if (
                Array.isArray(membro?.roles) &&
                membro.roles.includes(
                    CARGO_BLOQUEADO_ID
                )
            ) {
                possuiCargoBloqueado = true;
            }


            // ========================================
            // BLOQUEAR QUEM POSSUI O CARGO
            // ========================================

            if (possuiCargoBloqueado) {
                await interaction.reply({
                    content:
                        "🚫 Você não possui permissão para abrir tickets.",

                    flags: MessageFlags.Ephemeral
                });

                console.log(
                    `🚫 Usuário bloqueado tentou abrir ticket: ` +
                    `${interaction.user.tag}`
                );

                return;
            }


            // ========================================
            // ABRIR NORMALMENTE PARA OS OUTROS
            // ========================================

            const configuracao =
                pegarConfiguracao(
                    interaction.guild.id
                );

            const embed = new EmbedBuilder()
                .setColor(configuracao.cor)
                .setTitle(
                    "🎫 Escolha o tipo de atendimento"
                )
                .setDescription(
                    `${configuracao.botaoSuporteEmoji} ` +
                    `**${configuracao.botaoSuporteTexto}** — ` +
                    "dúvidas, problemas e ajuda.\n\n" +

                    `${configuracao.botaoDenunciaEmoji} ` +
                    `**${configuracao.botaoDenunciaTexto}** — ` +
                    "denunciar usuários ou situações."
                )
                .setFooter({
                    text: "Sistema de Tickets"
                })
                .setTimestamp();

            await interaction.reply({
                embeds: [embed],

                components: [
                    criarBotoesTipos(configuracao)
                ],

                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error(
                "❌ Erro ao abrir opções de ticket:",
                error
            );

            try {
                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {
                    await interaction.reply({
                        content:
                            "❌ Não foi possível abrir o painel de tickets.",

                        flags: MessageFlags.Ephemeral
                    });
                }
            } catch (responseError) {
                console.error(
                    "❌ Não foi possível responder à interação:",
                    responseError
                );
            }
        }
    }
};