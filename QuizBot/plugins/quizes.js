const bot = require("../index");
const { addQuiz, getQuiz, deleteQuiz, getAllQuizNames } = require("../core/mongo/quizesdb");


// --------------- Multi Quiz Function ----------------- //

function parseQuizData(data) {
    const lines = data.split('\n');
    const questions = [];
    let currentQuestion = {};

    lines.forEach((line) => {
        line = line.trim();

        if (line.startsWith('Question:')) {
            if (Object.keys(currentQuestion).length > 0) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                question: line.replace('Question:', '').trim(),
                options: {},
                correctAnswer: null,
                explanation: "No explanation",
            };
        } else if (/^[A-D]:/.test(line)) {
            const optionKey = line[0];
            const optionText = line.slice(2).trim();
            currentQuestion.options[optionKey] = optionText;
        } else if (line.startsWith('Answer:')) {
            const answer = line.replace('Answer:', '').trim();
            if (!/^\d+$/.test(answer)) {
                throw new Error("Give me answer in integer");
            }
            currentQuestion.correctAnswer = parseInt(answer, 10);
        } else if (line.startsWith('Explanation:')) {
            currentQuestion.explanation = line.replace('Explanation:', '').trim();
        }
    });

    if (Object.keys(currentQuestion).length > 0) {
        questions.push(currentQuestion);
    }

    return questions;
}


// --------------- Multi Quiz ----------------- //

bot.command('addquiz', async (ctx) => {
    const message = ctx.message.reply_to_message;
    if (!message || !message.document) {
        return ctx.reply("Please reply to a file containing the quiz data with the /addquiz command.");
    }

    try {
        const processingMessage = await ctx.reply("Processing...");
        const fileId = message.document.file_id;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await fetch(fileLink);
        const fileContent = await response.text();
        const questions = parseQuizData(fileContent);

        const totalQuizzes = questions.length;
        const result = JSON.stringify(questions, null, 2);
        const user_id = ctx.message.from.id
        await addQuiz(user_id, result)

        await ctx.telegram.editMessageText(
            processingMessage.chat.id,
            processingMessage.message_id,
            null,
            `🎉 Quiz Data Saved Successfully:\nTotal Quizzes: ${totalQuizzes}`
        );
    } catch (error) {
        console.error("Error processing the file:", error);
        ctx.reply("Failed to process the file. Please ensure it's correctly formatted. " + (error.message || ""));
    }
});


// --------------- Remove Quiz -------------- //

bot.command("removequiz", async (ctx) => {
    try {
        const user_id = ctx.from.id
        const quizName = ctx.message.text.split(" ").slice(1).join(" ");
        if (!quizName) {
            return ctx.reply("⚠️ Please provide the quiz name. Usage: /removequiz <quiz_name>");
        }

        const quizData = await getQuiz(user_id, quizName)
        if(!quizData){
            return ctx.reply("Quiz Not Found!! ");
        }
        await ctx.reply(`❓ Are you sure you want to delete the quiz *"${quizName}"*?`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🗑️ Delete", callback_data: `removequiz_yes:${quizName}` },
                        { text: "❌ Cancel", callback_data: `removequiz_no` }
                    ]
                ]
            },
            reply_to_message_id: ctx.message.message_id
        });
    } catch (error) {
        console.error(error);
        ctx.reply("🚨 An error occurred while processing your request.");
    }
});

// ---------------- Actions ------------------ //
bot.action(/^removequiz_yes:(.+)/, async (ctx) => {
    const quizName = ctx.match[1];
    const initiatingUserId = ctx.callbackQuery.message.reply_to_message.from.id;
    const clickerId = ctx.from.id;

    if (clickerId !== initiatingUserId) {
        return ctx.answerCbQuery("⛔ This action is not for you.", { show_alert: true });
    }

    await deleteQuiz(initiatingUserId, quizName);
    await ctx.answerCbQuery("✅ Successfully deleted.");

    await ctx.editMessageText(`🗑️ The quiz *"${quizName}"* has been deleted.`,        
        { parse_mode: "Markdown" }
    );
});

bot.action("removequiz_no", async (ctx) => {
    const initiatingUserId = ctx.callbackQuery.message.reply_to_message.from.id;
    const clickerId = ctx.from.id;

    if (clickerId !== initiatingUserId) {
        return ctx.answerCbQuery("⛔ This action is not for you.", { show_alert: true });
    }

    await ctx.answerCbQuery("❌ Quiz deletion canceled.");
    await ctx.editMessageText("❌ Quiz deletion has been successfully canceled.");
});



