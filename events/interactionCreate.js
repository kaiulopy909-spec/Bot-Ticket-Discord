const abrirTicket = require("../buttons/abrirTicket.js");
const fecharTicket = require("../buttons/fecharTicket.js");
const atendenteTicket = require("../buttons/atendenteTicket.js");


module.exports = {

    name: "interactionCreate",


    async execute(interaction) {


        if (!interaction.isButton()) return;


        console.log("BOTÃO:", interaction.customId);



        switch(interaction.customId) {


            case "abrir_ticket":

                return abrirTicket.execute(interaction);



            case "fechar_ticket":

                return fecharTicket.execute(interaction);



            case "atendente_ticket":

                return atendenteTicket.execute(interaction);


        }


    }

};