const bot = require("../index");
const { Markup } = require('telegraf');

bot.command("stt", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(
        `Hello, ${name},\n\nWelcome to QuizBot! I'm here to help you create and organize quizzes effortlessly. Just save your questions, and let's turn them into interactive quizzes!`,
        Markup.inlineKeyboard([
            [Markup.button.callback("about", "HELP")],
            [Markup.button.callback("Language", "LANGUAGES")]
        ])
    );
});


bot.action("about", (ctx) => {
    ctx.reply("Here is some information on how to use QuizBot:\n\n1. Save your questions.\n2. Create interactive quizzes.\n3. Manage and organize them easily.");
    ctx.answerCbQuery(); // Close the button click notification
});

// Handling "Language" button
bot.action("LANGUAGES", (ctx) => {
    ctx.reply("Currently supported languages:\n- English\n- Spanish\n- French\n- German");
    ctx.answerCbQuery(); // Close the button click notification
});
