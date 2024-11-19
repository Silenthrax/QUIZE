const bot = require("../index")
const { Markup } = require('telegraf');

bot.command("start", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(`Hello, ${name},\n\nWelcome to QuizBot! I'm here to help you create and organize quizzes effortlessly. Just save your questions, and let's turn them into interactive quizzes!`,
        Markup.inlineKeyboard([
            [Markup.button.url("Source", "https://github.com/Sumit0045/QuizBot")]
        ]));
});
