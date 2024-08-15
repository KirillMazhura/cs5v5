const { Client, Events, GatewayIntentBits } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
require('dotenv').config()

const sbor = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
})

sbor.login(process.env.botToken)

sbor.once("ready", async() => {
    console.log("Bot has been started")
})
let isTest = false
let botMessages = []
sbor.on("interactionCreate", async (interaction) => {
  if(interaction.isCommand()) {
    if(isTest==true) {
      var neededRoleIdForUse = "1248986722436386827"
      var channelToUseID = "1248986668438917150"
      var channelWithQuestionID = "1272162226190684180"
      var csgo5vs5roleId = '1248887521291669596'
      var dota5vs5roleId = `1256669631981289584`
      var roleIdToEnd = "1272196430982811720"
    } else if (isTest==false) {
      var neededRoleIdForUse = "1271550357775974551"
      var channelToUseID = "1272142586408210444"
      var channelWithQuestionID = "1271555878100930631"
      var roleIdToEnd = "1271550357775974551"
      var csgo5vs5roleId = '1271556032774275186'
      var dota5vs5roleId = `1271556038570545173`
    }
    const channelWithQuestion = sbor.channels.cache.get(channelWithQuestionID)
      if(interaction.commandName === "sbor" && interaction.member.roles.cache.has(neededRoleIdForUse) && interaction.channelId === channelToUseID) {
        let starter = interaction.member
        let listOfPlayers = []
        let interactedPlayersList = []
        let listOfDeclined = []
        let playersCounter = 0
        const timeReceived = interaction.options.getString("time")
        const textReceived = interaction.options.getString(`text`)
        const gameReceived = interaction.options.getString(`game`)
        let role = ""
        let embedDescriptionText = null
        console.log(gameReceived)
        let sborButtonRow = new ActionRowBuilder()
            sborButtonRow.addComponents(
              new ButtonBuilder()
              .setCustomId('agreeButton')
              .setLabel("Да")
              .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
              .setCustomId('declineButton')
              .setLabel("Нет")
              .setStyle(ButtonStyle.Danger)
            )
        let sborEmbed = new EmbedBuilder()
        .setTitle(`Собирает ${starter.displayName}`)

        await interaction.guild.members.fetch();
        async function sendMessage(embed, components) {
          const sentMessage = await channelWithQuestion.send({content: `<@&${role.id}>`,embeds: [embed], components: [components]})
          botMessages.push({channelId: `${sentMessage.channelId}`, messageId: `${sentMessage.id}`});
          return sentMessage;
        }
        if(gameReceived==="dota") {
          role = interaction.guild.roles.cache.get(dota5vs5roleId);
        } else if (gameReceived==="cs") {
          role = interaction.guild.roles.cache.get(csgo5vs5roleId);
        }
        sbor.guilds.cache.get()
        if (timeReceived !=null && textReceived != null) {
          embedDescriptionText = `Пойдёшь ли ты в ${gameReceived} 5 на 5 к ${timeReceived}?\n${textReceived}`
          sborEmbed.setDescription(embedDescriptionText)
        } else if(timeReceived!=null && textReceived == null){
          embedDescriptionText = `Пойдёшь ли ты в ${gameReceived} 5 на 5 к ${timeReceived}?`
          sborEmbed.setDescription(embedDescriptionText)
        }
        console.log(botMessages)
        sendMessage(sborEmbed, sborButtonRow)

        sbor.on("interactionCreate", async interaction => {
          var currentDate = new Date();
          if(interactedPlayersList.includes(interaction.user) && (interaction.customId==="agreeButton" || interaction.customId==="declineButton")) {
            const tempmsg = await interaction.reply({content: "Вы уже нажимали на кнопку", ephemeral: true})
            setTimeout(()=>{
              tempmsg.delete()
            }, 5000)
          }
            else if(interaction.customId==="agreeButton" && !interactedPlayersList.includes(interaction.user)) {
            await interaction.deferUpdate()
            interactedPlayersList.push(interaction.user)
            listOfPlayers.push(`${interaction.user.displayName} в ${currentDate.toLocaleString()}`)
            let players = listOfPlayers.join('\n')
            listOfPlayersEmbed.setDescription(`${players}`)
            playersCounter++
            listOfPlayersEmbed.setTitle(`Собранные людишки (${playersCounter}):`)
            console.log(`${interaction.user.displayName} accepted invite`)
            await serverMessage.edit({embeds: [listOfPlayersEmbed, listOfDeclinedEmbed]})
          } else if(interaction.customId==="declineButton" && !interactedPlayersList.includes(interaction.user)) {
            await interaction.deferUpdate()
            interactedPlayersList.push(interaction.user)
            listOfDeclined.push(`${interaction.user.displayName}`)
            let playersDeclined = listOfDeclined.join('\n')
            listOfDeclinedEmbed.setDescription(`${playersDeclined}`)
            console.log(`${interaction.user.displayName} declined invite`)
            await serverMessage.edit({embeds: [listOfPlayersEmbed, listOfDeclinedEmbed]})
          } else if(interaction.customId===`endButton` && interaction.member.roles.cache.find(r=>r.id===roleIdToEnd)) {
            await interaction.update({embeds: [listOfPlayersEmbed], components:[]})
            await shutdown()
          }
        })
      let listOfPlayersEmbed = new EmbedBuilder()
      .setTitle("Собранные людишки:")
      .setDescription(` `)
      let listOfDeclinedEmbed = new EmbedBuilder()
      .setTitle("Отказавшиеся людишки:")
      .setDescription(" ")
      let endOfSbor = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setCustomId(`endButton`)
        .setStyle(ButtonStyle.Danger)
        .setLabel(`Закончить сбор`)
      )
      const serverMessage = await interaction.reply({ embeds: [listOfPlayersEmbed, listOfDeclinedEmbed], components: [endOfSbor], fetchReply: true })
    } else {
      interaction.reply({content:"Вы не удовлетворяете требованиям использования данной команды", ephemeral: true})
    }
    
  }
})
async function endingSbor() {
  await deletingDirectMessages()
  botMessages = []
}
async function deletingDirectMessages() {
  if (botMessages.length !== 0) {
      for (const obj of botMessages) {
          try {
              const channel = await sbor.channels.fetch(obj.channelId);
              console.log(`deleting message with id=${obj.messageId} channelid=${obj.channelId}`);
              await channel.messages.delete(obj.messageId);
          } catch (error) {
              console.error(`Failed to delete message with ID ${obj.messageId}:`, error);
          }
      }
      console.log(`finishing`);
      botMessages.length = 0;
  }
}
async function execute(interaction) {
 await interaction.deleteReply();
}
async function shutdown() {
  await deletingDirectMessages()
  console.log(`messages deleted`)
  process.exit(0)
  
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)