// public/app.js

// --- Global Variables ---
let currentSessionCode = "";
let pollInterval = null;

// --- Screen Switching Logic ---
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  // Show the requested screen
  document.getElementById(screenId).classList.add("active");
}

// Navigation Buttons
document
  .getElementById("btn-show-teacher")
  .addEventListener("click", () => showScreen("teacher-screen"));
document
  .getElementById("btn-show-student")
  .addEventListener("click", () => showScreen("student-screen"));

// --- TEACHER LOGIC ---
// --- Answer Toggle Logic ---
let answersVisible = true;
document.getElementById("btn-toggle-answers").addEventListener("click", () => {
  const list = document.getElementById("answers-list");
  const btn = document.getElementById("btn-toggle-answers");

  answersVisible = !answersVisible; // Flip the true/false switch

  if (answersVisible) {
    list.classList.remove("blurred");
    btn.innerText = "Hide Answers";
  } else {
    list.classList.add("blurred");
    btn.innerText = "Show Answers";
  }
});
document.getElementById("btn-create-session").addEventListener("click", async () => {
  const questionInput = document.getElementById("question-input").value;

  if (!questionInput) {
    alert("Please enter a question first!");
    return;
  }

  // Send the question to the server
  const response = await fetch("/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: questionInput }),
  });

  const data = await response.json();
  currentSessionCode = data.code;

  // Update UI
  document.getElementById("display-code").innerText = currentSessionCode;
  document.getElementById("display-question").innerText = questionInput;

  // Hide setup, show active session
  document.getElementById("teacher-setup").classList.add("hidden");
  document.getElementById("teacher-active").classList.remove("hidden");

  // Start polling for answers every 3 seconds
  pollInterval = setInterval(fetchAnswers, 3000);
});

async function fetchAnswers() {
  if (!currentSessionCode) return;

  const response = await fetch(`/session/${currentSessionCode}`);
  if (response.ok) {
    const data = await response.json();
    const answersList = document.getElementById("answers-list");

    // Clear old list
    answersList.innerHTML = "";

    // Populate new list
    data.answers.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.name}:</strong> ${item.answer}`;
      answersList.appendChild(li);
    });
  }
}

// --- STUDENT LOGIC ---

document.getElementById("btn-join-session").addEventListener("click", async () => {
  const codeInput = document.getElementById("join-code").value;
  const nameInput = document.getElementById("student-name").value;

  if (!codeInput || !nameInput) {
    alert("Please enter both a code and your name.");
    return;
  }

  // Check if session exists by fetching it
  const response = await fetch(`/session/${codeInput}`);

  if (response.ok) {
    const data = await response.json();
    currentSessionCode = codeInput;

    // Update UI
    document.getElementById("student-question-display").innerText = data.question;

    // Hide setup, show active session
    document.getElementById("student-setup").classList.add("hidden");
    document.getElementById("student-active").classList.remove("hidden");
  } else {
    alert("Session not found. Please check the code.");
  }
});

document.getElementById("btn-submit-answer").addEventListener("click", async () => {
  const answerInput = document.getElementById("student-answer").value;
  const nameInput = document.getElementById("student-name").value;

  if (!answerInput) {
    alert("Please type an answer before submitting.");
    return;
  }

  // Send answer to server
  const response = await fetch("/submit-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: currentSessionCode,
      name: nameInput,
      answer: answerInput,
    }),
  });

  if (response.ok) {
    document.getElementById("student-status").innerText =
      "Answer submitted successfully! Waiting for teacher...";
    document.getElementById("student-status").style.color = "green";
    document.getElementById("student-answer").value = ""; // Clear input
  } else {
    alert("Error submitting answer.");
  }
});
