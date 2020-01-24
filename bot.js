require("dotenv").config();

const fs = require("fs");
const Discord = require("discord.js");
const { prefix } = require("./config.json");
const fetch = require("node-fetch");

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.appsIndex = new Discord.Collection();
client.appsInfo = new Discord.Collection();
client.appPublishers = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once("ready", () => {
  fetchData()
    .then(() => {
      console.log("Ready!");
    })
    .catch(e => {
      console.log(e);
    });
});

client.on("message", message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.guildOnly && message.channel.type !== "text") {
    return message.reply("I can't execute that command inside DMs!");
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

const fetchData = async () => {
  var response = await fetch(
    "https://raw.githubusercontent.com/openintents/app-center/master/src/data/app-publishers.json"
  );
  const appPublishers = await response.json();

  response = await fetch(
    "https://raw.githubusercontent.com/openintents/app-center/master/src/data/app-meta-data.json"
  );
  const communityData = await response.json();

  response = await fetch(
    "https://raw.githubusercontent.com/openintents/app-center/master/appco.json"
  );
  const appcoData = await response.json();

  const discordData = require("./app-data.json");

  appcoData.apps.forEach(app => {
    const index = app.name.replace(/\s/g, "").toLowerCase();
    client.appsIndex.set(index, app.id);
    client.appsInfo.set(app.id, app);
    console.log(`adding ${index}`);
  });

  communityData.forEach(app => {
    const appco = client.appsInfo.get(app.id);
    if (appco) {
      client.appsInfo.set(app.id, { ...appco, ...app });
    } else {
      console.log(`missing app co data for ${app.id}`);
      client.appsInfo.set(app.id, app);
    }
  });

  discordData.forEach(app => {
    const appco = client.appsInfo.get(app.id);
    if (appco) {
      client.appsInfo.set(app.id, { ...appco, ...app });
    } else {
      console.log(`missing app co data for ${app.id}`);
      client.appsInfo.set(app.id, app);
    }
  });

  appPublishers.forEach(publisher => {
    client.appPublishers.set(publisher.username, publisher);
  });
};

client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
