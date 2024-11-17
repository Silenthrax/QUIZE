const { bot } = require("../index");
const { Markup } = require('telegraf');


bot.command("addquiz", async (ctx) => {
    const name = ctx.from.first_name;
    await ctx.reply(`Hello, ${name}!\n\nLet's create a quiz. Please start by typing your question:`);

    const createQuiz = async () => {
        const question = await askQuestion(ctx, "Please type your question:");

        let options = [];
        for (let i = 1; i <= 4; i++) {
            const option = await askQuestion(ctx, `Please provide option ${i}:`);
            options.push(option);
        }

        let correctOption;
        while (true) {
            correctOption = parseInt(await askQuestion(ctx, "Specify the correct option (1, 2, 3, or 4):"));
            if (correctOption >= 1 && correctOption <= 4) break;
            await ctx.reply("Invalid option. Please enter a number between 1 and 4.");
        }

        await ctx.reply(
            `Here's your quiz setup:\n\n*Question:* ${question}\n` +
            `*Options:*\n1. ${options[0]}\n2. ${options[1]}\n3. ${options[2]}\n4. ${options[3]}\n\n` +
            `*Correct Answer:* Option ${correctOption}`,
            Markup.inlineKeyboard([
                [Markup.button.callback("Add more Quiz", "add_more_quiz")]
            ])
        );
    };

    const askQuestion = (ctx, prompt) => {
        return new Promise((resolve) => {
            ctx.reply(prompt);
            bot.once('text', (answerCtx) => resolve(answerCtx.message.text));
        });
    };

    await createQuiz();

    bot.action("add_more_quiz", async (ctx) => {
        await ctx.answerCbQuery();
        await createQuiz();
    });
});





