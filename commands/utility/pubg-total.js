const Discord = require("discord.js");
const battlegrounds = require("../../node_modules/battlegrounds");
const { pubgKey } = require("../../config.json");
const api = new battlegrounds(pubgKey, "pc-krjp");

module.exports = {
   name: "pubg-total",
   description: "이미지 검색",
   aliases: ["전적", "total", "pt", "history", "his"],
   args: true,
   usage: "검색어",
   cooldown: 0,
   execute(message, args) {
      let discordName = "";
      const gameName = args[0].toLowerCase();

      if (message.guild.members.cache.get(message.author.id).nickname) {
         discordName = message.guild.members.cache.get(message.author.id).nickname.toLowerCase();
      } else {
         discordName = message.guild.members.cache.get(message.author.id).user.username.toLowerCase();
      }

      if (!discordName.indexOf(gameName) == 0) {
         message.channel.send("다른 사람의 전적은 검색할 수 없습니다.");
         return;
      }

      let data = undefined;
      let data20 = [];
      let match = undefined;
      let match20 = undefined;
      let average = [];
      let avr = 20;

      const getMatch = async () => {
         try {
            const res = await api.getPlayers({ names: [args[0]] });

            if (!res[0].matches.length) {
               message.channel.send(`${message.author} 최근 15일간 전적이 없습니다.`);
               return;
            }

            const player = res[0];
            const id = player.id;
            match = await player.matches[0].get();
            const findMe = match.participants.filter((item) => {
               if (item.attributes.stats.playerId == id) {
                  return item;
               }
            });

            data = findMe[0].attributes.stats;

            if (avr > player.matches.length) avr = player.matches.length;

            for (let i = 0; i < avr; i++) {
               match20 = await player.matches[i].get();
               const findMe20 = match20.participants.filter((item) => {
                  if (item.attributes.stats.playerId == id) {
                     return item;
                  }
               });

               findMe20.map((item) => {
                  data20.push(item.attributes.stats);
               });
            }
         } catch (err) {
            if (err.code === "ERR_UNESCAPED_CHARACTERS") {
               message.channel.send(`${message.author} 잘못된 아이디 입니다.`);
               return;
            }
            if (err.errors[0].title === "Not Found") {
               message.channel.send(`${message.author} 사용자를 찾을 수 없습니다.`);
               return;
            }
         }

         const aliveTime = (seconds) => {
            let hour = parseInt(seconds / 3600);
            let min = parseInt((seconds % 3600) / 60);
            let sec = seconds % 60;

            sec.toFixed(0).length == 1 ? (sec = `0${sec.toFixed(0)}`) : (sec = sec.toFixed(0));

            hour > 0 ? (hour = `${hour} :`) : (hour = ``);

            return [hour, min, sec];
         };

         const lastTime = (sec) => {
            const time = sec.split("T");
            return time;
         };

         const lastDay = () => {
            const lastDay = lastTime(match.raw.attributes.createdAt)[0];
            return lastDay;
         };

         const lastHour = () => {
            let lastHour = Number(lastTime(match.raw.attributes.createdAt)[1].slice(0, -1).split(":")[0]) + 9;
            if (lastHour > 23) {
               lastHour = lastHour - 24;
            }
            return lastHour;
         };

         const lastMin = () => {
            const lastMin = lastTime(match.raw.attributes.createdAt)[1].slice(0, -1).split(":")[1];
            return lastMin;
         };

         // 20게임 평균
         const statAverage = (data) => {
            if (data.length) {
               average = data.reduce((prev, curr) => {
                  return prev + curr;
               });
            }

            return (average = average / data.length);
         };

         const killAvr = statAverage(
            data20.map((item) => {
               return item.kills;
            })
         );

         const damageAvr = statAverage(
            data20.map((item) => {
               return item.damageDealt;
            })
         );

         const surviveAvr = [
            (statAverage(
               data20.map((item) => {
                  return item.timeSurvived;
               })
            ).toFixed(0) %
               3600) /
               60,
            statAverage(
               data20.map((item) => {
                  return item.timeSurvived;
               })
            ).toFixed(0) % 60,
         ];

         const totalEmbed = new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle(`${data.name} 전적 통계`)
            .setThumbnail(message.author.displayAvatarURL())
            .addFields({
               name: "\u200B",
               value: `마지막 매치(시작시간 ${lastDay()} / ${lastHour()} : ${lastMin()})`,
            })
            .addFields(
               {
                  name: "```킬```",
                  value: data.kills,
                  inline: true,
               },
               {
                  name: "```어시스트```",
                  value: data.assists,
                  inline: true,
               },
               {
                  name: "```데미지```",
                  value: Math.floor(data.damageDealt),
                  inline: true,
               }
            )
            .addFields(
               {
                  name: "```순위```",
                  value: data.winPlace,
                  inline: true,
               },
               {
                  name: "```생존시간```",
                  value: `${aliveTime(data.timeSurvived)[0]} ${aliveTime(data.timeSurvived)[1]} : ${
                     aliveTime(data.timeSurvived)[2]
                  }`,
                  inline: true,
               },
               {
                  name: "```이동거리```",
                  value: `${(data.walkDistance * 0.001).toFixed(2)}km`,
                  inline: true,
               }
            )
            .addFields({ name: "\u200B", value: `최근 15일 이내 최대 20게임 평균 스텟 - ${data20.length}게임` })
            .addFields(
               {
                  name: "```K/D```",
                  value: killAvr,
                  inline: true,
               },
               {
                  name: "```데미지```",
                  value: damageAvr.toFixed(0),
                  inline: true,
               },
               {
                  name: "```생존시간```",
                  value: `${surviveAvr[0].toFixed(0)} : ${surviveAvr[1].toFixed(0)}`,
                  inline: true,
               }
            )
            .addFields({ name: "\u200B", value: "――――――――――――――――――――――――――――" })
            .setTimestamp()
            .setFooter("by 스타게이'져'", "https://i.imgur.com/Y2E4s3j.jpg");

         message.channel.send(totalEmbed);
      };

      getMatch();
   },
};
