// slideshow.js
// https://magradacatalunya.com/

const imagesSlideshow = [
	'https://magradacatalunya.com/photo_gallery/i.php?/upload/2020/04/17/20200417225531-63071721-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2020/04/17/20200417225516-a1407a16-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2020/04/17/20200417230605-9c38bcf4-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2020/04/17/20200417230619-031ad8d3-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2021/12/08/20211208150648-45cf91fb-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2021/12/08/20211208150749-b08dc90b-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/i.php?/upload/2020/04/18/20200418002911-add2f93d-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/i.php?/upload/2020/04/18/20200418002752-24007619-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2021/12/08/20211208150724-515140d1-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2020/04/18/20200418003805-14e592d4-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2020/04/18/20200418003754-39b9bce7-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2020/04/17/20200417220259-257ec2b3-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/i.php?/upload/2020/04/17/20200417220140-4927738c-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2020/04/17/20200417220127-21000789-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/i.php?/upload/2020/04/17/20200417223725-26f6df3f-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/i.php?/upload/2020/04/17/20200417223751-382d36ce-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/_data/i/upload/2020/04/17/20200417223738-1076df73-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/i.php?/upload/2020/04/17/20200417223711-f12f71ba-xx.jpg',
	'https://magradacatalunya.com/photo_gallery/i.php?/upload/2020/04/17/20200417223908-55a2491d-xx.jpg',
	'https://magradacatalunya.com/A-diapositiva/last-picture.jpg' // 最後の画像
];

let slideshowIndex = 0;
let slideshowInterval = null;

function startSlideShow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }
    slideshowInterval = setInterval(nextSlide, 3200);
}

function stopSlideShow() {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
}

function nextSlide() {
    slideshowIndex = (slideshowIndex + 1) % imagesSlideshow.length;
    updateSlideshowBackground();
}

function prevSlide() {
    slideshowIndex = (slideshowIndex - 1 + imagesSlideshow.length) % imagesSlideshow.length;
    updateSlideshowBackground();
}

function updateSlideshowBackground() {
    const slideshow = document.getElementById('slideshow');
    if (slideshow) {
        slideshow.style.backgroundImage = `url(${imagesSlideshow[slideshowIndex]})`;
    } else {
        console.error("No se encuentra diapositiva");
    }
}


function initSlideshow() {
    updateSlideshowBackground();
    startSlideShow();
}

document.addEventListener("DOMContentLoaded", initSlideshow);
