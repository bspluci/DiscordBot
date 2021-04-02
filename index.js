const fs = require("fs");
const Discord = require("discord.js");
const { prefix } = require("./config.json");

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

   // 명령 권한 체크
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
