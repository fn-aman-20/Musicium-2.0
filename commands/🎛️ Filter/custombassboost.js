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
	name: "custombassboost", //the command name for the Slash Command

	category: "🎛️ Filter",
	usage: "custombassboost <gain_value_(0 - 20)>",
	aliases: ["bb", "cbb", "custombb","bassboost"],

	description: "Sets a custom Bassboost with Gain!", //the command description for Slash Command Overview
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
				if (!args[0]) {
					return message.reply({
						embeds: [
							new MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} **Please add a Bassboost Gain between 0 and 20!**`)
						],
					})
				}
				let bass_gain = parseInt(args[0])

				if (bass_gain > 20 || bass_gain < 0) {
					return message.reply({
						embeds: [
							new MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} **The Bassboost Gain must be between 0 and 20!**`)
						],
					})
				}
				FiltersSettings.custombassboost = `bass=g=${bass_gain},dynaudnorm=f=200`;
				client.distube.filters = FiltersSettings;
				//add old filters so that they get removed 	
				//if it was enabled before then add it
				if (newQueue.filters.includes("custombassboost")) {
					await newQueue.setFilter(["custombassboost"]);
				}
				await newQueue.setFilter(["custombassboost"]);
				message.reply({
					embeds: [new MessageEmbed()
					  .setColor(ee.color)
					  .setTimestamp()
					  .setTitle(`♨️ **Set the Bassboost to ${bass_gain}!**`)
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
