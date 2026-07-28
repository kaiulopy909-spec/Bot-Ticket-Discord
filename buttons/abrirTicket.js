const {
    EmbedBuilder,
    MessageFlags
} = require("discord.js");

const {
    pegarConfiguracao,
    criarBotoesTipos
} = require("../utils/painelConfig.js");


module.exports = {
    customId: "abrir_ticket",

    async execute(interaction) {
        try {
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
                "❌ Erro ao mostrar opções:",
                error
            );

            if (
                !interaction.replied &&
                !interaction.deferred
            ) {
                await interaction.reply({
                    content:
                        "❌ Não foi possível mostrar as opções.",

                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};