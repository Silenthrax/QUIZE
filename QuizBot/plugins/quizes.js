const bot = require("../index");


bot.command("addquiz", async (ctx) => {
  const msg = ctx.message.text.split(" ")[0]
  await ctx.reply(`soon bro. ${} `)
});
