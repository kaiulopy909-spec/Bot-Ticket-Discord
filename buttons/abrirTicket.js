const {
    EmbedBuilder,
    MessageFlags
} = require("discord.js");

const {
    pegarConfiguracao,
    criarBotoesTipos
} = require("../utils/painelConfig.js");


// ========================================
// CARGO QUE PODE ABRIR TICKET
// ========================================

// Cole entre as aspas o ID do cargo permitido.
// Exemplo:
// const CARGO_PERMITIDO_ID = "123456789012345678";

const CARGO_PERMITIDO_ID = "1531082774411350016";


module.exports = {
    customId: "abrir_ticket",

    async execute(interaction) {
        try {
            // Pega o membro que clicou no botão.
            const membro = interaction.member;

            let possuiCargoPermitido = false;

            // Forma normal quando o Discord retorna
            // o membro completo com cache de cargos.
            if (membro?.roles?.cache) {
                possuiCargoPermitido =
                    membro.roles.cache.has(
                        CARGO_PERMITIDO_ID
                    );
            }

            // Forma alternativa quando o Discord retorna
            // apenas uma lista com IDs de cargos.
            if (
                Array.isArray(membro?.roles) &&
                membro.roles.includes(
                    CARGO_PERMITIDO_ID
                )
            ) {
                possuiCargoPermitido = true;
            }

            // Se não tiver o cargo permitido,
            // o bot bloqueia a abertura do ticket.
            if (!possuiCargoPermitido) {
                await interaction.reply({
                    content:
                        "🚫 Você não possui o cargo necessário para abrir um ticket.",

                    flags: MessageFlags.Ephemeral
                });

                console.log(
                    `🚫 Usuário sem cargo tentou abrir ticket: ` +
                    `${interaction.user.tag}`
                );

                return;
            }

            // Pega as configurações salvas do painel.
            const configuracao =
                pegarConfiguracao(
                    interaction.guild.id
                );

            // Cria a mensagem com as opções de ticket.
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

            // Mostra os botões de suporte e denúncia.
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
        }
    }
};