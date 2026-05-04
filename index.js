const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Standard dev logging

// Custom middleware to log request body
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('--- Incoming Request ---');
    console.log('Path:', req.path);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('-------------------------');
  }
  next();
});

const PORT = process.env.PORT || 5000;
const DO_AGENT_KEY = process.env.DO_AGENT_KEY;

// Mapping of categories to Agent configuration
const agentMapping = {
  'GENERAL': { url: process.env.GENERAL_AGENT_URL, key: process.env.GENERAL_AGENT_KEY },
  'PORT-REGULATIONS': { url: process.env.PORT_AGENT_URL, key: process.env.PORT_AGENT_KEY },
  'CARGO': { url: process.env.CARGO_AGENT_URL, key: process.env.CARGO_AGENT_KEY },
  'LCL': { url: process.env.LCL_AGENT_URL, key: process.env.LCL_AGENT_KEY },
  'FCL': { url: process.env.FCL_AGENT_URL, key: process.env.FCL_AGENT_KEY },
};

/**
 * Step 1: Use the Router Model (Lightweight LLM) to determine the category
 */
async function getTargetAgent(allMessages) {
  try {
    // Get last 3 messages for context
    const contextMessages = allMessages.slice(-3);
    const lastInput = contextMessages[contextMessages.length - 1].content;
    
    console.log('Routing based on context:', lastInput);
    
    const routerPrompt = `
      Analyze the conversation history and categorize the LATEST user input into exactly one of these categories:
      - GENERAL: Star Concord services, general company queries, or anything else.
      - PORT-REGULATIONS: Questions about port regulations.
      - CARGO: Cargo tracking or shipment status.
      - LCL: Less than Container Load (LCL) or LCL local handling charges.
      - FCL: Full Container Load (FCL) or FCL local handling charges.

      Response must be ONLY the category name (e.g., GENERAL).
      
      Conversation Context (Last 3 messages):
      ${contextMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
    `;

    const response = await axios.post(process.env.ROUTER_MODEL_URL, {
      model: process.env.ROUTER_MODEL_NAME,
      messages: [{ role: 'user', content: routerPrompt }],
      max_tokens: 100,
      stream: false,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ROUTER_MODEL_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const category = response.data.choices[0].message.content.trim().toUpperCase().replace(/[^A-Z-]/g, '');
    console.log('Determined category:', category);

    // Return the mapped config or fallback to General
    return agentMapping[category] || agentMapping['GENERAL'];
  } catch (error) {
    console.error('Routing Error:', error.message);
    return agentMapping['GENERAL']; // Fallback
  }
}

/**
 * Main Chat Endpoint
 */
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    // 1. Determine which agent to use based on context
    const targetAgent = await getTargetAgent(messages);
    console.log('Invoking Agent:', targetAgent.url);

    // 2. Invoke the selected agent with its specific key
    const response = await axios.post(`${targetAgent.url}/api/v1/chat/completions`, {
      messages: messages,
      stream: false,
    }, {
      headers: {
        'Authorization': `Bearer ${targetAgent.key}`,
        'Content-Type': 'application/json'
      }
    });

    // 3. Return the AI response to the frontend
    const botText = response.data.choices[0].message.content;
    console.log('Agent Response:', botText);
    console.log('-------------------------');

    res.json(response.data);
  } catch (error) {
    console.error('Chat Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot Backend Router running on http://localhost:${PORT}`);
});
