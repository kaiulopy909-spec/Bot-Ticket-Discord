const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    customId: "abrir_ticket",

    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("🎫 Abrir um ticket")
                .setDescription(
                    "Escolha abaixo o tipo de atendimento que você deseja:\n\n" +
                    "🛠️ **Suporte** — dúvidas, problemas e ajuda.\n" +
                    "🚨 **Denúncia** — denunciar usuários ou situações."
                )
                .setFooter({
                    text: "Sistema de Tickets"
                })
                .setTimestamp();

            const botoes = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("suporte_ticket")
                    .setLabel("Suporte")
                    .setEmoji("🛠️")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("denuncia_ticket")
                    .setLabel("Denúncia")
                    .setEmoji("🚨")
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({
                embeds: [embed],
                components: [botoes],
                ephemeral: true
            });
        } catch (error) {
            console.error("Erro ao mostrar opções de ticket:", error);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ Não foi possível mostrar as opções.",
                    ephemeral: true
                });
            }
        }
    }
};