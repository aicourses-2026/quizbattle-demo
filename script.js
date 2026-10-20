// QuizBattle — логика игры. Вопросы лежат в questions.js (переменная QUESTIONS).

const TIME_PER_QUESTION = 15;          // секунд на вопрос
const SHAPES = ["▲", "◆", "●", "■"];   // значки на кнопках, как в Kahoot

let current = 0;
let score = 0;
let timeLeft = TIME_PER_QUESTION;
let timerId = null;
let answered = false;

const $ = (id) => document.getElementById(id);

function show(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(screenId).classList.add("active");
}

function startGame() {
  current = 0;
  score = 0;
  show("screen-question");
  showQuestion();
}

function showQuestion() {
  const q = QUESTIONS[current];
  answered = false;
  $("progress").textContent = `Вопрос ${current + 1} из ${QUESTIONS.length}`;
  $("score").textContent = `${score} очков`;
  $("question-text").textContent = q.question;
  $("feedback").textContent = "";

  const box = $("answers");
  box.innerHTML = "";
  q.answers.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = `answer shape-${i + 1}`;
    btn.innerHTML = `<span class="shape">${SHAPES[i]}</span><span></span>`;
    btn.lastChild.textContent = text;
    btn.addEventListener("click", () => choose(i));
    box.appendChild(btn);
  });

  timeLeft = TIME_PER_QUESTION;
  updateTimer();
  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 0.1;
    updateTimer();
    if (timeLeft <= 0) choose(-1);
  }, 100);
}

function updateTimer() {
  const percent = Math.max(0, timeLeft / TIME_PER_QUESTION) * 100;
  $("timer-bar").style.width = percent + "%";
}

function choose(index) {
  if (answered) return;
  answered = true;
  clearInterval(timerId);

  const q = QUESTIONS[current];
  const buttons = document.querySelectorAll(".answer");
  buttons.forEach((b, i) => {
    if (i === q.correct) b.classList.add("right");
    else b.classList.add("dim");
  });

  if (index === q.correct) {
    // 500 очков за верный ответ + до 500 за скорость
    const bonus = Math.round(500 * Math.max(0, timeLeft) / TIME_PER_QUESTION);
    score += 500 + bonus;
    $("feedback").textContent = `Верно! +${500 + bonus}`;
  } else if (index === -1) {
    $("feedback").textContent = "Время вышло ⏰";
  } else {
    $("feedback").textContent = "Мимо 🙈";
  }
  $("score").textContent = `${score} очков`;

  setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
  current++;
  if (current < QUESTIONS.length) showQuestion();
  else finish();
}

function finish() {
  const name = $("player-name").value.trim() || "Игрок";
  const max = QUESTIONS.length * 1000;
  $("final-title").textContent = `${name}, твой результат`;
  $("final-score").textContent = score;
  let text = "Мы точно знакомы? 😄";
  if (score > max * 0.7) text = "Ты знаешь меня лучше всех! 🏆";
  else if (score > max * 0.4) text = "Неплохо! Почти лучший друг 👍";
  $("final-text").textContent = text;
  show("screen-final");
}

$("btn-start").addEventListener("click", startGame);
$("btn-restart").addEventListener("click", () => show("screen-start"));
