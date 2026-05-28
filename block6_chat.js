let chatReady = false;

function toggleChat() {
  const chatPanel = document.getElementById('chat-panel');
  const chatToggle = document.getElementById('chat-toggle');

  if (!chatPanel || !chatToggle) return;

  if (window.innerWidth < 768) {
    chatPanel.classList.toggle('mobile-open');
  } else {
    chatPanel.classList.toggle('hidden');
    chatToggle.classList.toggle('active');
  }
}

function startChat() {
  const input = document.getElementById('api-key-input');
  const key = input ? input.value.trim() : '';

  if (!key.startsWith('sk-')) {
    alert(state.lang === 'ar' ? 'يرجى إدخال مفتاح API صحيح يبدأ بـ sk-' : 'Please enter a valid API key starting with sk-');
    return;
  }

  state.apiKey = key;
  saveState();

  const apiSetup = document.getElementById('api-setup');
  if (apiSetup) apiSetup.classList.add('hidden');

  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.disabled = false;

  chatReady = true;

  const welcomeMsg = state.lang === 'ar' 
    ? 'أهلاً بك! أنا كلود، مساعدك الذكي في هذه الدورة. كيف يمكنني مساعدتك اليوم؟' 
    : "Hello! I'm Claude, your AI assistant for this course. How can I help you today?";
  
  addMsg('assistant', welcomeMsg);
}

function addMsg(role, text) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `msg ${role} fade-up`;

  // Basic Markdown-lite handling
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  msgDiv.innerHTML = formattedText;
  chatMessages.appendChild(msgDiv);

  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: 'smooth'
  });
}

function addTyping() {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return null;

  const typingDiv = document.createElement('div');
  typingDiv.className = 'msg assistant typing-indicator';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
  
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: 'smooth'
  });

  return typingDiv;
}

async function sendMsg() {
  if (!chatReady) return;

  const input = document.getElementById('chat-input');
  const text = input ? input.value.trim() : '';
  const sendBtn = document.getElementById('send-btn');

  if (!text) return;

  input.value = '';
  addMsg('user', text);
  state.chatHistory.push({ role: 'user', content: text });

  const typingIndicator = addTyping();
  if (sendBtn) sendBtn.disabled = true;

  const systemPrompt = state.lang === 'ar'
    ? "أنت كلود، مساعد ذكاء اصطناعي متكامل مدمج في دورة إتقان الذكاء الاصطناعي. ساعد المستخدم في أي شيء — أسئلة الدورة، التمارين، أسئلة الحياة، نصائح الأعمال، أو أي موضوع. كن مباشراً وصادقاً ومفيداً حقاً. عندما يكون ذلك مناسباً، اربط إجاباتك بما يتعلمونه في الدورة."
    : "You are Claude, a full AI assistant embedded inside the AI Mastery course. Help the user with anything — course questions, exercises, life questions, business advice, or any topic. Be direct, honest, and genuinely helpful. When relevant, connect your answers to what they are learning in the course.";

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': state.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620', // Using the latest available stable model
        max_tokens: 1000,
        system: systemPrompt,
        messages: state.chatHistory.slice(-20).map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await response.json();

    if (typingIndicator) typingIndicator.remove();

    if (data.content && data.content[0] && data.content[0].text) {
      const reply = data.content[0].text;
      addMsg('assistant', reply);
      state.chatHistory.push({ role: 'assistant', content: reply });
    } else {
      throw new Error(data.error?.message || 'Unknown error');
    }

  } catch (error) {
    if (typingIndicator) typingIndicator.remove();
    const errorMsg = state.lang === 'ar' 
      ? 'عذراً، حدث خطأ أثناء الاتصال بكلود. يرجى التحقق من مفتاح الـ API الخاص بك.' 
      : 'Sorry, an error occurred while connecting to Claude. Please check your API key.';
    addMsg('system', errorMsg);
    console.error('Chat Error:', error);
  }

  state.chatHistory = state.chatHistory.slice(-40);
  if (sendBtn) sendBtn.disabled = false;
  saveState();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
}

// Expose to window scope
window.toggleChat = toggleChat;
window.startChat = startChat;
window.addMsg = addMsg;
window.addTyping = addTyping;
window.sendMsg = sendMsg;
window.handleKey = handleKey;
window.chatReady = chatReady;
