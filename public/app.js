const quizContainer = document.getElementById("quiz");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const resultsContainer = document.getElementById("results");
const scoreValue = document.getElementById("scoreValue");
const scoreMeta = document.getElementById("scoreMeta");

let questions = [];

const renderQuestions = () => {
  quizContainer.innerHTML = "";
  questions.forEach((question, index) => {
    const card = document.createElement("article");
    card.className = "question";

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${question.title}`;

    const prompt = document.createElement("p");
    prompt.textContent = question.prompt;

    const skill = document.createElement("p");
    skill.className = "skill";
    skill.textContent = `Skill focus: ${question.skill}`;

    const list = document.createElement("div");
    list.className = "choice-list";

    question.choices.forEach((choice, choiceIndex) => {
      const label = document.createElement("label");
      label.className = "choice";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${question.id}`;
      input.value = choiceIndex;

      const span = document.createElement("span");
      span.textContent = choice;

      label.appendChild(input);
      label.appendChild(span);
      list.appendChild(label);
    });

    card.appendChild(title);
    card.appendChild(prompt);
    card.appendChild(skill);
    card.appendChild(list);

    quizContainer.appendChild(card);
  });
};

const collectAnswers = () =>
  questions.map((question) => {
    const checked = document.querySelector(
      `input[name="question-${question.id}"]:checked`
    );
    return checked ? Number(checked.value) : null;
  });

const renderResults = (payload) => {
  resultsContainer.innerHTML = "";
  payload.results.forEach((result) => {
    const card = document.createElement("article");
    card.className = `result-card ${result.correct ? "good" : "bad"}`;

    const title = document.createElement("h4");
    title.textContent = `${result.skill} – ${result.correct ? "Correct" : "Needs work"}`;

    const body = document.createElement("p");
    body.textContent = result.explanation;

    const answer = document.createElement("p");
    answer.textContent = `Correct answer: ${result.correctChoice}`;

    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(answer);
    resultsContainer.appendChild(card);
  });

  scoreValue.textContent = `${payload.score}%`;
  scoreMeta.textContent = `${payload.correctCount} of ${payload.total} correct`;
};

const loadQuestions = async () => {
  const response = await fetch("/api/questions");
  const data = await response.json();
  questions = data.questions;
  renderQuestions();
};

submitBtn.addEventListener("click", async () => {
  const answers = collectAnswers();

  if (answers.some((answer) => answer === null)) {
    scoreMeta.textContent = "Please answer every question first.";
    return;
  }

  const response = await fetch("/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ answers })
  });

  const payload = await response.json();
  renderResults(payload);
});

resetBtn.addEventListener("click", () => {
  document.querySelectorAll("input[type=radio]").forEach((input) => {
    input.checked = false;
  });
  resultsContainer.innerHTML = "";
  scoreValue.textContent = "--%";
  scoreMeta.textContent = "No submissions yet.";
});

loadQuestions();
