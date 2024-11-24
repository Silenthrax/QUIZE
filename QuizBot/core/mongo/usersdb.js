const { MongoClient, ObjectId } = require("mongodb");
const { MONGO_DB } = require("../../../config");

const client = new MongoClient(MONGO_DB);

const db = client.db("QuizBot");
const users = db.collection("users");

async function add_user(user) {
    try {
        if (typeof user._id !== "string" && typeof user._id !== "number") {
            console.error("Invalid user._id format. Must be a string or number.");
            return null;
        }

        const existingUser = await users.findOne({ _id: user._id });
        if (existingUser) {
            console.log("User already exists. Skipping insertion.");
            return null;
        }

        const userWithId = {
            _id: user._id.toString(),
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

async function remove_user(userId) {
    try {
        const result = await users.deleteOne({ _id: userId });
        if (result.deletedCount === 1) {
            console.log("User removed successfully");
            return true;
        } else {
            console.log("No user found with the specified ID");
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


