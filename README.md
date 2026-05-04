# Chatbot Backend Router

This is a Node.js-based routing server that acts as a gateway for the Star Concord Chatbot. it uses a high-performance LLM (openai-gpt-oss-20b) to analyze user intent and route queries to the most appropriate specialized Star Concord agent.

## 🚀 Features

- **Intelligent Routing**: Uses `openai-gpt-oss-20b` to categorize queries into:
  - `GENERAL`: General Star Concord services.
  - `PORT-REGULATIONS`: Port-specific queries.
  - `CARGO`: Cargo tracking and status.
  - `LCL`: Less than Container Load inquiries.
  - `FCL`: Full Container Load inquiries.
- **Context-Aware**: Sends the last 3 messages to the router for better intent detection.
- **Multi-Agent Support**: Securely manages multiple DigitalOcean Agent keys on the server side.
- **Detailed Logging**: Built-in request and response logging for debugging.

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configuration**:
   Create a `.env` file with the following variables:
   ```env
   PORT=5000
   DO_AGENT_KEY=your_global_agent_key
   ROUTER_MODEL_URL=https://inference.do-ai.run/v1/chat/completions
   ROUTER_MODEL_KEY=your_model_access_key
   ROUTER_MODEL_NAME=openai-gpt-oss-20b

   # Star Concord Specialized Agents
   GENERAL_AGENT_URL=...
   GENERAL_AGENT_KEY=...
   PORT_AGENT_URL=...
   PORT_AGENT_KEY=...
   CARGO_AGENT_URL=...
   CARGO_AGENT_KEY=...
   LCL_AGENT_URL=...
   LCL_AGENT_KEY=...
   FCL_AGENT_URL=...
   FCL_AGENT_KEY=...
   ```

3. **Run the Server**:
   ```bash
   node index.js
   ```

## 📦 Deployment

### DigitalOcean App Platform
1. Create a new "Web Service" in DigitalOcean.
2. Link your repository.
3. Set the environment variables in the DO console.
4. Set the run command to `node index.js`.
