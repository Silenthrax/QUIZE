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

bot.command('multiquiz', async (ctx) => {
    const message = ctx.message.reply_to_message;
    if (!message || !message.document) {
        return ctx.reply("Please reply to a file containing the quiz data with the /multiquiz command.");
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
        await AddQuiz(user_id, result)

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

