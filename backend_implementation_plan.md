# Chatbot Backend Router Implementation Plan

Goal: Create a Node.js backend that routes user queries to the appropriate DigitalOcean Agent.

## 1. Project Setup
- Directory: `d:\codemill\projects\chatbot-backend`
- Initialize `npm` and install:
  - `express`: Web framework.
  - `axios`: For API requests to DigitalOcean.
  - `cors`: To allow frontend requests.
  - `dotenv`: For secret management.

## 2. Router Logic
- **Agent Registry**: A configuration object mapping intents/categories to DigitalOcean Agent IDs.
- **Router Agent**: A specialized DigitalOcean Agent (or a direct LLM call) that takes user input and returns the "Category" or "Agent ID".
- **Execution Flow**:
  1. Frontend -> Backend `/chat`
  2. Backend -> Router LLM (Decide which Agent ID to use)
  3. Backend -> Selected DO Agent (Get response)
  4. Backend -> Frontend (Return response)

## 3. API Endpoints
- `POST /api/chat`: Main endpoint for the chatbot interface.

## 4. Configuration
- `.env` file for:
  - `ROUTER_AGENT_URL`
  - `DO_AGENT_KEY`
  - Agent IDs for different domains.
