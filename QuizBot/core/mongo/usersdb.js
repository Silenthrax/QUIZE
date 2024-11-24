const { MongoClient, ObjectId } = require("mongodb");
const { MONGO_DB } = require("../../../config");

const client = new MongoClient(MONGO_DB);

const db = client.db("QuizBot");
const users = db.collection("users");

async function add_user(user) {
    try {
        if (typeof user.user_id !== "string" && typeof user.user_id !== "number") {
            console.error("Invalid user.user_id format. Must be a string or number.");
            return null;
        }

        const existingUser = await users.findOne({ user_id: user.user_id });
        if (existingUser) {
            console.log("User already exists. Skipping insertion.");
            return null;
        }

        const userWithId = {
            user_id: user.user_id.toString(),
            ...user,
        };

        const result = await users.insertOne(userWithId);
        console.log("User added successfully:", result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error("Error adding user:", error);
        throw error;
    }
}

async function get_all_users() {
    try {
        const allUsers = await users.find({}).toArray();
        console.log("Users retrieved successfully:", allUsers.length);
        return allUsers;
    } catch (error) {
        console.error("Error retrieving users:", error);
        throw error;
    }
}

async function remove_user(user_id) {
    try {
        const result = await users.deleteOne({ user_id: user_id });
        if (result.deletedCount === 1) {
            console.log("User removed successfully");
            return true;
        } else {
            console.log("No user found with the specified user_id");
            return false;
        }
    } catch (error) {
        console.error("Error removing user:", error);
        throw error;
    }
}

module.exports = {
    add_user,
    get_all_users,
    remove_user,
};



