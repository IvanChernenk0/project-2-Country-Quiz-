const steps = document.querySelector('.steps');
const quiz = document.querySelector('.quiz');
const quizPoints = document.querySelector('.quiz-points');
const quizContainer = document.querySelector('.quiz-container');
const resultContainer = document.querySelector('.result-container');
const correctAnswerText = document.querySelector('.correct-answer-text');
const playAgain = document.querySelector('.play-again');

const total = 10;
const allShuffled = [];
let points = 0,
  completedQuestion = 0,
  questionCountries,
  questions = [],
  currentQuestion = 0;

const stepsLoader = function () {
  for (let i = 0; i < 10; i++) {
    if (i === 0) {
      steps.innerHTML += `<button class="step active" data-id="${i}">${
        i + 1
      }</button>`;
    } else {
      steps.innerHTML += `<button class="step" data-id="${i}">${
        i + 1
      }</button>`;
    }
  }
};

stepsLoader();

const contentChange = function () {
  quizContainer.classList.toggle('hidden');
  resultContainer.classList.toggle('hidden');
};

const getData = async function () {
  const rq = await fetch(
    'https://restcountries.com/v3.1/region/europe?fields=name,capital'
  );
  const qData = await rq.json();

  const countries = {};
  qData.forEach((c) => {
    if (c.name.common.length <= 23)
      countries[c.name.common] = {
        capital: c.capital?.[0],
        name: c.name.common,
      };
  });
  return countries;
};

const renderQuestion = async function () {
  const data = await getData();
  const newData = data;
  const countriesNumber = Object.values(newData);

  function generateQuestions(countries, total) {
    const used = new Set();

    while (questions.length < total) {
      const idx = Math.floor(Math.random() * countries.length);
      const { capital, name } = countries[idx];

      if (!capital || !name) continue;

      const key = questions.length < total / 2 ? capital : name;
      if (used.has(key)) continue;

      used.add(key);

      if (questions.length < total / 2) {
        questions.push([`What is the capital of ${name}?`, capital]);
      } else {
        questions.push([`${capital} is the capital of?`, name]);
      }
    }
  }

  generateQuestions(countriesNumber, total);

  const countriesGroup = [questions[currentQuestion][1]];
  const questionType = questions[currentQuestion][0].startsWith(
    'What is the capital of'
  );

  while (countriesGroup.length < 4) {
    const idx = Math.floor(Math.random() * countriesNumber.length);
    let responseType = questionType
      ? countriesNumber[idx].capital
      : countriesNumber[idx].name;

    if (!countriesGroup.includes(responseType)) {
      countriesGroup.push(responseType);
    }
  }

  const shuffleCountries = _.shuffle(countriesGroup);

  if (!allShuffled.some((q) => q.id === currentQuestion)) {
    allShuffled.push({
      id: currentQuestion,
      answers: shuffleCountries,
      completed: false,
      selectedCountry: '',
      correctly: null,
      correctCountry: null,
    });
  }

  questionCountries = allShuffled.find(
    (country) => country.id === currentQuestion
  );

  quiz.insertAdjacentHTML(
    'beforeend',
    `            
      <p class="question-text">${questions[currentQuestion][0]}</p>
      <div class="answer-option-container">
          ${questionCountries.answers
            .map(
              (country) =>
                `<button class="answer-option ${
                  questionCountries.selectedCountry === country ? 'active' : ''
                }">${country}<span class="emoji">${
                  questionCountries.selectedCountry === country
                    ? questionCountries.correctly
                      ? '✅'
                      : '❌'
                    : questionCountries.correctCountry === country
                    ? '✅'
                    : ''
                }</span></button>`
            )
            .join('')}
      </div>`
  );
};

renderQuestion();

steps.addEventListener('click', function (e) {
  let btn = e.target.closest('.step');
  if (!btn) return;

  let id = +btn.dataset.id;
  if (currentQuestion === id) return;
  currentQuestion = id;

  while (quiz.children.length > 1) {
    quiz.removeChild(quiz.lastElementChild);
  }

  const stepsAll = steps.querySelectorAll('.step');
  stepsAll.forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  renderQuestion();
});

quiz.addEventListener('click', function (e) {
  let btn = e.target.closest('.answer-option');
  if (!btn) return;

  questionCountries.selected = true;

  if (!questionCountries.completed) {
    if (btn.textContent === questions[currentQuestion][1]) {
      btn.querySelector('.emoji').textContent = '✅';
      points += 1;
      quizPoints.textContent = `🏆 ${points}/10 Points`;
      questionCountries.correctly = true;
    } else {
      btn.querySelector('.emoji').textContent = '❌';
      questionCountries.correctly = false;
    }

    questionCountries.correctCountry = questions[currentQuestion][1];

    quiz.querySelectorAll('.answer-option').forEach((btn) => {
      btn.textContent === questionCountries.correctCountry
        ? (btn.querySelector('.emoji').textContent = '✅')
        : '';
    });

    completedQuestion += 1;
    questionCountries.completed = true;
    questionCountries.selectedCountry = btn.textContent.slice(0, -1);

    steps.querySelectorAll('.step').forEach((s) => {
      if (questionCountries.id === +s.dataset.id) {
        s.classList.add('complited');
      }
    });
    btn.classList.add('active');
  }

  if (completedQuestion === total) {
    contentChange();
    correctAnswerText.textContent = `You answer ${points}/10 correctly.`;
  }
});

playAgain.addEventListener('click', function () {
  window.location.reload();
});
