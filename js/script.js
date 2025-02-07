//quadro do jogo
let jogo;
let jogoWidth = 375;
let jogoHeight = 500;
let context;

let tamanhoNavegador = window.innerWidth;
if (tamanhoNavegador > 800) jogoWidth = 500;

//jogador
let jogadorWidth = 80;
let jogadorHeight = 10;
let jogadorSpeedX = 10;

let nomeJogador = "";

let jogador = {
  x: jogoWidth / 2 - jogadorWidth / 2,
  y: jogoHeight - jogadorHeight - 5,
  width: jogadorWidth,
  height: jogadorHeight,
  velocityX: jogadorSpeedX,
};

let pontuacao = 0;
let gameOver = false;

let velocidadeBolaX = 3;
let velocidadeBolaY = 2;

//bola
let bolaWidth = 10;
let bolaHeight = 10;
let bolaVelocityX = velocidadeBolaX;
let bolaVelocityY = velocidadeBolaY;

let bola = {
  x: numAleatorio(0, jogoWidth - 10),
  y: jogoHeight / 2,
  width: bolaWidth,
  height: bolaHeight,
  velocityX: bolaVelocityX,
  velocityY: bolaVelocityY,
};

//Blocos
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 6;
if (jogoWidth == 500) blockColumns = 8;
let blockRows = 3; // É adicionado mais ao decorrer do jogo.
let blockMaxRows = 10;
let blockCount = 0;

//iniciando os blocos no topo esquerdo.
let blockX = 15;
let blockY = 45;

window.onload = function () {
  jogo = document.getElementById("jogo");
  nomeJogador = jogadorNome();
  jogo.height = jogoHeight;
  jogo.width = jogoWidth;
  context = jogo.getContext("2d"); //feito para desenhar o jogo.

  //Desenhar inicio do jogo.
  context.fillStyle = "lightgreen";
  context.fillRect(jogador.x, jogador.y, jogador.width, jogador.height);

  requestAnimationFrame(update);
  document.addEventListener("mousemove", moveJogador);
  document.addEventListener("keydown", function (e) {
    if (gameOver) {
      if (e.code == "Space") resetGame();
      return;
    }
  });

  let computador = document.getElementById("checkbox");
  computador.addEventListener("change", function () {
    modoComputador = computador.checked;
  });

  //Criando os blocos.
  createBlocks();
  listarRanking();
};

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, jogo.width, jogo.height);
//jogador
let gradient = context.createLinearGradient(jogador.x, jogador.y, jogador.x + jogador.width, jogador.y);
gradient.addColorStop(0, "violet");
gradient.addColorStop(1, "purple");
context.fillStyle = gradient;
context.beginPath();
context.roundRect(jogador.x, jogador.y, jogador.width, jogador.height, 5);
context.fill();
//jogador computador
if (modoComputador) {
  let gradientComputador = context.createLinearGradient(jogadorComputador.x, jogadorComputador.y, jogadorComputador.x + jogadorComputador.width, jogadorComputador.y);
  gradientComputador.addColorStop(0, "yellow");
  gradientComputador.addColorStop(1, "orange");
  context.fillStyle = gradientComputador;
  context.beginPath();
  context.roundRect(jogadorComputador.x, jogadorComputador.y, jogadorComputador.width, jogadorComputador.height, 5);
  context.fill();

  let jogadorComputadorCentro = jogadorComputador.x + jogadorComputador.width / 2;
  if (bolaComputador.x > jogadorComputadorCentro) {
    let nextJogadorX = jogadorComputador.x + jogadorComputadorSpeedX;
    if (!limites({ x: nextJogadorX, width: jogadorComputadorWidth })) {
      jogadorComputador.x = nextJogadorX;
    }
  } else if (bolaComputador.x < jogadorComputadorCentro) {
    let nextJogadorX = jogadorComputador.x - jogadorComputadorSpeedX;
    if (!limites({ x: nextJogadorX, width: jogadorComputadorWidth })) {
      jogadorComputador.x = nextJogadorX;
    }
  }
} else {
  bolaVelocityX = 3;
  bolaVelocityY = 2;
}

