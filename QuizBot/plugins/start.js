const bot = require("../index");



bot.command("start", async (ctx) => {
    try {
        let name = ctx.from.first_name;
        await ctx.reply(
            `Hello, ${name},\n\nWelcome to QuizBot! I'm here to help you create and organize quizzes effortlessly.`,
        );
    } catch (error) {
        console.error("Error in start command:", error);
        await ctx.reply("An error occurred. Please try again later.");
    }
});

bot.action("HELP", async (ctx) => {
    try {
        await ctx.reply(
            "Here is some information on how to use QuizBot:\n\n1. Save your questions.\n2. Create interactive quizzes.\n3. Manage and organize them easily."
        );
        await ctx.answerCbQuery(); // Close the button click notification
    } catch (error) {
        console.error("Error in HELP action:", error);
        await ctx.reply("An error occurred while processing your request.");
    }
});

bot.action("LANGUAGES", async (ctx) => {
    try {
        await ctx.reply(
            "Currently supported languages:\n- English\n- Spanish\n- French\n- German"
        );
        await ctx.answerCbQuery(); // Close the button click notification
    } catch (error) {
        console.error("Error in LANGUAGES action:", error);
        await ctx.reply("An error occurred while processing your request.");
    }
});


