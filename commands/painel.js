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

            .setFooter({
                text: "Sistema de Tickets"
            });



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