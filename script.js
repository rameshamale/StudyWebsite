let recognition;
let listening = false; // tracks whether user clicked "Record"
// Request microphone permission every time
async function requestMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("🎤 Permission granted");
    // Stop the stream immediately if you only want the prompt
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    console.error("Microphone access denied:", err);
    alert("Microphone access is required to start recording.");
  }
}

// Check if browser supports webkitSpeechRecognition
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = function() {
    console.log("🎤 Microphone access granted, recognition started");
  };

  recognition.onresult = function(event) {
    let interimTranscript = '';
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
      else interimTranscript += event.results[i][0].transcript;
    }
    const fullText = finalTranscript + interimTranscript;
    document.getElementById("transcript").textContent = "🎤 You said:\n" + fullText;
    highlightMatchingButton(fullText);
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = function() {
    // Only restart if user clicked Record
    if (listening) {
      console.log("Recognition ended, restarting...");
      recognition.start();
    }
  };
} else {
  alert("Speech recognition not supported in this browser. Please use Chrome.");
}

// Start listening
function startListening() {
  if (recognition && !listening) {
    listening = true;
    try {
      recognition.start();
      document.getElementById("transcript").textContent = "🎤 Listening...";
    } catch(e) {
      console.error("Error starting recognition:", e);
    }
  }
}


// Stop listening
function stopListening() {
  if (recognition) {
    listening = false;
    recognition.stop();
    document.getElementById("transcript").textContent += "\n🛑 Stopped";
  }
}

// Clear transcript and button highlights
function clearTranscript() {
  document.getElementById("transcript").textContent = "";
  document.querySelectorAll(".btn-group button, .btn-group1 button").forEach(btn => btn.classList.remove("active"));
}

// Highlight buttons based on transcript
function highlightMatchingButton(text) {
  const buttons = document.querySelectorAll(".btn-group button, .btn-group1 button");
  const lowerText = text.toLowerCase();

  buttons.forEach(btn => {
    const topic = btn.dataset.topic.toLowerCase();
    const topicWords = topic.split(' ');
    const match = topicWords.some(word => lowerText.includes(word));
    if (match) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

// Tab button click events
const tabButtons = document.querySelectorAll(".btn-group button, .btn-group1 button");
tabButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const targetId = btn.dataset.target;
    document.querySelectorAll('.tabcontent').forEach(div => div.style.display = 'none');
    const target = document.getElementById(targetId);
    if (target) target.style.display = 'block';

    // Highlight active button
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Attach control buttons
document.getElementById("recordBtn").addEventListener("click", startListening);
document.getElementById("stopBtn").addEventListener("click", stopListening);
document.getElementById("clearBtn").addEventListener("click", clearTranscript);
