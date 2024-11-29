const { Markup } = require("telegraf");
const bot = require("../index");
const { OWNER_ID } = require("../../config");
const { get_total_users } = require("../core/mongo/usersdb");
const { get_total_chats } = require("../core/mongo/chatsdb");

async function sendBroadcastMessage(ctx, message, users, chats) {
  let doneUsers = 0, failedUsers = 0, doneChats = 0, failedChats = 0;

  for (const user of users) {
    try {
      await ctx.telegram.sendMessage(user, message);
      doneUsers++;
    } catch (error) {
      failedUsers++;
      console.error(`Failed to send message to user ${user}:`, error);
    }
  }

  for (const chat of chats) {
    try {
      await ctx.telegram.sendMessage(chat, message);
      doneChats++;
    } catch (error) {
      failedChats++;
      console.error(`Failed to send message to chat ${chat}:`, error);
    }
  }

  return `
Broadcast Summary:
-------------------
✅ Done Users: ${doneUsers}
❌ Failed Users: ${failedUsers}
✅ Done Chats: ${doneChats}
❌ Failed Chats: ${failedChats}
  `;
}

async function forwardMessage(ctx, messageId, users, chats) {
  let doneUsers = 0, failedUsers = 0, doneChats = 0, failedChats = 0;

  for (const user of users) {
    try {
      await ctx.telegram.forwardMessage(user, ctx.chat.id, messageId);
      doneUsers++;
    } catch (error) {
      failedUsers++;
      console.error(`Failed to forward message to user ${user}:`, error);
    }
  }

  for (const chat of chats) {
    try {
      await ctx.telegram.forwardMessage(chat, ctx.chat.id, messageId);
      doneChats++;
    } catch (error) {
      failedChats++;
      console.error(`Failed to forward message to chat ${chat}:`, error);
    }
  }

  return `
Forward Message Summary:
-------------------------
✅ Done Users: ${doneUsers}
❌ Failed Users: ${failedUsers}
✅ Done Chats: ${doneChats}
❌ Failed Chats: ${failedChats}
  `;
}



bot.command("broadcast", async (ctx) => {
  try {
    if (!OWNER_ID.includes(ctx.message.from.id)) {
      return ctx.reply("This is an owner-only command.");
    }

    const replyMessage = ctx.message.reply_to_message;
    const args = ctx.message.text.split(" ").slice(1).join(" ");

    if (!replyMessage && !args) {
      return ctx.reply("Please reply to a message or provide a message to broadcast.\nUsage: /broadcast <message>");
    }

    const message = replyMessage ? (replyMessage.text || replyMessage.caption) : args;
    const sanitizedMessage = message.slice(0, 64);

    // Debug log
    console.log("Message to broadcast:", sanitizedMessage);

    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback("📢 Broadcast", `action_broadcast:${sanitizedMessage}`)],
      [Markup.button.callback("🔄 Forward", `action_forward:${replyMessage ? replyMessage.message_id : ''}`)],
    ]);

    return ctx.reply("Choose an action for the message:", {
      reply_to_message_id: ctx.message.message_id,
      reply_markup: buttons,
    });

  } catch (error) {
    console.error("Error in /broadcast command:", error);
    return ctx.reply("An error occurred while processing the broadcast. Please try again later.");
  }
});



bot.action(/action_broadcast:(.+)/, async (ctx) => {
  try {
    const message = ctx.match[1];
    const users = await get_total_users();
    const chats = await get_total_chats();

    const summary = await sendBroadcastMessage(ctx, message, users, chats);
    await ctx.reply(summary);
    await ctx.answerCbQuery("Broadcast executed successfully!");
  } catch (error) {
    console.error("Error in action_broadcast:", error);
    await ctx.answerCbQuery("Failed to execute broadcast.");
  }
});

bot.action(/action_forward:(.*)/, async (ctx) => {
  try {
    const messageId = ctx.match[1];
    if (!messageId) {
      return ctx.answerCbQuery("Please reply to a message to forward.");
    }

    const users = await get_total_users();
    const chats = await get_total_chats();

    const summary = await forwardMessage(ctx, messageId, users, chats);
    await ctx.reply(summary);
    await ctx.answerCbQuery("Forward executed successfully!");
  } catch (error) {
    console.error("Error in action_forward:", error);
    await ctx.answerCbQuery("Failed to execute forward.");
  }
});



