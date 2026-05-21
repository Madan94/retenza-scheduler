const axios = require("axios");

/**
 * Telegram accepts numeric chat_id or @username (channels/public groups,
 * or users who have started your bot).
 */
function normalizeTelegramChatId(recipient) {
  const trimmed = recipient.trim();

  if (/^-?\d+$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

async function sendTelegramMessage(botToken, recipient, text) {
  const chatId = normalizeTelegramChatId(recipient);

  const response = await axios.post(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      chat_id: chatId,
      text,
    }
  );

  return response.data;
}

module.exports = {
  normalizeTelegramChatId,
  sendTelegramMessage,
};
