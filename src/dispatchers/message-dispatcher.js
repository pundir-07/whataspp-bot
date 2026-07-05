const MESSAGE_TYPES = require("../constants/message-types");

const textHandler = require("../handlers/text.handler");
const imageHandler = require("../handlers/image.handler");
const audioHandler = require("../handlers/audio.handler");

const handlers = {
    [MESSAGE_TYPES.TEXT]: textHandler,
    [MESSAGE_TYPES.IMAGE]: imageHandler,
    [MESSAGE_TYPES.AUDIO]: audioHandler,
};

module.exports = async function dispatch(message) {
    const handler = handlers[message.type];

    if (!handler) {
        console.log(`Unsupported message type: ${message.type}`);
        return;
    }

    await handler(message);
};