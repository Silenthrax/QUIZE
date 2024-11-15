const { MongoClient } = require("mongodb");
const { MONGO_DB } = require("./config");


const client = new MongoClient(MONGO_DB.uri);
const db = client.db("QuizBot");

const users = db.collection("users");
const chats = db.collection("chats");
const game = db.collection("quiz_db");


// ------------ Users-Database -------------- //

async function getChats() {
  const chatList = [];
  const cursor = chats.find({ chat: { $lt: 0 } });
  await cursor.forEach(chat => chatList.push(chat.chat));
  return chatList;
}

async function getChat(chat) {
  const chatList = await getChats();
  return chatList.includes(chat);
}

async function addChat(chat) {
  const chatExists = await getChat(chat);
  if (!chatExists) {
    await chats.insertOne({ chat });
  }
}

async function delChat(chat) {
  const chatExists = await getChat(chat);
  if (chatExists) {
    await chats.deleteOne({ chat });
  }
}


// ------------ Quiz-Database -------------- //

async function addQuiz(userId, question, options, correctOption) {
  const newQuestion = {
    question,
    options,
    correctOption
  };

  const existingQuiz = await game.findOne({ userId });

  if (existingQuiz) {
    await game.updateOne(
      { userId },
      { $push: { questions: newQuestion } }
    );
  } else {
    await game.insertOne({
      userId,
      questions: [newQuestion]
    });
  }
}

async function removeQuiz(userId, question) {
  await game.updateOne(
    { userId },
    { $pull: { questions: { question } } }
  );
}


// Function to get all quiz questions for a specific user, including question, options, and correct option
async function getQuiz(userId) {
  const userQuiz = await game.findOne({ userId });
  if (userQuiz && userQuiz.questions) {
    return userQuiz.questions.map((q, index) => ({
      number: index + 1,
      question: q.question,
      options: q.options,
      correctOption: q.correctOption
    }));
  } else {
    return []; // Return an empty array if no quiz data found
  }
}

module.exports = {
  getChats,
  getChat,
  addChat,
  delChat,
  addQuiz,
  removeQuiz,
  getQuiz
};




