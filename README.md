# MindBridge: Unified AI Orchestration Hub

**MindBridge** is a high-performance **Model Context Protocol (MCP)** server designed to unify the fragmented AI landscape. It provides a universal orchestration layer that connects major LLM providers—including **OpenAI**, **Anthropic**, **Google**, and **DeepSeek**—alongside local models like **Ollama** into a single, OpenAI-compatible workspace. By acting as a universal translator, it eliminates vendor lock-in, allowing developers to switch between cloud-based reasoning engines and privacy-focused local models with zero code changes.

---

## 🏗️ Software Architecture

MindBridge is built with a **modular, provider-agnostic architecture** to ensure maximum flexibility and scalability.

### 1. **High-Level System Design**
The system follows a **Proxy-Adapter Pattern**, where a centralized gateway receives requests and intelligently routes them to specialized model adapters.

*   **API Gateway (Express.js/TypeScript):** Acts as the entry point, mimicking the OpenAI API schema to ensure "drop-in" compatibility for existing applications.
*   **Orchestration Layer:** Handles request routing, logic for "Second Opinions," and cross-model consensus.
*   **Provider Adapters:** Individual modules that normalize diverse API response formats (streaming headers, error codes, and payload structures) into a unified standard.
*   **Persistent Storage (Appwrite):** A centralized backend for managing user authentication, profiles, and session data.

### 2. **Key Architectural Components**

| Component | Responsibility | Technology |
| :--- | :--- | :--- |
| **Unified API Layer** | Normalizes multiple LLM endpoints into one OpenAI-compatible interface. | Express.js / TypeScript |
| **MCP Server** | Implements the Model Context Protocol for standardized tool-to-model communication. | MCP / Node.js |
| **AI Router** | Intelligently selects the best model (e.g., GPT-4o for speed, Claude for reasoning). | TypeScript Logic |
| **Frontend Dashboard** | Provides a real-time playground for model comparison and orchestration. | Next.js / Tailwind CSS |
| **Data Engine** | Manages user state, session persistence, and security. | Appwrite |

---

## 🚀 Core Features

*   **Multi-LLM Support:** Instantly switch between cloud providers (OpenAI, Anthropic, Google, DeepSeek) and local instances (Ollama).
*   **Intelligent Routing:** Automatically direct queries to specialist models based on task complexity (e.g., routing math tasks to reasoning-heavy models).
*   **getSecondOpinion Tool:** Cross-validate AI outputs by asking the same question to multiple models simultaneously and comparing responses side-by-side.
*   **OpenAI Compatibility:** Works with any existing tool or agent framework that expects standard OpenAI endpoints.

---

## 🔧 Installation & Setup

### Prerequisites
*   **Node.js** (v18+)
*   **npm** or **yarn**
*   **Ollama** (for local model support)

### Step-by-Step
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/tansri011-max/mindbridge
    cd mindbridge
    ```
2.  **Install Dependencies:**
    ```bash
    # For backend
    cd backend && npm install
    # For frontend
    cd ../frontend && npm install
    ```
3.  **Environment Configuration:**
    Create a `.env` file in the root directory and add your API keys:
    ```env
    OPENAI_API_KEY=your_key
    ANTHROPIC_API_KEY=your_key
    GOOGLE_API_KEY=your_key
    OLLAMA_BASE_URL=http://localhost:11434
    APPWRITE_ENDPOINT=your_endpoint
    APPWRITE_PROJECT_ID=your_id
    ```
4.  **Run the Application:**
    
```bash
    # Start Backend
    npm run dev:server
    # Start Frontend
    npm run dev:client
    ```

---

## 🛡️ License
This project is licensed under the **MIT License**.
```
