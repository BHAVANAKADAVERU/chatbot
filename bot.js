const restify = require('restify');
const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cors = require('cors');  // Add this line

// Load environment variables from .env file
dotenv.config();

// Construct the correct path to the JSON file
const jsonFilePath = path.join(__dirname, 'constitution_of_india.json');

// Initialize variables for bot and QA data
let qaData = [];

// Load queries and answers from JSON file, with error handling
try {
    qaData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
} catch (err) {
    console.error(`Error loading JSON file: ${err}`);
    process.exit(1); // Exit the process if file loading fails
}

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(cors());  // Add this line
server.listen(process.env.PORT || 3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create Bot Framework Adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId || '',
    appPassword: process.env.MicrosoftAppPassword || ''
});

// Create conversation state with in-memory storage
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

// Error handler for unhandled exceptions in bot's logic
adapter.onTurnError = async (context, error) => {
    console.error(`[onTurnError]: ${error}`);
    await context.sendActivity(`Oops. Something went wrong!`);
    await conversationState.delete(context); // Optionally reset conversation state
};

// Endpoint to handle incoming messages from Bot Framework Emulator or other channels
server.post('/api/messages', async (req, res) => {
    try {
        await adapter.processActivity(req, res, async (context) => {
            console.log(`Incoming activity: ${JSON.stringify(context.activity, null, 2)}`); // Log incoming activity
            if (!context.activity.serviceUrl) {
                throw new Error('Missing serviceUrl in activity');
            }
            await bot.run(context);
        });
    } catch (err) {
        console.error(`[server.post] Error: ${err.toString()}`);
        res.status(500);
        res.end();
    }
});

// Bot logic to handle user messages
const bot = {
    async run(context) {
        if (context.activity.type === 'message') {
            const userQuery = context.activity.text.toLowerCase();
            const matchedItem = qaData.find(item => item.title.toLowerCase() === userQuery);

            if (matchedItem) {
                await context.sendActivity(matchedItem.description);
            } else {
                await context.sendActivity("I'm sorry, I don't understand. Please ask a question related to the Constitution of India.");
            }
        } else {
            await context.sendActivity(`Activity type ${context.activity.type} is not supported.`);
        }
    }
};
