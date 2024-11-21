const { MongoClient } = require("mongodb");
const { MONGO_DB } = require("./config");


const client = new MongoClient(MONGO_DB.uri);
const db = client.db("QuizBot");

const quiz = db.collection("quiz_db");





// ------------ Quiz-Database -------------- //

async function addQuiz(userId, question, options, correctOption) {
  const newQuestion = {
    question,
    options,
    correctOption
  };

  const existingQuiz = await game.findOne({ userId });

  if (existingQuiz) {
    await quiz.updateOne(
      { userId },
      { $push: { questions: newQuestion } }
    );
  } else {
    await quiz.insertOne({
      userId,
      questions: [newQuestion]
    });
  }
}

async function removeQuiz(userId, question) {
  await quiz.updateOne(
    { userId },
    { $pull: { questions: { question } } }
  );
}


async function getQuiz(userId) {
  const userQuiz = await quiz.findOne({ userId });
  if (userQuiz && userQuiz.questions) {
    return userQuiz.questions.map((q, index) => ({
      number: index + 1,
      question: q.question,
      options: q.options,
      correctOption: q.correctOption
    }));
  } else {
    return [];
  }
}

module.exports = {  
  addQuiz,
  removeQuiz,
  getQuiz
};




