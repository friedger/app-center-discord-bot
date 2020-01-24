const Discord = require("discord.js");

module.exports = {
  name: "app-info",
  description: "Display info about apps.",
  usage: "[app name]",
  cooldown: 5,
  args: true,
  execute(message, args) {
    const { appsIndex, appsInfo } = message.client;
    const name = args.join("").toLowerCase();
    const appId = appsIndex.get(name);
    const app = appsInfo.get(appId);
    if (app) {
      const appEmbed = new Discord.MessageEmbed()
        .setTitle(`${app.name}`)
        .setURL(`${app.website}`);
      if (app.authors) {
        appEmbed.setAuthor(app.authors);
      }
      appEmbed
        .setDescription(`${app.description}`)
        .setThumbnail(`${app.imgixImageUrl}`)
        .addField("Category", `${app.category}`);
      if (app.blockchain) {
        appEmbed.addField("Blockchain", `${app.blockchain}`);
      }
      if (app.twitterHandle) {
        appEmbed.addField(
          "Twitter",
          `[${app.twitterHandle}](https://twitter.com/${app.twitterHandle})`
        );
      }
      if (app.openSourceUrl && !app.nossReason)
        appEmbed.addField(
          "Source code",
          `[${app.openSourceUrl}](${app.openSourceUrl})`
        );
      appEmbed.setFooter(`App ID: ${app.id}`);
      message.channel.send(appEmbed);
      if (app.discords) {
        message.channel.send(
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
