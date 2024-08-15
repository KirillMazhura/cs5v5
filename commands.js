const {REST, Routes, SlashCommandBuilder} = require("discord.js")
require('dotenv').config()
// test server id 1248883322566737940
// main server id 874686998433136690
const botID = "1239332268103831593"
const serverID = "1271550218063843328"
const botToken = process.env.botToken

const rest = new REST().setToken(botToken)
const slashRegister = async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(botID, serverID), {
            body: [
                new SlashCommandBuilder()
                .setName("sbor")
                .setDescription("Отправляет всем пользователям с ролью csgo5vs5 сбор-форму")
                .addStringOption(option=> {
                    return option
                    .setName("time")
                    .setDescription("Уточняет время сбора в игру, указывается в формате 23:59")
                    .setRequired(true)
                })
                .addStringOption(option=> {
                    return option
                    .setName(`game`)
                    .setDescription("Уточняет игру, в которую объявляется сбор")
                    .addChoices(
                        {name: "cs", value: "cs"},
                        {name: "dota", value:"dota"}
                    )
                    .setRequired(true)
                })
                .addStringOption(option => {
                    return option
                    .setName(`text`)
                    .setDescription(`Возможность написать дополнительный текст`)
                })
            ]
        })
    } catch (error) {
        console.log(error)
    }
}
slashRegister()