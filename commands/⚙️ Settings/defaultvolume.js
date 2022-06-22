const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "dvolume", //the command name for execution & for helpcmd [OPTIONAL]
  category: "⚙️ Settings",
  aliases: ["defaultv", "vdefault", "defaultvolume", "volumedefault"],
  usage: "dvolume <value_(1 - 150)>",
  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Sets the default volume for playing any song!", //the command description for helpcmd [OPTIONAL]
  memberpermissions: ["MANAGE_GUILD "], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      //things u can directly access in an interaction!
      const {
        member,
      } = message;
      const {
        guild
      } = member;
      if (!args[0]) {
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${client.allEmojis.x} **Please mention a volume (number)!**`)
            .setDescription(`**Usage**\n> \`${client.settings.get(guild.id, "prefix")}dvolume <value_(1 - 150)>\``)
          ],
        })
      }
      let volume = Number(args[0]);
      client.settings.ensure(guild.id, {
        defaultvolume: 50
      });

      if (!volume || (volume > 150 || volume < 1)) {
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${client.allEmojis.x} **The Volume __must__ be between 1 and 150!**`)
          ],
        })
      }
      client.settings.set(guild.id, volume, "defaultvolume");
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${client.allEmojis.check_mark} **The Default Volume has been set to ${volume}!**`)
        ],
      })
    } catch (e) {
      console.log(String(e.stack).bgRed)
    }
  }
}
/**
 * @INFO
 * Bot Coded by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template
 * @INFO
 * Work for Milrato Development | https://milrato.eu
 * @INFO
 * Please mention Him / Milrato Development, when using this Code!
 * @INFO
 */
