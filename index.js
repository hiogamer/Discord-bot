require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder,
  EmbedBuilder 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Define your custom commands
const commands = [
  new SlashCommandBuilder()
    .setName('build')
    .setDescription('Open the game builder to create a game!'),
  
  new SlashCommandBuilder()
    .setName('troll')
    .setDescription('Sends a fun troll alert into the chat!')
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Refreshing application (/) commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

// Handle Slash Commands and Modals
client.on('interactionCreate', async interaction => {
  
  // 1. Handle Slash Command Triggers
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'build') {
      const modal = new ModalBuilder()
        .setCustomId('gameBuilderModal')
        .setTitle('Game Builder 🎮');

      const gameTitleInput = new TextInputBuilder()
        .setCustomId('gameTitle')
        .setLabel("What is your game's title?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const gameDescInput = new TextInputBuilder()
        .setCustomId('gameDescription')
        .setLabel("Describe your game rules/idea:")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(gameTitleInput),
        new ActionRowBuilder().addComponents(gameDescInput)
      );

      await interaction.showModal(modal);
    } 
    
    else if (interaction.commandName === 'troll') {
      // Sends a playful message directly into the chat channel visible to everyone
      const trollEmbed = new EmbedBuilder()
        .setColor(0xFF4500)
        .setTitle('🤡 CLOWN ALERT! 🤡')
        .setDescription(`**${interaction.user.username}** has triggered a server-wide troll event! HONK HONK! 🚗💨`)
        .setTimestamp();

      await interaction.reply({ 
        content: '@everyone Incoming clown horn!', 
        embeds: [trollEmbed] 
      });
    }
  }

  // 2. Handle when the user submits the /build popup form
  else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'gameBuilderModal') {
      const title = interaction.fields.getTextInputValue('gameTitle');
      const description = interaction.fields.getTextInputValue('gameDescription');

      const gameEmbed = new EmbedBuilder()
        .setColor(0x00FFCC)
        .setTitle(`🎮 New Game: ${title}`)
        .setDescription(description)
        .setFooter({ text: `Created by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.reply({ content: 'Game successfully built! Here it is:', embeds: [gameEmbed] });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);