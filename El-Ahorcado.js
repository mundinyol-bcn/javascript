var alpha = [];
var bravo = [];

var running = 0;
var failnum = 0;
var advising = 0;
var index = 0;
var savetext = "";

function pick() {
  var choice = "";
  var blank = false;
  var currentWord = words[index];

  for (let i = 0; i < currentWord.length; i++) {
    let ch = currentWord.charAt(i).toUpperCase();
    if (alpha.includes(ch)) {
      choice += ch + " ";
    } else {
      choice += "_ ";
      blank = true;
    }
  }

  document.f.word.value = choice.trim();

  if (!blank) {
    document.f.tried.value = "☆ ☆ ¡HAS GANADO! ☆ ☆";
    document.f.score.value++;
    running = 0;
  }
}

function new_word(form) {
  if (!running) {
    running = 1;
    failnum = 0;
    form.lives.value = failnum;
    form.tried.value = "";
    form.word.value = "";

    index = Math.floor(Math.random() * words.length);
    alpha = [];
    bravo = [];

    // 初期ヒント：先頭と末尾の文字
    let word = words[index].toUpperCase();
    if (word.length >= 1) alpha.push(word.charAt(0));
    if (word.length >= 2) alpha.push(word.charAt(word.length - 1));
    if (word.length == 1) alpha.push(word.charAt(0)); // 単語1文字対策

    bravo = [...alpha];

    pick();
  } else {
    advise("El ahorcado ya ha empezado");
  }
}

function seek(letter) {
  letter = letter.toUpperCase();

  if (!running) {
    advise("Haz click sobre otra");
    return;
  }

  if (bravo.includes(letter)) {
    advise("La letra " + letter + " ya la has puesto");
    return;
  }

  bravo.push(letter);

  let found = false;
  let currentWord = words[index].toUpperCase();

  for (let i = 0; i < currentWord.length; i++) {
    if (currentWord.charAt(i) === letter) {
      found = true;
      alpha.push(letter);
    }
  }

  if (!found) {
    failnum++;
    document.f.lives.value = failnum;

    if (failnum === 6) {
      document.f.tried.value = "Has perdido. Prueba de nuevo";
      document.f.word.value = words[index];
      document.f.score.value--;
      running = 0;
      return;
    }
  }

  pick();
}

function advise(msg) {
  if (!advising) {
    advising = -1;
    savetext = document.f.tried.value;
    document.f.tried.value = msg;
    setTimeout(() => {
      document.f.tried.value = savetext;
      advising = 0;
    }, 1000);
  }
}

var words = [
  "ABRIL", "ACEITE", "ALMA", "ALUMNO", "AMIGO", "AMOR"
];