//bola com rastro
context.fillStyle = "rgba(255, 255, 255, 0.2)"; // cor do rastro com opacidade
context.beginPath();
context.arc(bola.x + bola.width / 2, bola.y + bola.height / 2, bola.width / 2, 0, Math.PI * 2);
context.fill();

// atualizar posição da bola
bola.x += bola.velocityX;
bola.y += bola.velocityY;

// desenhar a bola
let gradientBola = context.createLinearGradient(0, 0, 0, jogoHeight);
gradientBola.addColorStop(0, "violet");
gradientBola.addColorStop(1, "purple");
context.fillStyle = gradientBola;
context.beginPath();
context.arc(bola.x + bola.width / 2, bola.y + bola.height / 2, bola.width / 2, 0, Math.PI * 2);
context.fill();

//Bola computador
if (modoComputador) {
    // desenhar a bola do computador com gradiente
    let gradientBolaComputador = context.createLinearGradient(0, 0, 0, jogoHeight);
    gradientBolaComputador.addColorStop(0, "yellow");
    gradientBolaComputador.addColorStop(1, "orange");
    context.fillStyle = gradientBolaComputador;
    context.beginPath();
    context.arc(bolaComputador.x + bolaComputador.width / 2, bolaComputador.y + bolaComputador.height / 2, bolaComputador.width / 2, 0, Math.PI * 2);
    context.fill();

    // atualizar posição da bola do computador
    bolaComputador.x += bolaComputador.velocityX;
    bolaComputador.y += bolaComputador.velocityY;
}

  //A detecção da bola batendo nas paredes e o rebote e caso toque no "chão" será descontado 100 pontos.
  if ((fim = rebote(bola) == 1)) pontuacao - 100;
  if ((fim = rebote(bolaComputador) == 1)) pontuacaoComputador - 100;

  // bater a bola e subir novamente.
  if (topColisao(bola, jogador) || bottomColisao(bola, jogador)) {
    bola.velocityY *= -1; //Virar y, seja pra cima ou pra baixo.
  } else if (leftColisao(bola, jogador) || rightColisao(bola, jogador)) {
    bola.velocityX *= -1; // Virar x
  }

  // bater a bola e subir novamente no modo computador.
  if (modoComputador) {
    if (
      topColisao(bolaComputador, jogadorComputador) ||
      bottomColisao(bolaComputador, jogadorComputador)
    ) {
      bolaComputador.velocityY *= -1; //Virar y, seja pra cima ou pra baixo.
    } else if (
      leftColisao(bolaComputador, jogadorComputador) ||
      rightColisao(bolaComputador, jogadorComputador)
    ) {
      bolaComputador.velocityX *= -1; // Virar x
    }
  }

