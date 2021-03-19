const discord = require("discord.js");
const client = new discord.Client();
const { prefix, token } = require("./config.json");

client.on("ready", () => {
   console.log(`I am Ready ${client.user.tag}`);
});

client.on("message", (message) => {
   if (!message.content.startsWith(prefix) || message.author.bot) return; // 명령어 조건

   const args = message.content.slice(prefix.length).trim().split(/ +/); // 받아온 아규먼트 자르기
   const command = args.shift().toLowerCase(); // 받아온 아규먼드 명령어로 변환

   if (command === "args-info") {
      // 아규먼트 정보출력
      if (!args.length) {
         return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
      } else if (args[0] === "foo") {
         return message.channel.send("bar");
      }

      message.channel.send(`Command name: ${command} \nArgument: ${args} \nArgument length: ${args.size}`);
   } else if (command === "kick") {
      // 사용자 @태그로 추방
      if (!message.mentions.users.size) {
         return message.reply("you need to tag a user in order to kick them!");
      }

      const taggedUser = message.mentions.users.first();

      message.channel.send(`You wanted to kick: ${taggedUser.username}`);
   } else if (command === "avatar") {
      // @태그 여러명 아바타 출력
      if (!message.mentions.users.size) {
         return message.channel.send(
            `Your avatar: <${message.author.displayAvatarURL({ format: "png", dynamic: true })}>`
         );
      }

      const avatarList = message.mentions.users.map((user) => {
         return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
      });

      message.channel.send(avatarList);
   } else if (command === "prune") {
      // 숫자 입력시 메세지 삭제
      const amount = parseInt(args[0]) + 1;

      if (isNaN(amount)) {
         return message.reply("that doesn't seem to be a valid number.");
      } else if (amount < 1 || amount > 100) {
         return message.reply("you need to input a number between 2 and 100.");
      }

      message.channel.bulkDelete(amount);
   }

   // if (message.content.startsWith(`${prefix}ping`)) {
   //    message.channel.send("Pong.");
   // }

   // if (message.content.startsWith(`${prefix}avatar`)) {
   //    message.channel.send(message.author.displayAvatarURL());
   // }

   // if (message.content.startsWith(`${prefix}help`)) {
   //    const embed = new discord.MessageEmbed()
   //       .setTitle("OUBOT command list")
   //       .setColor("0f4c81")
   //       .setDescription("!ping = answer 'Pong.'. \n !avatar = show my avatar. \n !help = show command list. \n");

   //    message.channel.send(embed);
   // }

   // if (message.content === `${prefix}server`) {
   //    message.channel.send(`서버이름 : ${message.guild.name} \n총 구성원 : ${message.guild.members.name}`);
   // }

   // if (message.content === `${prefix}user-info`) {
   //    message.channel.send(`사용자 이름 : ${message.author.username} \nID : ${message.author.lastMessage}`);
   // }
});

client.login(token);
