const { prefix } = require("../../config.json");

module.exports = {
   name: "event",
   description: "이벤트 매치를 생성합니다.",
   aliases: ["이벤트", "ev"],
   args: true,
   help: "help",
   cooldown: 1,
   num: undefined,
   team: undefined,
   embed: undefined,
   diviTeam: [],
   baseChannel: "이벤트대기방",
   childChannel: ["custom1", "custom2", "custom3"],
   execute(message, args) {
      const cmd = args[0].toLowerCase(); // 내부명령어
      const MGCC = message.guild.channels.cache;
      const MGMC = message.guild.members.cache;
      const MCH = message.channel;
      const thisBC = this.baseChannel;
      const thisCC = this.childChannel;
      let baseChannel = ""; // 채널명을 채널id값으로 바꿈
      let childChannel = []; // 채널명을 채널id값으로 바꿈

      if (cmd === "showchannels" || cmd === "채널목록" || cmd === "채널보기") {
         this.embed = !this.embed;
         MCH.send(`baseChannel: ${thisBC} \nchildChannel: ${thisCC}`);
         return;
      }

      if (cmd === "base" || cmd === "대기실" || cmd === "베이스") {
         if (args.length > 2) {
            MCH.send(`${message.author} 복수의 베이스 채널은 설정할 수 없습니다.`);
            return;
         }

         const baseName = args.filter((com) => {
            return com != cmd;
         });

         this.baseChannel = baseName.join("");
         MCH.send(`${message.author} 이벤트 베이스 채널을 "${baseName.join("")}" (으)로 설정했습니다.`);
         return;
      }

      if (cmd === "child" || cmd === "팀채널" || cmd === "팀설정") {
         const childName = args.filter((com) => {
            return com != cmd;
         });

         this.childChannel = childName;
         childChannel = [];
         MCH.send(`${message.author} 이벤트 팀 채널을 "${childName}" (으)로 설정했습니다.`);
         return;
      }

      if (!thisBC || !thisCC) {
         MCH.send(
            `${message.author} 이벤트 채널 설정이 필요합니다. \n${prefix}${this.name} showchannels 명령으로 채널 목록을 확인해주세요.`
         );
         return;
      } else {
         for (let i = 0; i < thisCC.length; i++) {
            if (thisCC[i] === thisBC) {
               MCH.send(
                  `${message.author} ${thisCC[i]} 은 중복된 채널입니다. \n${prefix}${this.name} showchannels 명령으로 채널 목록을 확인해주세요.`
               );
               return;
            }
         }
      }

      const baseCh = MGCC.map((channel) => {
         if (channel.name.replace(/(\s*)/g, "") === thisBC.replace(/(\s*)/g, "")) {
            baseChannel = channel.id;
         }
      });

      const childCh = MGCC.filter((channel) => {
         for (let i = 0; i < thisCC.length; i++) {
            if (channel.name.replace(/(\s*)/g, "") === thisCC[i].replace(/(\s*)/g, "")) {
               childChannel.push(channel.id);
            }
         }
      });

      if (!MGCC.get(baseChannel)) {
         MCH.send(`${message.author} 이벤트 채널 설정이 필요합니다.`);
         return;
      }

      if (cmd === "home" || cmd === "모임" || cmd === "홈") {
         if (!this.team) {
            MCH.send(`${message.author} 팀 분배 후 실행해주세요.`);
         } else {
            for (i = 0; i < this.team.length; i++) {
               for (s = 0; s < this.team[i].length; s++) {
                  const voiceUser = MGMC.get(message.client.users.cache.get(this.team[i][s].user.id).id);

                  if (voiceUser.voice.channelID) {
                     MGMC.get(this.team[i][s].user.id).voice.setChannel(MGCC.get(baseChannel));
                  } else {
                     return;
                  }
               }
            }
         }
         return;
      }

      const channelMembers = MGCC.get(baseChannel).members.map((user) => {
         return user;
      });

      if (!channelMembers.length && !this.team) {
         MCH.send(`${message.author} 이벤트 베이스 채널이 비어있습니다. 채널 참여 후 다시 실행해주세요.`);
         return;
      }

      if (cmd === "team" || cmd === "팀" || cmd === "팀설정" || cmd === "팀나누기") {
         if (!args[1]) {
            this.team = undefined;
            MCH.send(`${message.author} 팀 인원이 초기화 됐습니다`);

            return;
         }

         const eventMembers = channelMembers.sort(() => Math.random() - 0.5);

         Array.prototype.division = (n) => {
            const arr = eventMembers.map((user) => {
               return user;
            });
            const len = arr.length;
            const cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
            let temp = [];
            this.num = n;

            for (let i = 0; i < cnt; i++) {
               temp.push(arr.splice(0, n));

               if (i + 2 === cnt) {
                  if (arr.length > 0 && arr.length < n) {
                     const num = arr.length;

                     for (let s = 0; s < num; s++) {
                        temp[s].push(arr.splice(0, n));
                     }
                  }
               }
            }
            return temp;
         };

         const divisionTeams = eventMembers.division(args[1]);
         this.team = divisionTeams;
         let num = 0;

         MCH.send(
            divisionTeams.map((name) => {
               num++;
               this.diviTeam.push(`${num}팀: ${name}`);
               return `${num}팀 : ${name}`;
            })
         );

         const divisionTeamEmbed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle("Some title")
            // .setURL("https://discord.js.org/")
            // .setAuthor("Some name", "https://i.imgur.com/wSTFkRM.png", "https://discord.js.org")
            // .setDescription("Some description here")
            .setThumbnail("https://i.imgur.com/wSTFkRM.png")
            .addFields(
               { name: "Regular field title", value: "Some value here" },
               { name: "\u200B", value: "\u200B" },
               { name: "Inline field title", value: "Some value here", inline: true },
               { name: "Inline field title", value: "Some value here", inline: true }
            )
            .addField("Inline field title", "Some value here", true)
            .setImage("https://i.imgur.com/wSTFkRM.png")
            .setTimestamp()
            .setFooter("Some footer text here", "https://i.imgur.com/wSTFkRM.png");

         this.embed = divisionTeamEmbed;
      }

      if (cmd === "이동" || cmd === "move") {
         if (this.num === undefined || this.team === undefined) {
            MCH.send(`${message.author} 인원에 맞게 팀을 나눠주세요.`);
            return;
         }

         for (let i = 0; i < this.team.length; i++) {
            for (let s = 0; s < this.team[i].length; s++) {
               MGMC.map((user) => {
                  if (user.user.username === this.team[i][s].user.username) {
                     MGMC.get(user.user.id).voice.setChannel(MGCC.get(childChannel[i]));
                  }
               });
            }
         }
         return;
      }

      // if (cmd === "이동" || cmd === "move") {
      //    if (this.num === undefined || this.team === undefined) {
      //       MCH.send(`${message.author} 인원에 맞게 팀을 나눠주세요.`);
      //       return;
      //    }

      //    let thisTeam = this.team;
      //    moveChannelHandler = async () => {
      //       const moveChannel = await function () {
      //          for (let i = 0; i < thisTeam.length; i++) {
      //             for (let s = 0; s < thisTeam[i].length; s++) {
      //                MGMC.map((user) => {
      //                   if (user.user.username === thisTeam[i][s].user.username) {
      //                      MGMC.get(user.user.id).voice.setChannel(MGCC.get(childChannel[i]));
      //                   }
      //                });
      //             }
      //          }
      //       };

      //       moveChannel();
      //    };

      //    moveChannelHandler().then(MCH.send(`${message.author} 이동이 완료됐습니다. `));

      //    return;
      // }
   },
};
