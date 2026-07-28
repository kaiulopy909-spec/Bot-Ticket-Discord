const config = require("../config.json");


module.exports = {

    customId: "fechar_ticket",


    async execute(interaction) {


        const permitido = interaction.member.roles.cache.some(

            role => config.staffRoles.includes(role.id)

        );


        if (!permitido) {

            return interaction.reply({

                content: "❌ Você não tem permissão para fechar tickets.",

                ephemeral: true

            });

        }


        const canal = interaction.channel;


        await interaction.reply({

            content: "📜 Salvando conversa e enviando para o usuário..."

        });



        // Pega o ID real do dono do ticket

        const userId = canal.name.replace("ticket-", "");



        const usuario = await interaction.client.users.fetch(userId);



        // Busca todas as mensagens

        let mensagens = [];

        let antes;


        while (true) {


            const busca = await canal.messages.fetch({

                limit: 100,

                before: antes

            });


            if (busca.size === 0) break;


            mensagens.push(...busca.values());


            antes = busca.last().id;


        }



        mensagens.reverse();



        let historico = "";


        mensagens.forEach(msg => {


            historico +=

            `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;


        });





        // Envia no PV real

        try {


            await usuario.send({


                content: "📩 Seu ticket foi fechado! Segue o histórico completo:",


                files: [

                    {

                        attachment: Buffer.from(historico, "utf-8"),

                        name: "historico-ticket.txt"

                    }

                ]

            });



            console.log("Histórico enviado para:", usuario.tag);



        } catch(error) {


            console.log("Não consegui enviar PV:", error);


        }





        setTimeout(() => {


            canal.delete("Ticket fechado");


        }, 5000);



    }

};