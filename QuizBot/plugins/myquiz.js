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

/*
let activeQuizzes = {};

async function pollUploader(ctx, user_id, quizName) {
  try {
    const quizDataRaw = await getQuiz(user_id, quizName);
    const quizData = typeof quizDataRaw === "string" ? JSON.parse(quizDataRaw) : quizDataRaw;

    activeQuizzes[user_id] = {
      quizName,
      questions: quizData,
      participants: {},
    };

    await ctx.replyWithHTML(
      `📝 <b>Quiz Started:</b> <b>${quizName}</b>\nTotal Questions: ${quizData.length}\nGet ready! 🎯`
    );

    for (const quiz of quizData) {
      const { question, options, correctAnswer, explanation } = quiz;
      const pollOptions = Object.values(options).map(String);
      const adjustedCorrectAnswer = Math.max(parseInt(correctAnswer, 10) - 1, 0);
      const pollMessage = await bot.telegram.sendPoll(ctx.chat.id, question, pollOptions, {
        type: "quiz",
        correct_option_id: adjustedCorrectAnswer,
        is_anonymous: false,
        explanation,
      });

      quiz.poll_id = pollMessage.poll.id;
      quiz.correctAnswer = adjustedCorrectAnswer;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }

    bot.on("poll_answer", async (ctx) => {
      const { user, poll_id, option_ids } = ctx.pollAnswer;
      const userId = user.id;
      const userName = user.first_name || "Anonymous";

      for (const [quizUserId, quizData] of Object.entries(activeQuizzes)) {
        const activeQuiz = quizData.questions.find((quiz) => quiz.poll_id === poll_id);

        if (activeQuiz) {
          if (!quizData.participants[userId]) {
            quizData.participants[userId] = { name: userName, correct: 0, wrong: 0 };
          }

          const userAnswer = option_ids[0];
          if (userAnswer === activeQuiz.correctAnswer) {
            quizData.participants[userId].correct += 1;
          } else {
            quizData.participants[userId].wrong += 1;
          }
          break;
        }
      }
    });
    
    await showResults(ctx, user_id);

  } catch (error) {
    console.error("Error starting the quiz:", error);
    await ctx.reply("An error occurred while starting the quiz.");
  }
}


async function showResults(ctx, quizOwnerId) {
  const quizData = activeQuizzes[quizOwnerId];
  console.log(quizData)

  if (!quizData) {
    return await ctx.reply("No quiz data found.");
  }

  const participants = Object.values(quizData.participants);
  if (participants.length === 0) {
    return await ctx.replyWithHTML(`⚠️ No one participated in the quiz <b>${quizData.quizName}</b>.`);
  }

  const sortedParticipants = participants.sort((a, b) => b.correct - a.correct);

  let resultsMessage = `🎉 <b>Quiz Completed:</b> ${quizData.quizName}\n\n`;
  resultsMessage += sortedParticipants
    .map((p, i) => {
      const rankEmoji = i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖️";
      return `${rankEmoji} <b>${p.name}</b> - ✅ Correct: ${p.correct} | ❌ Wrong: ${p.wrong}`;
    })
    .join("\n");

  resultsMessage += `\n\n🎯 <b>Thank you all for participating!</b> 🥳`;

  await ctx.replyWithHTML(resultsMessage);
  delete activeQuizzes[quizOwnerId];
}

*/

const pollUploader = 5 ;

const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswerIndex: 2,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswerIndex: 1,
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Shakespeare", "Dickens", "Austen", "Hemingway"],
    correctAnswerIndex: 0,
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswerIndex: 3,
  },
  {
    question: "Which animal is the largest mammal?",
    options: ["Elephant", "Whale", "Giraffe", "Shark"],
    correctAnswerIndex: 1,
  },
];

let userAnswers = {};
let answeredUsers = new Set();

bot.command('startquiz', async (ctx) => {
  let questionIndex = 0;
  while (questionIndex < quizQuestions.length) {
    const { question, options } = quizQuestions[questionIndex];
    await ctx.replyWithPoll(question, options, { is_anonymous: false });
    questionIndex++;
  }
  await ctx.reply('Please answer all questions to see the results!');
});

bot.on('poll_answer', async (ctx) => {
  const userId = ctx.poll_answer.user.id;
  const pollId = ctx.poll_answer.poll_id;
  const selectedOptionIndex = ctx.poll_answer.option_ids[0];

  if (!userAnswers[userId]) {
    userAnswers[userId] = { correct: 0, wrong: 0 };
  }

  const correctAnswerIndex = quizQuestions[pollId].correctAnswerIndex;

  if (selectedOptionIndex === correctAnswerIndex) {
    userAnswers[userId].correct++;
  } else {
    userAnswers[userId].wrong++;
  }

  answeredUsers.add(userId);

  if (answeredUsers.size === Object.keys(userAnswers).length) {
    const sortedResults = Object.entries(userAnswers)
      .map(([userId, scores]) => ({
        userId,
        ...scores,
      }))
      .sort((a, b) => b.correct - a.correct);

    let resultMessage = 'Leaderboard:\n\n';
    sortedResults.forEach((result, index) => {
      const user = ctx.telegram.getChat(result.userId);
      resultMessage += `${index + 1}. ${user.first_name}: Correct: ${result.correct}, Wrong: ${result.wrong}\n`;
    });

    ctx.reply(resultMessage);
  }
});







module.exports = { pollUploader };



