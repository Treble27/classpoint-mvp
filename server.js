// server.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// This object will act as our temporary database!
// It will look like this: { "1234": { question: "What is 2+2?", answers: [] } }
const sessions = {};

// 1. Teacher creates a session
app.post("/create-session", (req, res) => {
  const question = req.body.question;

  // Generate a random 4-digit code (e.g., 4921)
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  // Save it in our temporary database
  sessions[code] = {
    question: question,
    answers: [], // Empty list to hold student answers later
  };

  console.log(`Session created! Code: ${code}, Question: "${question}"`);

  // Send the code back to the teacher
  res.json({ code: code });
});

// 2. Get session details (Used by students to see the question, and teachers to see answers)
app.get("/session/:code", (req, res) => {
  const code = req.params.code;
  const session = sessions[code];

  if (session) {
    res.json(session); // Sends back the question and answers
  } else {
    res.status(404).json({ error: "Session not found. Check the code." });
  }
});

// 3. Student submits an answer
app.post("/submit-answer", (req, res) => {
  const code = req.body.code;
  const name = req.body.name;
  const answer = req.body.answer;

  if (sessions[code]) {
    // Add the new answer to the list
    sessions[code].answers.push({ name: name, answer: answer });
    console.log(`New answer in ${code} from ${name}: ${answer}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Session not found." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend API is ready! Running on http://localhost:${PORT}`);
});
