const bot = require("../index");
const { getQuiz, getAllQuizNames, deleteAllQuizzes } = require("../core/mongo/quizesdb");


// ------------------ Buttons ------------------ //
const removeAllMarkup = {
  inline_keyboard: [
    [
      { text: "Remove All Quizzes", callback_data: "remove_all_quizzes" }
    ]
  ]
};

// ---------------- My Quiz Command ---------------- //
bot.command("myquiz", async (ctx) => {
  const user_id = ctx.message.from.id;
  const allquizNames = await getAllQuizNames(user_id);

  if (!allquizNames || allquizNames.length === 0) {
    ctx.reply('Quiz not found.');
    return;
  }

  let NameText = 'Here are all your Quiz Names:\n\n';
  const botName = ctx.botInfo.username;

  allquizNames.forEach((name, index) => {
    NameText += `Quiz ${index + 1}\nhttps://t.me/${botName}?start=QuizName_${name}\n\n`;
  });

  await ctx.reply(NameText, {
    reply_markup: removeAllMarkup 
  });
});


// ------------- Actions -------------- //
bot.action('remove_all_quizzes', async (ctx) => {
  const user_id = ctx.from.id;
  await deleteAllQuizzes(user_id);  
  await ctx.answerCbQuery('All quizzes have been removed.');
  await ctx.editMessageText('All quizzes have been removed successfully!');
});







const userResponses = {}; // Store user responses and scores

async function pollUploader(ctx, user_id, name) {
  try {
    console.log(name)
    const quizData = await getQuiz(user_id, name);

    if (!quizData || quizData.length === 0) {
      await ctx.reply("Bruh, Quiz Not Found!!");
      return;
    }

    for (const quiz of quizData) {
      const question = quiz.question;
      const options = Object.values(quiz.options);
      const correctIndex = quiz.correctAnswer - 1;

      // Send the poll
      const pollMessage = await ctx.sendPoll(question, options, {
        type: "quiz",
        correct_option_id: correctIndex,
        is_anonymous: false,
        explanation: quiz.explanation || "No explanation provided",
      });

      // Track responses when users answer
      bot.on("poll_answer", async (pollAnswerCtx) => {
        const userId = pollAnswerCtx.user.id;
        const userName = `${pollAnswerCtx.user.first_name} ${pollAnswerCtx.user.last_name || ""}`.trim();
        const answerIndex = pollAnswerCtx.option_ids[0];

        // Initialize user response data if not present
        if (!userResponses[userId]) {
          userResponses[userId] = { name: userName, correct: 0, wrong: 0, total: 0 };
        }

        const userScore = userResponses[userId];
        userScore.total++;

        if (answerIndex === correctIndex) {
          userScore.correct++;
        } else {
          userScore.wrong++;
        }
      });

      // Wait for 1 minute before sending the next poll
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }

    // Summarize results after all polls are sent
    await summarizeResults(ctx);
  } catch (error) {
    console.error("Error uploading poll:", error);
    await ctx.reply("Failed to upload the poll. Please try again.");
  }
}

// Summarize the results
async function summarizeResults(ctx) {
  let summary = "🏆 **Quiz Leaderboard** 🏆\n\n";
  let totalParticipants = Object.keys(userResponses).length;

  summary += `**Total Participants**: ${totalParticipants}\n\n`;

  // Sort users by correct answers descending
  const sortedUsers = Object.values(userResponses).sort((a, b) => b.correct - a.correct);

  sortedUsers.forEach((user, index) => {
    summary += `${index + 1}. **${user.name}**\n   - Correct: ${user.correct}\n   - Wrong: ${user.wrong}\n   - Total Answered: ${user.total}\n\n`;
  });

  await ctx.replyWithMarkdown(summary);
}

module.exports = { pollUploader };



