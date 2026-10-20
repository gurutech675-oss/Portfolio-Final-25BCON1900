const chatInput = document.getElementById("userInput");
const chatButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");
const chatStatus = document.getElementById("chatStatus");

const portfolioContext = `
Portfolio owner: Rohit Raj.
Education: B.Tech Computer Science and Engineering student at JECRC University, Jaipur, specialising in Full Stack and Web Development.
Skills: HTML, CSS, JavaScript, Python, Git, GitHub, API integration, and basic Node.js.
Projects:
1. Python Programs Collection: Python practice including Fibonacci and structure-related exercises. Repositories: https://github.com/rajrohit5783-cmyk/python-basics2-25BCON1900 and https://github.com/rajrohit5783-cmyk/python-basics3-25BCON1900
2. Messy Python Code Improvement: A course exercise focused on improving Python code with AI assistance. Repository reference: https://github.com/rajrohit5783-cmyk/python-basics3-25BCON1900
3. Bug Fixing Using Cursor AI: Student utilities for average marks, pass status, and grades, with debugging/testing practice. Repository: https://github.com/gurutech675-oss/Buggy_python_script-25BCON1900
4. Interactive Quiz Application: Repository https://github.com/gurutech675-oss/Quiz-25BCON1900
5. Book Reading List Application: Repository https://github.com/gurutech675-oss/reading_list-25BCON1900- and live app https://reading-list-woad.vercel.app/
Portfolio: https://portfolio-six-sand-48.vercel.app/
GitHub profile: https://github.com/gurutech675-oss
The website also has a city-based weather widget.
`;

function showChatMessage(role, text) {
  const message = document.createElement("div");
  message.className = `chat-message ${role === "user" ? "chat-user" : "chat-assistant"}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
  const question = chatInput.value.trim();
  if (!question || chatButton.disabled) return;

  showChatMessage("user", question);
  chatInput.value = "";
  chatButton.disabled = true;
  chatStatus.textContent = "AI is thinking...";

  try {
    // The API key stays on the server; the browser calls the same-origin endpoint.
    const response = await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, context: portfolioContext })
    });

    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (!response.ok) throw new Error("API_ERROR");

    const data = await response.json();
    if (typeof data.answer !== "string" || !data.answer.trim()) {
      throw new Error("INVALID_RESPONSE");
    }
    showChatMessage("assistant", data.answer.trim());
    chatStatus.textContent = "";
  } catch (error) {
    console.error("Chat error:", error);
    if (error.message === "RATE_LIMIT") {
      showChatMessage("assistant", "Too many requests. Please wait and try again.");
    } else if (!navigator.onLine) {
      showChatMessage("assistant", "No internet connection. Please reconnect.");
    } else {
      showChatMessage("assistant", "AI service unavailable. Please try again.");
    }
    chatStatus.textContent = "";
  } finally {
    chatButton.disabled = false;
  }
}

if (typeof CONFIG === "undefined" || !CONFIG.endpoint) {
  chatButton.disabled = true;
  chatStatus.textContent = "Chatbot endpoint is not configured.";
} else {
  chatButton.addEventListener("click", sendChatMessage);
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendChatMessage();
  });
}
