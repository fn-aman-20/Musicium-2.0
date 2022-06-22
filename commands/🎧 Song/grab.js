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
module.exports = {
	name: "grab", //the command name for the Slash Command
	category: "🎧 Song",
	usage: "grab",
	aliases: ["get", "take", "hold", "download"],
	description: "Gives you the song in DM!", //the command description for Slash Command Overview
	cooldown: 10,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	run: async (client, message, args) => {
		try {
			//things u can directly access in an interaction!
			const {
				member,
				channelId,
				guildId,
				applicationId,
				commandName,
				deferred,
				replied,
				ephemeral,
				options,
				id,
				createdTimestamp
			} = message;
			const {
				guild
			} = member;
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
				let newTrack = newQueue.songs[0];
				member.send({
					content: `⠀`,
					embeds: [
						new MessageEmbed().setColor(ee.color)
						.setAuthor(`${newTrack.name}`, 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiZlAkUbFZV3zmwrzAmC3c5xXJticyLgRRIQH9_rIG4qMc_6UKS8Ym_JXaXdVN0WGRokNtZxXYMvZHxstPqpakbHXl6tHoReGZiXLF4aQ1Oeg1PuBx73dQSvIaKoi-hr69tXmgwr6NYD8wysK7i7TlqLqkQORsohoAI2qx9lRiorPWp0NXYeAq_Q-7p/s16000/ezgif-2-4b715944f9.gif', `${newTrack.streamURL}`)
						
						.setDescription(`You saved this song requested by ${newTrack.user.tag} from Fantell when the track was at \`${newQueue.formattedCurrentTime}\`! Hit the Title to Download before it expires!`)
						.setImage(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
						.setFooter(`Fantell`, guild.iconURL({
							dynamic: true
						})).setTimestamp()
					]
				}).then(() => {
					message.reply({
						content: `📪 **Grabbed! Check your DMs!**`,
					})
				}).catch(() => {
					message.reply({
						content: `${client.allEmojis.x} **I can't DM you! Please check your Privacy settings!**`, ephemeral: true
					})
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
