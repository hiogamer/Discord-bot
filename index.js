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
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Define all custom slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('build')
    .setDescription('Open the game builder to create a game!'),
  
  new SlashCommandBuilder()
    .setName('troll')
    .setDescription('Sends a fun troll alert into the chat!'),

  new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a 6-sided dice (or custom sides)')
    .addIntegerOption(option => 
      option.setName('sides').setDescription('Number of sides (default 6)').required(false)),

  new SlashCommandBuilder()
    .setName('flip')
    .setDescription('Flips a coin (Heads or Tails)'),

  new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the Magic 8-Ball a question')
    .addStringOption(option => 
      option.setName('question').setDescription('Your question').required(true)),

  new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tells a random funny joke!'),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Shows a user profile picture')
    .addUserOption(option => 
      option.setName('user').setDescription('The user to check').required(false)),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Deletes a number of messages from the channel')
    .addIntegerOption(option => 
      option.setName('amount').setDescription('Number of messages to clear (1-99)').required(true)),

  new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock, Paper, Scissors against the bot!'),

  new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Test your knowledge with a trivia question!')
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

// Handle Slash Commands, Modals, and Buttons
client.on('interactionCreate', async interaction => {
  
  // 1. Handle Slash Commands
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'build') {
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
    
    else if (commandName === 'troll') {
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

    else if (commandName === 'roll') {
      const sides = interaction.options.getInteger('sides') || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      await interaction.reply(`🎲 You rolled a **${result}** (out of ${sides})!`);
    }

    else if (commandName === 'flip') {
      const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
      await interaction.reply(`Coin flip result: **${result}**!`);
    }

    else if (commandName === '8ball') {
      const question = interaction.options.getString('question');
      const answers = [
        'It is certain.', 'It is decidedly so.', 'Without a doubt.',
        'Yes definitely.', 'You may rely on it.', 'As I see it, yes.',
        'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.',
        'Cannot predict now.', 'Concentrate and ask again.',
        'Don\'t count on it.', 'My reply is no.', 'My sources say no.',
        'Outlook not so good.', 'Very doubtful.'
      ];
      const answer = answers[Math.floor(Math.random() * answers.length)];
      
      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle('🎱 Magic 8-Ball')
        .addFields(
          { name: 'Question', value: question },
          { name: 'Answer', value: answer }
        );
      await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'joke') {
      const jokes = [
        "Why don't skeletons fight each other? They don't have the guts.",
        "What do you call a fake noodle? An impasta!",
        "Why did the scarecrow win an award? Because he was outstanding in his field.",
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "Why do programmers prefer dark mode? Because light attracts bugs."
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      await interaction.reply(joke);
    }

    else if (commandName === 'avatar') {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle(`${targetUser.username}'s Avatar`)
        .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }));
      await interaction.reply({ embeds: [embed] });
    }

    else if (commandName === 'clear') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
      }
      const amount = interaction.options.getInteger('amount');
      if (amount < 1 || amount > 99) {
        return interaction.reply({ content: 'Please choose a number between 1 and 99.', ephemeral: true });
      }
      await interaction.channel.bulkDelete(amount, true).catch(err => {
        console.error(err);
        return interaction.reply({ content: 'There was an error trying to clear messages in this channel!', ephemeral: true });
      });
      await interaction.reply({ content: `Successfully cleared ${amount} messages!`, ephemeral: true });
    }

    else if (commandName === 'rps') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('rps_rock').setLabel('Rock 🪨').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('rps_paper').setLabel('Paper 📄').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('rps_scissors').setLabel('Scissors ✂️').setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ content: 'Choose your weapon for Rock, Paper, Scissors!', components: [row] });
    }

    else if (commandName === 'trivia') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('trivia_correct').setLabel('JavaScript').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('trivia_wrong1').setLabel('Banana').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('trivia_wrong2').setLabel('Car').setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({ content: '🧠 **Trivia Time!**\nWhat language is this bot programmed in?', components: [row] });
    }
  }

  // 2. Handle Modal Submits (Game Builder)
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

  // 3. Handle Button Interactions (RPS & Trivia)
  else if (interaction.isButton()) {
    if (interaction.customId.startsWith('rps_')) {
      const userChoice = interaction.customId.replace('rps_', '');
      const choices = ['rock', 'paper', 'scissors'];
      const botChoice = choices[Math.floor(Math.random() * choices.length)];

      let outcome = '';
      if (userChoice === botChoice) {
        outcome = "It's a tie! 🤝";
      } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) {
        outcome = "You win! 🎉";
      } else {
        outcome = "I win! 🤖";
      }

      await interaction.update({
        content: `You chose **${userChoice}**. I chose **${botChoice}**.\n**${outcome}**`,
        components: []
      });
    }

    else if (interaction.customId === 'trivia_correct') {
      await interaction.update({
        content: '🧠 **Trivia Time!**\nWhat language is this bot programmed in?\n\n✅ **Correct!** It is JavaScript!',
        components: []
      });
    }

    else if (interaction.customId.startsWith('trivia_wrong')) {
      await interaction.update({
        content: '🧠 **Trivia Time!**\nWhat language is this bot programmed in?\n\n❌ **Wrong!** It was JavaScript!',
        components: []
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
