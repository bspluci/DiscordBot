const fs = require("fs");
const Discord = require("discord.js");
const { prefix } = require("./config.json");
const helpEmbed = new Discord.MessageEmbed()
   .setColor("GREEN")
   .setTitle("OUBG BOT")
   // .setURL("https://discord.js.org/")
   // .setAuthor("Some name", "https://i.imgur.com/wSTFkRM.png", "https://discord.js.org")
   // .setDescription("Some description here")
   .setThumbnail("https://i.imgur.com/wSTFkRM.png")
   .addFields(
      { name: "showchannels / 채널목록 / 채널보기", value: "등록된 채널목록을 보여줍니다. \n 예) !event showchannels" },
      {
         name: "base / 대기실 / 베이스",
         value: "베이스 채널을 설정합니다(공백불가, 중복불가) \n 예) !event base 채널이름",
      },
      {
         name: "child / 팀채널 / 팀설정",
         value: "팀채널을 설정합니다(공백불가) \n 예) !event child 채널이름0 채널이름1 채널이름2",
      },
      {
         name: "team / 팀 / 팀나누기",
         value: "베이스 채널의 인원을 두번째 인수값으로 나누어 팀을 분배합니다. \n 예) !event team 3",
      },
      {
         name: "move / 이동",
         value: "나누어진 팀원을 채널에 맞게 이동시킵니다. \n 예) !event move",
      },
      {
         name: "home / 모임 / 홈",
         value: "팀채널에 이동시킨 인원을 베이스채널로 이동시킵니다. \n 예) !event home",
      }
      // { name: "\u200B", value: "\u200B" },
   )
   // .addField("Inline field title", "Some value here", true)
   // .setImage("https://i.imgur.com/wSTFkRM.png")
   .setTimestamp();
// .setFooter("Some footer text here", "https://i.imgur.com/wSTFkRM.png");

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const commandFolders = fs.readdirSync("./commands");

// command폴더 파일 자동 찾기
for (const folder of commandFolders) {
   const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
   for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      client.commands.set(command.name, command);
   }
}

client.once("ready", () => {
   console.log("Ready!");
});

client.on("message", (message) => {
   if (!message.content.startsWith(prefix) || message.author.bot) return; // 명령어 조건

   const args = message.content.slice(prefix.length).trim().split(/ +/); // 받아온 메세지 자르기
   const commandName = args.shift().toLowerCase(); // 받아온 메세지를 명령어로 변환

   // 명령어 별칭 설정(avatar.js)
   const command =
      client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

   if (!command) return;

   // dm으로 보낸 명령은 필터함(전체 채널에서만 사용가능)
   if (command.guildOnly && message.channel.type === "dm") {
      return message.reply("I can't execute that command inside DMs!");
   }

   // 명령 권한 체크(kick.js)
   if (command.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
         return message.reply("You can not do this!");
      }
   }

   if (command.name === "event" && args[0] === `${command.help}`) {
      message.channel.send(helpEmbed);
   }

   // 명령 사용법 체크
   if (command.args && !args.length) {
      let reply = "";

      if (command.name === "channel") {
         reply = `${message.author} 채널명을 입력하세요!`;
      } else if (command.name === "event") {
         reply = `${message.author} ${prefix}${command.name} ${command.help} 를 통해 사용법을 확인하세요.`;
      } else {
         reply = `${message.author} 사용자를 입력하세요!`;
      }

      if (command.usage) {
         reply += `\n해당 명령어의 사용법은 다음과 같습니다: \`${prefix}${command.name} ${command.usage}\``;
      }

      return message.channel.send(reply);
   }

   // 명령어 스팸방지 쿨다운(ping.js)
   const { cooldowns } = client;

   if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
   }

   const now = Date.now();
   const timestamps = cooldowns.get(command.name);
   const cooldownAmount = (command.cooldown || 3) * 1000;

   if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
         const timeLeft = (expirationTime - now) / 1000;
         return message.reply(` ${timeLeft.toFixed(1)}초 후 다시 실행해 주세요.`);
      }
   }

   timestamps.set(message.author.id, now);
   setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
   // 쿨다운 끝

   try {
      command.execute(message, args);
   } catch (error) {
      console.error(error);
      message.reply("해당 명령을 실행하는 중에 오류가 발생했습니다.");
   }
});

client.login(process.env.TOKEN);
