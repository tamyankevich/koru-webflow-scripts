//Logos List
document.addEventListener('DOMContentLoaded', function () {
  var list = document.querySelector('.logos__list');
  if (!list) return;

  var allItems = Array.from(list.querySelectorAll('.logo__item'));
  var colorItems = allItems.filter(function (el) {
    return el.dataset.color === '01';
  });
  var otherItems = allItems.filter(function (el) {
    return el.dataset.color !== '01';
  });

  // Build the reordered list: even positions (2, 4, 6...) get color=01 items
  // Index is 1-based, so even = index % 2 === 0
  var totalItems = allItems.length;
  var result = [];
  var colorIdx = 0;
  var otherIdx = 0;

  for (var i = 1; i <= totalItems; i++) {
    if (i % 2 === 0 && colorIdx < colorItems.length) {
      result.push(colorItems[colorIdx++]);
    } else if (otherIdx < otherItems.length) {
      result.push(otherItems[otherIdx++]);
    } else {
      result.push(colorItems[colorIdx++]);
    }
  }

  result.forEach(function (el) {
    list.appendChild(el);
  });
});



//Swiper Slider
function initSwiperSlider() {  
  new Swiper('.swiper', {
  //effect: 'coverflow',
  grabCursor: true,
  //loop: true,
  centeredSlides: true,
  slidesPerView: 'auto',
//   coverflowEffect: {
//     rotate: 0,
//     stretch: 0,
//     depth: 100,
//     modifier: 1,
//     slideShadows: false,
//   },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  on: {
    slideChange: function() {
      const active = this.slides[this.activeIndex];
      document.querySelector('.member-name').textContent = active.dataset.name;
      document.querySelector('.member-title').textContent = active.dataset.title;
      document.querySelector('.member-bio').textContent = active.dataset.bio;
    }
  }
});
}

// Initialize Swiper Slider Setup
document.addEventListener('DOMContentLoaded', () => {
  initSwiperSlider();
});

