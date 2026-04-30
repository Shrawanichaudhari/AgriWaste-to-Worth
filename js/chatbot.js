// AgriWaste Chatbot - Intelligent Agriculture Assistant
// ======================================================

const KB = {
  greet: {
    patterns: ['hello','hi','hey','namaste','good morning','good evening','good afternoon','howdy'],
    response: () => `Hello! 👋 I'm <strong>AgriBot</strong> — your AI agriculture assistant.<br>I can help you with:<br>
    • Crop waste identification & pricing<br>
    • Waste repurposing suggestions<br>
    • Market trends & seasonal advice<br>
    • Government schemes & subsidies<br>
    • Soil & composting tips<br><br>
    What would you like to know today?`
  },
  goodbye: {
    patterns: ['bye','goodbye','see you','take care','thanks bye','ok bye'],
    response: () => `Goodbye! 🌿 Come back anytime you need agriculture advice. Happy farming!`
  },
  rice: {
    patterns: ['rice husk','rice straw','paddy husk','paddy straw','paddy waste','rice waste','rice residue'],
    response: () => `🌾 <strong>Rice Waste Information</strong><br><br>
    <strong>Rice Husk:</strong><br>
    • Current price: ₹5,000–6,000/ton<br>
    • Uses: Biomass energy, silica extraction, insulation boards<br>
    • Calorific value: 14–16 MJ/kg<br>
    • Moisture: 10–12%<br><br>
    <strong>Rice Straw:</strong><br>
    • Current price: ₹3,500–4,500/ton<br>
    • Uses: Biogas, animal feed, mushroom cultivation, paper<br>
    • Best season to sell: Oct–Dec (post kharif harvest)<br><br>
    💡 <em>Tip: Avoid burning! It causes severe air pollution and loses ₹8,000+ worth of biomass per acre.</em>`
  },
  wheat: {
    patterns: ['wheat straw','wheat waste','wheat residue','gehun','wheat chaff'],
    response: () => `🌾 <strong>Wheat Waste Information</strong><br><br>
    • Price range: ₹3,600–4,800/ton<br>
    • Best selling window: <strong>April–June</strong> (post rabi harvest)<br>
    • Calorific value: 15–17 MJ/kg<br>
    • Top buyers: Biomass power plants, cardboard mills, animal feed companies<br><br>
    <strong>Repurposing options:</strong><br>
    1. Biogas production (400–600 L biogas per kg)<br>
    2. Mushroom cultivation substrate<br>
    3. Handmade paper & packaging material<br>
    4. Compost (C:N ratio 80:1, add nitrogen sources)<br><br>
    💡 <em>Punjab & Haryana have highest demand — consider bulk selling to avoid transport costs.</em>`
  },
  sugarcane: {
    patterns: ['sugarcane','bagasse','cane waste','ganna','sugarcane trash','sugarcane residue'],
    response: () => `🍬 <strong>Sugarcane Waste Information</strong><br><br>
    <strong>Bagasse (after juice extraction):</strong><br>
    • Price: ₹3,200–4,400/ton<br>
    • Moisture: 40–50% (reduces value)<br>
    • Primary use: Co-generation in sugar mills<br>
    • Also used for: Paper, particleboard, biocomposites<br><br>
    <strong>Sugarcane Trash (leaves & tops):</strong><br>
    • Price: ₹2,000–3,000/ton<br>
    • Biogas potential: 350–450 L/kg<br>
    • Mulching: Saves 30–40% irrigation water<br><br>
    📍 <em>Maharashtra, UP & Karnataka are major markets. Approach local sugar mills directly for best rates.</em>`
  },
  cotton: {
    patterns: ['cotton stalk','cotton waste','cotton residue','kapas','cotton gin'],
    response: () => `🌸 <strong>Cotton Waste Information</strong><br><br>
    • Price: ₹2,000–3,000/ton<br>
    • Calorific value: 16–18 MJ/kg (high!)<br>
    • Challenge: Hard, woody stalks require shredding<br><br>
    <strong>Repurposing uses:</strong><br>
    1. Briquette/pellet production<br>
    2. Particleboard for furniture<br>
    3. Biochar (soil amendment)<br>
    4. Activated carbon production<br><br>
    ⚠️ <em>Stalks should be removed before next planting — they harbor pink bollworm. Sell or shred immediately.</em>`
  },
  corn: {
    patterns: ['corn stover','maize waste','maize stalk','corn residue','makka','maize residue'],
    response: () => `🌽 <strong>Corn/Maize Waste Information</strong><br><br>
    • Price: ₹2,800–3,600/ton<br>
    • Components: Stalks, leaves, cobs, husks<br>
    • Calorific value: 16–18 MJ/kg<br><br>
    <strong>Best uses:</strong><br>
    1. Animal fodder (silage) — highest value use<br>
    2. Biogas production<br>
    3. Ethanol feedstock<br>
    4. Mushroom growing substrate (cobs)<br>
    5. Compost<br><br>
    💡 <em>Corn cobs have 10× more value than stalks for mushroom cultivation. Separate and sell cobs separately for ₹6,000–8,000/ton.</em>`
  },
  compost: {
    patterns: ['compost','composting','vermicompost','organic manure','fertilizer','fertiliser','manure'],
    response: () => `♻️ <strong>Composting Guide</strong><br><br>
    <strong>Basic Composting:</strong><br>
    • Mix: 30 parts carbon (dry straw) : 1 part nitrogen (manure/food waste)<br>
    • Moisture: 40–60%, like a wrung sponge<br>
    • Turn pile every 7–10 days<br>
    • Ready in: 60–90 days<br><br>
    <strong>Vermicomposting:</strong><br>
    • Uses Eisenia fetida (red wigglers)<br>
    • Ready in 45–60 days<br>
    • Sells for ₹8,000–15,000/ton (high value!)<br><br>
    🏛️ <em>RKVY scheme offers 50% subsidy on vermicomposting units. Apply through your state agriculture department.</em>`
  },
  biogas: {
    patterns: ['biogas','gobar gas','methane','anaerobic','digester','bio-gas'],
    response: () => `⚡ <strong>Biogas Production Guide</strong><br><br>
    <strong>Biogas yields (per ton of waste):</strong><br>
    • Cattle dung: 40–60 m³<br>
    • Rice straw: 170–200 m³<br>
    • Sugarcane bagasse: 140–160 m³<br>
    • Corn stover: 180–220 m³<br><br>
    <strong>Biogas value:</strong><br>
    • 1 m³ biogas ≈ 0.6 L diesel equivalent<br>
    • Can power a household for cooking + lighting<br>
    • Digestate (slurry) is excellent organic fertilizer<br><br>
    💰 <em>MNRE provides subsidy of ₹10,000–16,000 per biogas plant. Apply online at mnre.gov.in.</em>`
  },
  price: {
    patterns: ['price','rate','cost','market rate','current price','how much','value','worth','msp'],
    response: () => `💰 <strong>Current Market Prices (Apr 2025)</strong><br><br>
    | Waste Type | Price Range |<br>
    |-----------|------------|<br>
    | Rice Husk | ₹5,000–6,200/ton |<br>
    | Wheat Straw | ₹3,600–4,800/ton |<br>
    | Sugarcane Bagasse | ₹3,200–4,400/ton |<br>
    | Cotton Stalks | ₹2,000–3,000/ton |<br>
    | Corn Stover | ₹2,800–3,600/ton |<br>
    | Coconut Coir | ₹5,500–7,000/ton |<br>
    | Banana Fiber | ₹6,000–8,000/ton |<br><br>
    📈 <em>Prices are 8–12% higher during Oct–Feb due to biomass power plant demand. Plan your sales accordingly!</em>`
  },
  subsidy: {
    patterns: ['subsidy','scheme','government scheme','rkvy','pmksy','pmfby','loan','grant','pm kisan','support'],
    response: () => `🏛️ <strong>Government Schemes for Agricultural Waste</strong><br><br>
    <strong>1. PUSA Decomposer (Free)</strong><br>
    → Converts paddy stubble to compost in 25 days<br>
    → Available from ICAR-PUSA, Delhi<br><br>
    <strong>2. SMAM — Sub-Mission on Agricultural Mechanisation</strong><br>
    → 50–80% subsidy on crop residue management machines<br>
    → Apply: agrimachinery.nic.in<br><br>
    <strong>3. RKVY Biomass Units</strong><br>
    → Grant for biomass briquetting/pelletizing units<br>
    → Up to ₹50 lakhs per project<br><br>
    <strong>4. MNRE Biogas Subsidy</strong><br>
    → ₹10,000–16,000 per biogas plant<br>
    → mnre.gov.in<br><br>
    <strong>5. PM KUSUM (Solar Pumps)</strong><br>
    → 60% subsidy on solar irrigation<br>
    → Saves fuel cost + earns from selling excess power`
  },
  soil: {
    patterns: ['soil health','soil quality','soil test','soil carbon','organic matter','ph','soil improvement'],
    response: () => `🌱 <strong>Soil Health Tips</strong><br><br>
    <strong>Why return some waste to soil?</strong><br>
    • 30% of residue should be returned as mulch<br>
    • Improves soil organic matter by 0.1–0.3% annually<br>
    • Saves 20–30% irrigation cost<br><br>
    <strong>Soil Testing:</strong><br>
    • Get free/subsidized test at Krishi Vigyan Kendra (KVK)<br>
    • Test for: N, P, K, pH, micronutrients<br>
    • Soil Health Card available at soilhealth.dac.gov.in<br><br>
    <strong>Quick pH fixes:</strong><br>
    • Acidic soil (pH <6): Add lime @ 2–4 tons/ha<br>
    • Alkaline soil (pH >8): Add gypsum + sulphur`
  },
  burning: {
    patterns: ['burning','stubble burning','parali','fire','smoke','pollution','air quality'],
    response: () => `🔥 <strong>Why NOT to Burn Crop Residue</strong><br><br>
    <strong>Environmental damage:</strong><br>
    • 1 acre of burning = 3 tons CO₂ released<br>
    • Kills 10 lakh soil microorganisms per gram of soil<br>
    • Destroys top 2cm of nutrient-rich topsoil<br><br>
    <strong>Financial loss:</strong><br>
    • Rice straw worth ₹15,000–20,000/acre is lost!<br>
    • Fine of ₹2,500–15,000 under Air Act 1981<br><br>
    <strong>Better alternatives:</strong><br>
    1. Sell through AgriWaste marketplace 💰<br>
    2. Use PUSA decomposer (free spray)<br>
    3. Happy Seeder machine (sow wheat directly through stubble)<br>
    4. In-situ composting with Trichoderma<br><br>
    📞 <em>Call 1551/1800-180-1551 (Kisan Call Centre) for free guidance.</em>`
  },
  transport: {
    patterns: ['transport','logistics','delivery','shipping','freight','vehicle','pickup','collection'],
    response: () => `🚛 <strong>Logistics & Transport Guide</strong><br><br>
    <strong>For small volumes (< 5 tons):</strong><br>
    • Local tractor trolley: ₹500–800/trip<br>
    • Negotiate with nearest agro processing unit<br><br>
    <strong>For large volumes (> 10 tons):</strong><br>
    • Contact biomass aggregators (listed in our Marketplace)<br>
    • FCI godown transport networks (if available)<br>
    • Chiller/reefer not needed for dry biomass<br><br>
    <strong>Tips to reduce cost:</strong><br>
    • Bale or bale-wrap straw (reduces volume 3–5x)<br>
    • Pelletize before transport (10x density increase)<br>
    • Coordinate with neighboring farmers for bulk transport<br><br>
    💡 <em>Use our Marketplace to find buyers willing to arrange pickup directly from your farm!</em>`
  },
  mushroom: {
    patterns: ['mushroom','fungi','oyster mushroom','spawn','cultivation'],
    response: () => `🍄 <strong>Mushroom Cultivation on Waste</strong><br><br>
    <strong>Best substrates:</strong><br>
    • Wheat straw → Oyster mushroom (Pleurotus)<br>
    • Corn cobs/Rice straw → Shiitake<br>
    • Cotton waste → Button mushroom<br><br>
    <strong>Returns (per kg substrate):</strong><br>
    • Input cost: ₹8–12/kg<br>
    • Oyster mushroom yield: 0.8–1.2 kg per kg straw<br>
    • Selling price: ₹80–150/kg fresh, ₹400–600/kg dried<br>
    • ROI: 300–500%! 🎯<br><br>
    <strong>Getting started:</strong><br>
    1. Buy spawn from ICAR-NRCM or local KVK<br>
    2. Training available at agriculture universities<br>
    3. NABARD provides loans for mushroom units`
  },
  help: {
    patterns: ['help','what can you do','features','options','menu','guide','assist'],
    response: () => `🤖 <strong>AgriBot Can Help With:</strong><br><br>
    Try asking me about:<br>
    • <em>"What is the price of rice husk?"</em><br>
    • <em>"Government schemes for waste management"</em><br>
    • <em>"How to make biogas from crop waste?"</em><br>
    • <em>"Why should I not burn my crop residue?"</em><br>
    • <em>"How to grow mushrooms on wheat straw?"</em><br>
    • <em>"Composting tips"</em><br>
    • <em>"Transport and logistics for biomass"</em><br>
    • <em>"How to improve my soil health"</em><br><br>
    Just type your question naturally! 💬`
  }
};

