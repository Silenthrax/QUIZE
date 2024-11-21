const bot = require("../index");
const { Markup } = require('telegraf');

bot.command("start", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(
        `Hello, ${name},\n\nWelcome to QuizBot! I'm here to help you create and organize quizzes effortlessly. Just save your questions, and let's turn them into interactive quizzes!`,
        Markup.inlineKeyboard([
            [Markup.button.callback("Helps", "HELP")],
            [Markup.button.callback("Languages", "LANGUAGES")]
        ])
    );
});


bot.action("HELP", (ctx) => {
    ctx.reply("Here is some information on how to use QuizBot:\n\n1. Save your questions.\n2. Create interactive quizzes.\n3. Manage and organize them easily.");
    ctx.answerCbQuery(); // Close the button click notification
});

// Handling "Languages" button
bot.action("LANGUAGES", (ctx) => {
    ctx.reply("Currently supported languages:\n- English\n- Spanish\n- French\n- German");
    ctx.answerCbQuery(); // Close the button click notification
});
