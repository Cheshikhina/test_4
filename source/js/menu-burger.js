'use strict';
(function () {
  const KeyCode = {
    ESC: 27,
  };

  let buttonMenu = document.querySelector('.header__button'),
    body = document.querySelector('body');

  const closeMenuEsc = function (evt) {
    if (evt.keyCode === KeyCode.ESC) {
      toggleMenu();
    }
  };

  const closeMenuHandler = function (evt) {
    if (evt.target === body || evt.target.tagName === 'BUTTON' || evt.target.tagName === 'A') {
      toggleMenu();
    }
  };

  const toggleMenu = function () {
    if (buttonMenu.classList.contains('header__button--open')) {
      buttonMenu.classList.remove('header__button--open');
      body.classList.remove('body_hidden');
      document.removeEventListener('keydown', closeMenuEsc);
      document.removeEventListener('mousedown', closeMenuHandler);
    } else {
      body.style.top = 0;
      buttonMenu.classList.add('header__button--open');
      body.classList.add('body_hidden');
      document.addEventListener('keydown', closeMenuEsc);
      document.addEventListener('mousedown', closeMenuHandler);
    }
  };

  if (buttonMenu) {
    buttonMenu.addEventListener('click', toggleMenu);
  }
})();