const FALLBACK_RESPONSES = [
  `That's an interesting question! For specific queries about agricultural waste pricing and management, try visiting our <a href="marketplace.html">Marketplace</a> or use the <a href="ai-analyzer.html">AI Analyzer</a> to upload images of your waste.`,
  `I'm not sure about that specific topic. You can call the <strong>Kisan Call Centre at 1800-180-1551</strong> (free, 24×7) for expert guidance from agricultural officers.`,
  `I don't have information on that yet. Try checking with your nearest <strong>Krishi Vigyan Kendra (KVK)</strong> — they offer free technical guidance and training.`,
  `For this query, I recommend visiting the <strong>farmers.gov.in</strong> portal or contacting your State Agriculture Department. Meanwhile, explore our <a href="marketplace.html">marketplace</a> for buyers!`
];

let fallbackIdx = 0;
const chatHistory = [];

function findResponse(msg) {
  const lower = msg.toLowerCase();
  for (const key in KB) {
    const kb = KB[key];
    if (kb.patterns.some(p => lower.includes(p))) {
      return kb.response();
    }
  }
  // Fuzzy fallback based on keywords
  if (/sell|buy|buyer|market|listing/.test(lower)) {
    return `💼 Ready to sell your agricultural waste? Head to our <a href="marketplace.html">Marketplace</a> to list your product, or use the <a href="ai-analyzer.html">AI Analyzer</a> to get an instant valuation and buyer recommendations!`;
  }
  if (/how|what|when|where|why|which/.test(lower)) {
    return FALLBACK_RESPONSES[fallbackIdx++ % FALLBACK_RESPONSES.length];
  }
  return FALLBACK_RESPONSES[fallbackIdx++ % FALLBACK_RESPONSES.length];
}

