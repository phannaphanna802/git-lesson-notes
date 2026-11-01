// Git Notes: lesson progress, copy buttons, theme toggle and quiz.

const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

// Restore saved theme.
if (localStorage.getItem("gitNotesTheme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀" : "☾";
  localStorage.setItem("gitNotesTheme", isDark ? "dark" : "light");
});

// Save completed lessons and update progress.
const lessonChecks = [...document.querySelectorAll(".lesson-check")];
const savedProgress = JSON.parse(localStorage.getItem("gitNotesProgress") || "[]");

lessonChecks.forEach((checkbox, index) => {
  checkbox.checked = savedProgress.includes(index);
  checkbox.addEventListener("change", saveProgress);
});

function saveProgress() {
  const completed = lessonChecks
    .map((checkbox, index) => checkbox.checked ? index : null)
    .filter(index => index !== null);

  localStorage.setItem("gitNotesProgress", JSON.stringify(completed));
  const percent = (completed.length / lessonChecks.length) * 100;
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("progressText").textContent =
    `${completed.length} of ${lessonChecks.length} lessons completed`;
}
saveProgress();

// Copy commands to clipboard.
document.querySelectorAll(".copy-btn").forEach(button => {
  button.addEventListener("click", async () => {
    const text = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Command copied!");
    } catch {
      showToast("Copy unavailable — select the command manually.");
    }
  });
});

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

// Active sidebar link while scrolling.
const sections = [...document.querySelectorAll(".lesson-card, #quiz")];
const sideLinks = [...document.querySelectorAll(".side-link")];

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      sideLinks.forEach(link => link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${entry.target.id}`
      ));
    }
  });
}, { rootMargin: "-20% 0px -70% 0px" });
sections.forEach(section => observer.observe(section));

// Beginner quiz.
const questions = [
  {
    question: "What is Git?",
    options: ["A programming language", "A Version Control System", "A web browser", "A database"],
    answer: 1,
    explanation: "Git is a Distributed Version Control System used to track changes in files."
  },
  {
    question: "Which command creates a new Git repository?",
    options: ["git start", "git create", "git init", "git run"],
    answer: 2,
    explanation: "git init initializes a new repository in the current folder."
  },
  {
    question: "What does git add . do?",
    options: ["Deletes all files", "Stages all changes", "Uploads to GitHub", "Creates a branch"],
    answer: 1,
    explanation: "git add . stages the changes in the current directory."
  },
  {
    question: "Which command records a snapshot of staged changes?",
    options: ["git push", "git status", "git commit", "git clone"],
    answer: 2,
    explanation: "git commit records staged changes in the local repository."
  },
  {
    question: "What is a Git branch used for?",
    options: ["A separate line of development", "Deleting a repository", "Changing your password", "Installing Git"],
    answer: 0,
    explanation: "A branch lets you work on a feature separately from another branch."
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionCount = document.getElementById("questionCount");
const questionText = document.getElementById("questionText");
const answerOptions = document.getElementById("answerOptions");
const quizFeedback = document.getElementById("quizFeedback");
const nextQuestion = document.getElementById("nextQuestion");
const quizResult = document.getElementById("quizResult");
const quizArea = document.getElementById("quizArea");

function renderQuestion() {
  const item = questions[currentQuestion];
  answered = false;
  questionCount.textContent = `QUESTION ${currentQuestion + 1} / ${questions.length}`;
  questionText.textContent = item.question;
  answerOptions.innerHTML = "";
  quizFeedback.textContent = "";
  nextQuestion.disabled = true;
  nextQuestion.textContent = currentQuestion === questions.length - 1
    ? "See my result →"
    : "Next question →";

  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => chooseAnswer(index, button));
    answerOptions.appendChild(button);
  });
}

function chooseAnswer(index, selectedButton) {
  if (answered) return;
  answered = true;

  const item = questions[currentQuestion];
  const options = [...answerOptions.children];
  options.forEach(button => button.disabled = true);

  if (index === item.answer) {
    score++;
    selectedButton.classList.add("correct");
    quizFeedback.textContent = `✓ Correct! ${item.explanation}`;
  } else {
    selectedButton.classList.add("wrong");
    options[item.answer].classList.add("correct");
    quizFeedback.textContent = `Not quite. ${item.explanation}`;
  }
  document.getElementById("quizScore").textContent = `SCORE: ${score}`;
  nextQuestion.disabled = false;
}

nextQuestion.addEventListener("click", () => {
  if (!answered) return;

  currentQuestion++;
  if (currentQuestion < questions.length) {
    renderQuestion();
    return;
  }

  quizArea.classList.add("hidden");
  quizResult.classList.remove("hidden");
  const message = score === 5 ? "Excellent work!" :
    score >= 3 ? "Good effort — keep practicing!" : "Keep learning and try again!";
  quizResult.innerHTML = `<strong>${score}/${questions.length}</strong><h3>${message}</h3><p>Review the lessons and test yourself again.</p><button class="btn btn-primary" id="retryQuiz">Try again ↻</button>`;
  document.getElementById("retryQuiz").addEventListener("click", resetQuiz);
});

function resetQuiz() {
  currentQuestion = 0;
  score = 0;
  quizArea.classList.remove("hidden");
  quizResult.classList.add("hidden");
  document.getElementById("quizScore").textContent = "";
  renderQuestion();
}

renderQuestion();
