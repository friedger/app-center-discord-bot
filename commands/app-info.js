const Discord = require("discord.js");

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

module.exports = {
  name: "app-info",
  description: "Display info about apps.",
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
      if (app.openSourceUrl && !app.nossReason) {
        appEmbed.addField(
          "Source code",
          `[${app.openSourceUrl}](${app.openSourceUrl})`
        );
      }

      if (app.manifestUrl) {
        const url = new URL(app.manifestUrl);
        appEmbed.addField(
          "Auth domain",
          `[${url.host}](${app.manifestUrl} '${app.manifestUrl}')`
        );
      }
      appEmbed.addField(
        "More",
        `[Reviews](https://app-center.openintents.org/appco/${
          app.id
        }) | [app.co](https://app.co/app/${slugify(app.name)})`
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
