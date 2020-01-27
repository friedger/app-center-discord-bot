const Discord = require("discord.js");

function appToEmbed(app) {
  const appEmbed = new Discord.MessageEmbed()
    .setTitle(`${app.name}`)
    .setURL(`${app.website}`);

  var description = "";

  if (app.names) {
    description +=
      "Name: " +
      app.names
        .map(u => {
          var name = u.name ? `${u.name} (@${u.discord})` : `@${u.discord}`;
          if (u.telegram) {
            name += ` @${u.telegram} (Telegram)`;
          }
          return name;
        })
        .join(", ");
  }
  if (description.length > 0) {
    description += "\n";
  }
  description += app.description;
  description += `\nWebsite: [${app.website}](${app.website})`;
  if (app.twitterHandle) {
    description += `\nSocial Links: Twitter:[${app.twitterHandle}](https://twitter.com/${app.twitterHandle})`;
  }
  appEmbed.setDescription(description);
  if (app.imgixImageUrl) {
    appEmbed.setThumbnail(`${app.imgixImageUrl}`);
  }

  return appEmbed;
}

module.exports = {
  name: "app",
  description: "Display short info about apps.",
  usage: "[app name]",
  cooldown: 5,
  args: true,
  execute(message, args) {
    const { appsIndex, appsInfo } = message.client;
    const name = args
      .join("")
      .replace(/[^A-Za-z0-9]/g, "")
      .toLowerCase();
    const appId = appsIndex.get(name);
    const app = appsInfo.get(appId);
    if (app) {
      const appEmbed = appToEmbed(app);

      var channel = message.channel;
      const channelId = channel.id;
      if (channel.type !== "dm" && channelId !== "667964235292213257") {
        const appDirectoryChannel = message.client.channels.get(
          "667964235292213257"
        );
        if (appDirectoryChannel) {
          channel = appDirectoryChannel;
          channel.send(
            `<@${message.author.id}> requested info about ${app.name}`
          );
        }
      }

      channel.send(appEmbed);
      if (app.discords) {
        channel.send(
          `For more details you can contact ${app.discords
            .map(user => `@${user}`)
            .join(", ")}`
        );
      }
    } else {
      message.channel.send(`No information found for ${args.join(" ")}`);
    }
  }
};