//blocos
context.fillStyle = "violet";
for (let i = 0; i < blockArray.length; i++) {
    let block = blockArray[i];
    if (!block.break) {
        if (topColisao(bola, block) || bottomColisao(bola, block)) {
            block.break = true;
            bola.velocityY *= -1; //Mudar a direção de y, para cima ou para baixo.
            blockCount -= 1;
            pontuacao += 100;
        } else if (leftColisao(bola, block) || rightColisao(bola, block)) {
            block.break = true;
            bola.velocityX *= -1; //mudar a direção de x, direita ou esquerda.
            blockCount -= 1;
            pontuacao += 100;
        } else if (
            topColisao(bolaComputador, block) ||
            bottomColisao(bolaComputador, block)
        ) {
            block.break = true;
            bolaComputador.velocityY *= -1; //Mudar a direção de y, para cima ou para baixo.
            blockCount -= 1;
            pontuacaoComputador += 100;
        } else if (
            leftColisao(bolaComputador, block) ||
            rightColisao(bolaComputador, block)
        ) {
            block.break = true;
            bolaComputador.velocityX *= -1; //mudar a direção de x, direita ou esquerda.
            blockCount -= 1;
            pontuacaoComputador += 100;
        }

        context.beginPath();
        context.roundRect(block.x, block.y, block.width, block.height, 5);
        context.fill();
    }
}

  //quando acabar os blocos.
  if (blockCount == 0) {
    pontuacao += 100 * blockRows * blockColumns; //Pontuação extra
    pontuacaoComputador += 100 * blockRows * blockColumns;
    velocidadeBolaX += 2; //Quando os blocos acabarem a velocidade irá aumentar.
    velocidadeBolaY += 2;
    blockRows = Math.min(blockRows + 1, blockMaxRows);
    createBlocks();
  }

  //Pontuação
  context.font = "20px serif";
  context.fillText(`Pontuação: ${pontuacao}`, 10, 25);
  if (modoComputador)
    context.fillText(`Computador: ${pontuacaoComputador}`, jogoWidth - 150, 25);
}

function limites(xPosition) {
  return xPosition.x < 0 || xPosition.x + xPosition.width > jogoWidth;
}

function moveJogador(e) {
  let mouseX = e.clientX - jogo.offsetLeft;

  jogador.x = mouseX - jogadorWidth / 2;

  if (jogador.x + jogadorWidth >= jogoWidth)
    jogador.x = jogoWidth - jogadorWidth;
  else if (jogador.x <= 0) jogador.x = 0;
}

