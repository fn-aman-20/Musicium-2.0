const {
	MessageEmbed,
	Message
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const {
	check_if_dj
} = require("../../handlers/functions")
const FiltersSettings = require("../../botconfig/filters.json");
module.exports = {
	name: "removefilter", //the command name for the Slash Command

	category: "🎛️ Filter",
	usage: "removefilter <filter1> <filter2>..",
	aliases: ["removef", "rfilter", "rfilters", "removefilters"],

	description: "Removes an applied filter", //the command description for Slash Command Overview
	cooldown: 5,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	run: async (client, message, args) => {
		try {
			const {
				member,
				guildId,
				guild
			} = message;
			const {
				channel
			} = member.voice;
			if (!channel) return message.reply({
				embeds: [
					new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **Join ${guild.me.voice.channel ? "my" : "a"} Voice Channel First!**`)
				],

			})
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
				return message.reply({
					embeds: [new MessageEmbed()
						.setColor(ee.wrongcolor)
						.setFooter(ee.footertext, ee.footericon)
						.setTitle(`${client.allEmojis.x} Join my Voice Channel!`)
						.setDescription(`<#${guild.me.voice.channel.id}>`)
					],
				});
			}
			try {
				let newQueue = client.distube.getQueue(guildId);
				if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) return message.reply({
					embeds: [
						new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **There's nothing being played right now!**`)
					],

				})
				if (check_if_dj(client, member, newQueue.songs[0])) {
					return message.reply({
						embeds: [new MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x}**You're not a DJ, nor the Song Requester!**`)
							.setDescription(`**DJ ROLES**\n${check_if_dj(client, member, newQueue.songs[0])}`)
						],
					});
				}
				let filters = args;
				if (filters.some(a => !FiltersSettings[a])) {
					return message.reply({
						embeds: [
            new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setTitle(`${client.allEmojis.x} You added atleast one filter that's invalid!`)
            .setFooter(ee.footertext, ee.footericon)
            .addField("**To Be Noted!**", "All filters, starting with custom are having their own Command, please use them to define what custom amount you want!")
            .addField("**All available Filters**", `\`${Object.keys(FiltersSettings).map(f => `${f}`).join(", ")}\``)
          ],
					})
				}
				let toRemove = [];
				//add new filters    bassboost, clear    --> [clear] -> [bassboost]   
				filters.forEach((f) => {
					if (newQueue.filters.includes(f)) {
						toRemove.push(f)
					}
				})
				if (!toRemove || toRemove.length == 0) {
					return message.reply({
						embeds: [
							new MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} **You didn't mention a Filter that's currently applied.**`)
							.addField("**Current Filters**", newQueue.filters.map(f => `\`${f}\``).join(", "))
						],
					})
				}
				await newQueue.setFilter(toRemove);
				message.reply({
					embeds: [new MessageEmbed()
					  .setColor(ee.color)
					  .setTimestamp()
					  .setTitle(`♨️ **Removed ${toRemove.length} ${toRemove.length == filters.length ? "Filters": `of ${filters.length} Filters! The Rest wasn't a part of the applied Filters!`}**`)
					  .setFooter(`Requested by ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
				})
			} catch (e) {
				console.log(e.stack ? e.stack : e)
			}
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
