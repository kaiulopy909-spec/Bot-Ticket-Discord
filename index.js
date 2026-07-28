require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");

const fs = require("fs");

const path = require("path");



const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent,

        GatewayIntentBits.GuildMembers

    ]

});



client.commands = new Collection();



// Carregar eventos

const eventsPath = path.join(__dirname, "events");

const eventFiles = fs.readdirSync(eventsPath);



for (const file of eventFiles) {

    const event = require(`./events/${file}`);

    
    if (event.once) {

        client.once(event.name, (...args) => event.execute(...args));

    } else {

        client.on(event.name, (...args) => event.execute(...args));

    }

}



// Login do bot

client.login(process.env.TOKEN);