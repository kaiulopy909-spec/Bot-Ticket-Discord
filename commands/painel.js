const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("painel")
        .setDescription("Envia o painel de tickets")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🎫 Central de Tickets")
            .setDescription(
                "Precisa de ajuda?\n\n" +
                "Clique no botão abaixo para criar um ticket."
            )

            // COLE AQUI O LINK DIRETO DA SUA IMAGEM
            .setImage("https://cdn.discordapp.com/attachments/1481712099599188042/1531075213716885624/Novo_Projeto_1.png?ex=6a69dea8&is=6a688d28&hm=27a5769c0abb3b069a109e923edddaccc4779b80072d5854e0473535124215c8&")

            .setFooter({
                text: "Sistema de Tickets"
            })
            .setTimestamp();

        const botao = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("abrir_ticket")
                    .setLabel("Criar Ticket")
                    .setEmoji("🎫")
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.reply({
            embeds: [embed],
            components: [botao]
        });
    }
};