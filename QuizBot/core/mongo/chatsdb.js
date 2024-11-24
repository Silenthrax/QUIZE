const { MongoClient } = require("mongodb");
const { MONGO_DB } = require("../../../config");

const client = new MongoClient(MONGO_DB);

const db = client.db("QuizBot");
const chats = db.collection("chats");



async function add_chat(chat) {
    try {
        const existingChat = await chats.findOne({ _id: chat._id });
        if (existingChat) {
            console.log("Chat already exists. Skipping insertion.");
            return null;
        }

        const result = await chats.insertOne(chat);
        console.log("Chat added successfully:", result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error("Error adding chat:", error);
        throw error;
    }
}

async function get_all_chats() {
    try {
        const allChats = await chats.find({}).toArray();
        console.log("Chats retrieved successfully:", allChats.length);
        return allChats;
    } catch (error) {
        console.error("Error retrieving chats:", error);
        throw error;
    }
}

async function remove_chat(chatId) {
    try {
        const result = await chats.deleteOne({ _id: chatId });
        if (result.deletedCount === 1) {
            console.log("Chat removed successfully");
            return true;
        } else {
            console.log("No chat found with the specified ID");
            return false;
        }
    } catch (error) {
        console.error("Error removing chat:", error);
        throw error;
    }
}

module.exports = {
    add_chat,
    get_all_chats,
    remove_chat,
};



