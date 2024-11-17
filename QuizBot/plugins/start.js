const bot = require("../index")
const { Markup } = require('telegraf');

bot.command("start", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(`Hello, ${name},\n\nI am your new Quiz Bot, and I’m built using JavaScript.`,
        Markup.inlineKeyboard([
            [Markup.button.url("Source", "https://github.com/Sumit0045/QuizBot")]
        ]));
});
