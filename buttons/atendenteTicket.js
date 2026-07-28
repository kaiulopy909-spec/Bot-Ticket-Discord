const config = require("../config.json");


module.exports = {

    customId: "atendente_ticket",


    async execute(interaction) {


        const permitido = interaction.member.roles.cache.some(

            role => config.staffRoles.includes(role.id)

        );


        if (!permitido) {

            return interaction.reply({

                content: "❌ Você não tem permissão para atender tickets.",

                ephemeral: true

            });

        }



        await interaction.reply({

            content: `👤 ${interaction.user} assumiu este ticket.`

        });


    }

};