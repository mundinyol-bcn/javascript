// music.js
// https://magradacatalunya.com/

const basePath = 'https://magradacatalunya.com/A-diapositiva/';

const musicFiles = [
    new URL('music/japanese-businessman.mp3', basePath).toString(),
    new URL('music/tenshinoyume.mp3', basePath).toString(),
    new URL('music/candybouquet.mp3', basePath).toString(),
    new URL('music/koharubiyori.mp3', basePath).toString(),
    new URL('music/natsuetsudukumichi.mp3', basePath).toString(),
    new URL('music/music3.mp3', basePath).toString()
];

const music = document.getElementById('backgroundMusic');
const button = document.getElementById('controlButton');

let isPlaying = false;

function getRandomMusic() {
    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    return musicFiles[randomIndex];
}

button.addEventListener('click', () => {
    if (isPlaying) {
        music.pause();
        button.textContent = 'MUSIC ON';
    } else {
        music.src = getRandomMusic();
        music.play();
        button.textContent = 'MUSIC OFF';
    }
    isPlaying = !isPlaying;
});
