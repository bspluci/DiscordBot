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
   maxMember: 4,
   baseChannel: "참가자대기실",
   childChannel: [
      "[1]커스텀",
      "[2]커스텀",
      "[3]커스텀",
      "[4]커스텀",
      "[5]커스텀",
      "[6]커스텀",
      "[7]커스텀",
      "[8]커스텀",
      "[9]커스텀",
      "[10]커스텀",
      "[11]커스텀",
      "[12]커스텀",
      "[13]커스텀",
      "[14]커스텀",
      "[15]커스텀",
   ],
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
            return;
         }

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

         return;
      }

      const eventMembers = MGCC.get(baseChannel).members.sort(() => Math.random() - 0.5);
      const eventThis = eventMembers.map((user) => {
         return user;
      });
      const eventText = eventMembers.map((user) => {
         return `  ${user}  `;
      });

      if (!eventThis.length && !this.team) {
         MCH.send(`${message.author} 이벤트 베이스 채널이 비어있습니다. 채널 참여 후 다시 실행해주세요.`);
         return;
      }

      if (cmd === "team" || cmd === "팀" || cmd === "팀나누기") {
         if (!args[1]) {
            this.team = undefined;
            MCH.send(`${message.author} 팀 인원이 초기화 됐습니다`);

            return;
         }

         division = (n, text) => {
            let arr = "";
            text ? (arr = eventText) : (arr = eventThis);
            const len = arr.length;
            const cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
            let temp = [];
            this.num = n;

            for (let i = 0; i < cnt; i++) {
               if (i + 1 === cnt && len % cnt > 0 && n < this.maxMember) {
                  for (let s = 0; s < len % cnt; s++) {
                     temp[s].push(arr[arr.length - s + 1]);
                  }

                  return temp;
               }

               temp.push(arr.splice(0, n));
            }

            return temp;
         };

         const divisionTeams = division(args[1], true);
         this.team = division(args[1], false);
         let num = 0;

         MCH.send(
            divisionTeams.map((name) => {
               num++;

               return `${num}팀 : ${name}`;
            })
         );
      }

      if (cmd === "move" || cmd === "이동") {
         if (this.num === undefined || this.team === undefined) {
            MCH.send(`${message.author} 인원에 맞게 팀을 나눠주세요.`);

            return;
         }

         const thisTeam = this.team;

         // let num = 0;

         // async function findTeam() {
         //    num++;

         //    setInterval(function(){
         //       await moveChannel(thisTeam[i], childChannel[num]);
         //       })
         // }
         async function findTeam() {
            for (let i = 0; i < thisTeam.length; i++) {
               await moveChannel(thisTeam[i], childChannel[i]);
            }
         }

         function moveChannel(team, child) {
            return new Promise((resolve) => {
               setTimeout(() => {
                  for (let s = 0; s < team.length; s++) {
                     const setChannelUser = MGCC.get(baseChannel).members.map((user) => {
                        if (user.user.username === team[s].user.username) {
                           MGMC.get(user.user.id).voice.setChannel(MGCC.get(child));
                        }
                     });
                     resolve(setChannelUser);
                  }
               }, 1500);
            });
         }

         // function moveChannel(team, child) {
         //    for (const item of team) {
         //       MGCC.get(baseChannel).members.map((user) => {
         //          if (user.user.username === item.user.username) {
         //             MGMC.get(user.user.id).voice.setChannel(MGCC.get(child));
         //          }
         //       });
         //    }
         // }

         findTeam();

         return;
      }
   },
};
