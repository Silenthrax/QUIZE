const bot = require("../index");
const fs = require("fs");
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
    NameText += `<b>Quiz ${index + 1} : ${name}</b>\nhttps://t.me/${botName}?start=QuizName_${name}\n\n`;
  });

  await ctx.replyWithHTML(NameText, {
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




// ------------- Poll Uploader ---------------- //

const userResponses = {};

async function pollUploader(ctx, user_id, name) {
  try {
    const quizDataRaw = await getQuiz(user_id, name);
    const quizData = typeof quizDataRaw === "string" ? JSON.parse(quizDataRaw) : quizDataRaw;

    await ctx.replyWithHTML(
      `📝 <b>Quiz Started</b>: <b>${name}</b> 📚\n\nTotal Questions: ${quizData.length}. Get ready! 🎯`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    bot.on("poll_answer", (pollAnswer) => {
      const { user, option_ids, poll_id } = pollAnswer;
      const userId = user.id;
      const questionIndex = quizData.findIndex((quiz) => quiz.poll_id === poll_id);
      const correctOptionIndex = quizData[questionIndex]?.correctAnswer;

      if (!userResponses[userId]) {
        userResponses[userId] = { name: user.first_name, correct: 0, wrong: 0 };
      }

      if (option_ids.includes(correctOptionIndex)) {
        userResponses[userId].correct += 1;
      } else {
        userResponses[userId].wrong += 1;
      }
    });

    for (const quiz of quizData) {
      const { question = "Demo", options, correctAnswer, explanation } = quiz;

      const pollOptions = Object.values(options).map(String);

      const pollMessage = await bot.telegram.sendPoll(ctx.chat.id, question, pollOptions, {
        type: "quiz",
        correct_option_id: correctAnswer,
        explanation,
        is_anonymous: false,
      });

      quiz.poll_id = pollMessage.poll.id;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }

    if (Object.keys(userResponses).length === 0) {
      await ctx.replyWithHTML("📊 <b>No participants responded to the quiz.</b>");
      return;
    }

    const sortedResults = Object.values(userResponses).sort((a, b) => b.correct - a.correct);
    let resultsMessage = "🎉 <b>Quiz Completed Successfully!</b>\n\n🏆 <b>Results:</b>\n\n";

    sortedResults.forEach((user, index) => {
      resultsMessage += `<b>${index + 1}. ${user.name}</b>\n✅ Correct: ${user.correct}\n❌ Wrong: ${user.wrong}\n\n`;
    });

    if (resultsMessage.length > 4096) {
      const filePath = "/mnt/data/quiz_results.txt";
      fs.writeFileSync(filePath, resultsMessage);
      await ctx.replyWithDocument({ source: filePath, filename: "quiz_results.txt" });
      fs.unlinkSync(filePath);
    } else {
      await ctx.replyWithHTML(resultsMessage);
    }

    await ctx.replyWithHTML("🎯 <b>Thank you for participating!</b>🥳");

  } catch (error) {
    console.error("Error uploading poll:", error);
    await ctx.reply("❌ Failed to upload the poll. Please try again.");
  }
}




const userScores = {};

// /poll command to create a quiz
bot.command('poll', (ctx) => {
  ctx.telegram.sendPoll(
    ctx.chat.id,
    'Which is the capital of France?',
    ['Paris', 'Berlin', 'Madrid'],
    {
      type: 'quiz',
      correct_option_id: 0,
      explanation: 'Paris is the capital of France.',
      is_anonymous: false,  // Ensures we can track users
    }
  );
});

// Listen for poll answers
bot.on('poll_answer', (ctx) => {
  const userId = ctx.pollAnswer.user.id;
  const selectedOption = ctx.pollAnswer.option_ids[0];
  const correctOption = 0; // Paris

  // Initialize user score if not already present
  if (!userScores[userId]) {
    userScores[userId] = { correct: 0, wrong: 0 };
  }

  if (selectedOption === correctOption) {
    userScores[userId].correct += 1;
    ctx.telegram.sendMessage(ctx.pollAnswer.user.id, `Correct! ✅ Total Correct: ${userScores[userId].correct}`);
  } else {
    userScores[userId].wrong += 1;
    ctx.telegram.sendMessage(ctx.pollAnswer.user.id, `Wrong! ❌ Total Wrong: ${userScores[userId].wrong}`);
  }
});





module.exports = { pollUploader };


