const { MongoClient } = require("mongodb");
const { MONGO_DB } = require("../../../config");

const client = new MongoClient(MONGO_DB);

const db = client.db("QuizBot");
const chats = db.collection("chats");

async function check_if_chat_exists(chatid) {
    const chat = await chats.findOne({ "chat_id": chatid });
    return chat !== null; // Returns true if chat exists, false otherwise
}

async function add_chat(chatid, title) {
    const if_exists = await check_if_chat_exists(chatid);
    if (!if_exists) {
        await chats.insertOne({
            "chat_id": chatid,
            "title": title
        });
        console.log("Chat added successfully!");
    } else {
        console.log("Chat already exists. Skipping insertion.");
    }
}

async function find_chat(chatid) {
    const chat = await chats.findOne({ "chat_id": chatid });
    if (chat) {
        console.log("Chat found:", chat);
        return chat;
    } else {
        console.log("No chat found with the given chat_id.");
        return null;
    }
}


async function get_total_chats() {
    const chatIds = await chats.find({}, { projection: { chat_id: 1, _id: 0 } }).toArray();
    const chatIdList = chatIds.map(chat => chat.chat_id); 
    console.log("Retrive chat IDs:");
    return chatIdList;
}


module.exports = {
    add_chat,
    get_total_chats
};



