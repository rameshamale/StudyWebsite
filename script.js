let recognition;
let isRecording = false;
const transcriptDiv = document.getElementById("transcript");
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");

// ---------------- Mic Permission ----------------
async function requestMicPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // stop immediately
    } catch (err) {
        alert("Microphone access denied.");
        throw err;
    }
}

// ---------------- Speech Recognition ----------------
function createRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = function(event) {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript + " ";
            }
        }

        // Display live transcript
        transcriptDiv.innerHTML = `<span style="color:gray">${interimTranscript}</span>${finalTranscript}`;

        // Perform live search & highlight
        const combinedText = (finalTranscript + interimTranscript).trim();
        liveSearch(combinedText);
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = function() {
        // Auto-restart if user hasn't clicked stop
        if (isRecording) recognition.start();
    };
}

// ---------------- Clear Highlights ----------------
function clearHighlights() {
    document.querySelectorAll(".subtabcontent, .tabcontent").forEach(tab => {
        tab.innerHTML = tab.textContent; // remove <mark>
        tab.classList.remove("active");
    });
}

// ---------------- Live Search & Highlight ----------------
// ---------------- Live Search & Highlight ----------------
function liveSearch(text) {
    if (!text) return;
    const searchText = text.trim().toLowerCase();
    if (!searchText) return;

    document.querySelectorAll(".subtabcontent").forEach(subtab => {
        const topic = (subtab.dataset.topic || subtab.id).toLowerCase();

        if (topic.includes(searchText)) {
            // Highlight button label instead of images
            const button = document.querySelector(`[data-target="${subtab.id}"]`);
            if (button) {
                button.innerHTML = button.dataset.topic.replace(
                    new RegExp(`(${searchText})`, "gi"),
                    "<mark>$1</mark>"
                );
            }

            // Activate sub-tab and parent
            subtab.classList.add("active");
            const parentTab = subtab.closest(".tabcontent");
            if (parentTab) parentTab.classList.add("active");
        } else {
            // Reset button label
            const button = document.querySelector(`[data-target="${subtab.id}"]`);
            if (button) button.innerHTML = button.dataset.topic;

            subtab.classList.remove("active");
        }
    });
}

// ---------------- Clear Button ----------------
clearBtn.addEventListener("click", () => {
    // Reset transcript only
    transcriptDiv.innerHTML = "Your recorded or typed question will appear here...";
});


// ---------------- Buttons ----------------
// Start Recording
recordBtn.addEventListener("click", async () => {
    if (!isRecording) {
        await requestMicPermission();
        if (!recognition) createRecognition();
        recognition.start();
        isRecording = true;
        recordBtn.textContent = "🎤 Recording...";
    }
});

// Stop Recording
stopBtn.addEventListener("click", () => {
    if (isRecording && recognition) {
        recognition.stop();
        isRecording = false;
        recordBtn.textContent = "🎤 Start Recording";
    }
});


// Main Tabs
function openTab(evt, tabName) {
  // Hide all main tab contents
  document.querySelectorAll(".tabcontent").forEach(tab => tab.classList.remove("active"));

  // Remove 'active' from all navbar links
  document.querySelectorAll(".navbar a").forEach(link => link.classList.remove("active"));

  // Show the selected tab
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) selectedTab.classList.add("active");

  // Highlight clicked navbar link
  evt.currentTarget.classList.add("active");

  // Automatically select first sub-tab if exists
  const firstSub = selectedTab.querySelector(".btn-group1 button");
  if (firstSub) {
    firstSub.click();
  }
}

// Sub-tabs (inside Selenium)
document.querySelectorAll(".btn-group1 button").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;

    // Hide all subtab contents within the parent tab
    const parent = btn.closest(".tabcontent");
    parent.querySelectorAll(".subtabcontent").forEach(div => div.classList.remove("active"));

    // Remove 'active' from all buttons in this group
    btn.closest(".btn-group1").querySelectorAll("button").forEach(b => b.classList.remove("active"));

    // Show the selected subtab
    const subtab = document.getElementById(targetId);
    if(subtab) subtab.classList.add("active");

    // Highlight the button
    btn.classList.add("active");
  });
});