function addMessage(text, sender, isHtml = false) {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;

  const div = document.createElement('div');
  div.className = `chat-message ${sender}`;
  div.innerHTML = `
    <div class="message-avatar">
      ${sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'}
    </div>
    <div class="message-bubble">
      ${isHtml ? text : `<p>${text}</p>`}
      <span class="message-time">${new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</span>
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  chatHistory.push({ sender, text });
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.id = 'typingIndicator';
  div.className = 'chat-message bot';
  div.innerHTML = `
    <div class="message-avatar"><i class="fas fa-robot"></i></div>
    <div class="message-bubble typing">
      <span></span><span></span><span></span>
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  document.getElementById('typingIndicator')?.remove();
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input?.value?.trim();
  if (!msg) return;

  input.value = '';
  addMessage(msg, 'user');
  showTyping();

  setTimeout(() => {
    removeTyping();
    const response = findResponse(msg);
    addMessage(response, 'bot', true);
  }, 600 + Math.random() * 800);
}

function sendQuickReply(text) {
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function clearChat() {
  const messages = document.getElementById('chatMessages');
  if (messages) {
    messages.innerHTML = '';
    addMessage(KB.greet.response(), 'bot', true);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Render chatbot UI if container exists
  const container = document.getElementById('chatbotContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="chatbot-wrapper" id="chatbotWrapper">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="bot-avatar"><i class="fas fa-robot"></i></div>
          <div>
            <h3>AgriBot</h3>
            <span class="online-status"><i class="fas fa-circle"></i> Online</span>
          </div>
        </div>
        <button class="btn-icon" onclick="clearChat()" title="Clear Chat"><i class="fas fa-refresh"></i></button>
      </div>

      <div class="chat-messages" id="chatMessages"></div>

      <div class="quick-replies" id="quickReplies">
        <button onclick="sendQuickReply('What is the price of rice husk?')">🌾 Rice Husk Price</button>
        <button onclick="sendQuickReply('Tell me about wheat straw uses')">🌾 Wheat Straw</button>
        <button onclick="sendQuickReply('Government subsidy schemes for waste')">🏛️ Subsidies</button>
        <button onclick="sendQuickReply('How to make biogas from crop waste?')">⚡ Biogas</button>
        <button onclick="sendQuickReply('Composting tips')">♻️ Composting</button>
        <button onclick="sendQuickReply('Why not burn crop residue?')">🔥 Burning</button>
        <button onclick="sendQuickReply('Grow mushrooms on wheat straw')">🍄 Mushrooms</button>
        <button onclick="sendQuickReply('Logistics and transport for biomass')">🚛 Transport</button>
      </div>

      <div class="chat-input-area">
        <input type="text" id="chatInput" placeholder="Ask me about crop waste, prices, schemes..." 
               onkeydown="if(event.key==='Enter') sendMessage()">
        <button class="send-btn" onclick="sendMessage()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;

  // Greet
  setTimeout(() => addMessage(KB.greet.response(), 'bot', true), 300);
});

window.sendMessage = sendMessage;
window.sendQuickReply = sendQuickReply;
window.clearChat = clearChat;
