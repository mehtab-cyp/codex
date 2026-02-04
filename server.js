const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const questions = [
  {
    id: 1,
    title: "Array mapping",
    prompt:
      "In JavaScript, what does this expression return? [1, 2, 3].map(n => n * 2)",
    choices: ["[1, 2, 3]", "[2, 4, 6]", "[2, 3, 4]", "[1, 4, 9]"],
    answer: 1,
    skill: "JavaScript fundamentals",
    explanation: "map applies a function to each element, doubling each number."
  },
  {
    id: 2,
    title: "SQL filtering",
    prompt:
      "Which SQL clause is used to filter rows after aggregation (GROUP BY)?",
    choices: ["WHERE", "ORDER BY", "HAVING", "LIMIT"],
    answer: 2,
    skill: "SQL",
    explanation: "HAVING filters aggregated rows, WHERE filters before aggregation."
  },
  {
    id: 3,
    title: "HTTP method",
    prompt: "Which HTTP method is most appropriate for updating a resource?",
    choices: ["GET", "POST", "PUT", "TRACE"],
    answer: 2,
    skill: "Web fundamentals",
    explanation: "PUT replaces or updates a resource at a known URL."
  },
  {
    id: 4,
    title: "Time complexity",
    prompt: "What is the average time complexity of binary search on a sorted array?",
    choices: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 1,
    skill: "Algorithms",
    explanation: "Binary search halves the search space each step."
  }
];

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json"
};

const sendJson = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
};

const collectRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });

const serveFile = (res, filePath) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(content);
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/questions") {
    const safeQuestions = questions.map(({ answer, explanation, ...rest }) => rest);
    return sendJson(res, 200, { questions: safeQuestions });
  }

  if (req.method === "POST" && req.url === "/api/submit") {
    try {
      const body = await collectRequestBody(req);
      const payload = JSON.parse(body || "{}");
      const { answers } = payload;

      if (!Array.isArray(answers)) {
        return sendJson(res, 400, { error: "Answers must be an array." });
      }

      const results = questions.map((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.answer;
        return {
          id: question.id,
          correct: isCorrect,
          skill: question.skill,
          explanation: question.explanation,
          correctChoice: question.choices[question.answer]
        };
      });

      const correctCount = results.filter((result) => result.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);

      return sendJson(res, 200, {
        score,
        correctCount,
        total: questions.length,
        results
      });
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON payload." });
    }
  }

  const requestedPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = path.normalize(requestedPath).replace(/^\/+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  serveFile(res, filePath);
});

server.listen(port, () => {
  console.log(`Dev Skill Checker listening on port ${port}`);
});