function detectorColisao(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function topColisao(bola, block) {
  // a encima b ( bola quando toca no bloco)
  return detectorColisao(bola, block) && bola.y + bola.height >= block.y;
}

function bottomColisao(bola, block) {
  // a embaixo de b(bola quando toca na base)
  return detectorColisao(bola, block) && block.y + block.height >= bola.y;
}

function leftColisao(bola, block) {
  // a a esquerda de b (bola quando toca na lateral esquerda do bloco)
  return detectorColisao(bola, block) && bola.x + bola.width >= block.x;
}

function rightColisao(bola, block) {
  // a a direita de b (bola quando toca na lateral direita do bloco)
  return detectorColisao(bola, block) && block.x + block.width <= bola.x;
}

//limite da bola na parede
function rebote(bola) {
  if (bola.y <= 0) {
    //se a bola tocar no topo do canvas.
    bola.velocityY *= -1;
  } else if (bola.x <= 0 || bola.x + bola.width >= jogoWidth) {
    //Se a bola tocar na borda lateral do canva.
    bola.velocityX *= -1;
  } else if (bola.y + bola.height >= jogoHeight) {
    //Se a bola tocar embaixo do canva
    //Fim de jogo
    fimJogo();
    return 1;
  }
}

function createBlocks() {
  blockArray = [];
  for (let c = 0; c < blockColumns; c++) {
    for (let r = 0; r < blockRows; r++) {
      let block = {
        x: blockX + c * blockWidth + c * 10, // adiciona 10 pixels de distancia entre colunas.
        y: blockY + r * blockHeight + r * 10, // adiciona 10 pixels de distancia entre linhas.
        width: blockWidth,
        height: blockHeight,
        break: false,
      };
      blockArray.push(block);
    }
  }
  blockCount = blockArray.length;
}

function resetGame() {
  nomeJogador = jogadorNome();
  gameOver = false;

  velocidadeBolaX = 3;
  velocidadeBolaY = 2;

  jogador = {
    x: jogoWidth / 2 - jogadorWidth / 2,
    y: jogoHeight - jogadorHeight - 5,
    width: jogadorWidth,
    height: jogadorHeight,
    velocityX: jogadorSpeedX,
  };

  jogadorComputador = {
    x: jogoWidth / 2 - jogadorComputadorWidth / 2,
    y: jogoHeight - jogadorHeight - 5,
    width: jogadorComputadorWidth,
    height: jogadorComputadorHeight,
    velocityX: jogadorComputadorSpeedX,
  };

  bola = {
    x: numAleatorio(0, jogoWidth - 10),
    y: jogoHeight / 2,
    width: bolaWidth,
    height: bolaHeight,
    velocityX: bolaVelocityX,
    velocityY: bolaVelocityY,
  };

  bolaComputador = {
    x: numAleatorio(0, jogoWidth - 10),
    y: jogoHeight / 2,
    width: bolaWidth,
    height: bolaHeight,
    velocityX: bolaCVelocityX,
    velocityY: bolaCVelocityY,
  };

  blockArray = [];
  blockRows = 3;
  pontuacao = 0;
  pontuacaoComputador = 0;
  createBlocks();
}

function numAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function listarRanking() {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  const rankingString = localStorage.getItem("ranking");
  let ranking = rankingString ? JSON.parse(rankingString) : [];

  ranking.forEach((jogador, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}º - ${jogador.nome}: ${jogador.pontuacao}`;
    lista.appendChild(li);
  });
}

function jogadorNome() {
  nome = prompt("Digite o seu nome: ");

  if (nome === "" || nome === null) {
    window.alert("Usuario anonimo");
    nome = "Anonimo";
  }
  return nome;
}

function salvaPontuacao(jogadorNome, pontuacao) {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  if (jogadorNome && pontuacao !== undefined) {
    ranking.push({
      nome: jogadorNome,
      pontuacao: pontuacao,
    });
    ranking.sort((a, b) => b.pontuacao - a.pontuacao); //Guarda ordenado;
    ranking = ranking.slice(0, 10);
    localStorage.setItem("ranking", JSON.stringify(ranking)); //salva o ranking atualizando no local storage
  }
}

function fimJogo() {
  context.fillStyle = "white";
  frase("sans-serif", "Fim de jogo: Pressione 'Espaço' para jogar novamente.", 420);
  context.font = "25px monospace";
  frase("25px monospace", `${nomeJogador} adiquiriu ${pontuacao} pontos.`, 200);
  if (modoComputador) ganhador(pontuacao, pontuacaoComputador);
  salvaPontuacao(nomeJogador, pontuacao);
  listarRanking();
  gameOver = true;
}

//para definir no meio da tela a frase
function frase(font, frase, posicao) {
  context.font = font;
  let largura = (jogoWidth - context.measureText(frase).width) / 2;
  context.fillText(frase, largura, posicao);
}

//Faz a comparação com as pontuações e verifica quem ganhou
function ganhador(pt, ptC) {
  let ganhador =
    pt == ptC
      ? " Houve um empate "
      : pt > ptC
      ? "Você ganhou"
      : "O computador ganhou";
  frase("15px monospace", `${ganhador}`, 400);
}

//parte do jogador computador:
let modoComputador = false;

let jogadorComputadorWidth = 80;
let jogadorComputadorHeight = 10;
let jogadorComputadorSpeedX = 5; //Velocidade de movimento do jogador.
let pontuacaoComputador = 0;

let jogadorComputador = {
  x: jogoWidth / 2 - jogadorComputadorWidth / 2,
  y: jogoHeight - jogadorHeight - 5,
  width: jogadorComputadorWidth,
  height: jogadorComputadorHeight,
  velocityX: jogadorComputadorSpeedX,
};

//Bola do computador
let bolaCVelocityX = velocidadeBolaX;
let bolaCVelocityY = velocidadeBolaX;

let bolaComputador = {
  x: numAleatorio(0, jogoWidth - 10),
  y: jogoHeight / 2,
  width: bolaWidth,
  height: bolaHeight,
  velocityX: bolaCVelocityX,
  velocityY: bolaCVelocityY,
};
