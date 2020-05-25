(function () {
  let Code = {
    SUCCESS: 200,
  };
  let Popups = {
    main: 'form',
    success: 'message--success',
    error: 'message--error',
  };
  let Url = {
    SEND: 'http://httpbin.org/post',
  };
  const KeyCode = {
    ESC: 27,
  };

  const TIMEOUT = 10000;
  const TIMEOUT_HIDE_POPUP = 750; // ms
  let btnOpenModal = document.querySelector('.contacts__button'),
    body = document.querySelector('body'),
    scrollY;

  function request(onLoad, onError) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.addEventListener('load', function () {
      if (xhr.status === Code.SUCCESS) {
        onLoad(xhr.response);
      } else {
        onError('Статус ответа: ' + xhr.status + ' ' + xhr.statusText);
      }
    });
    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения');
    });
    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });

    xhr.timeout = TIMEOUT;
    return xhr;
  }

  function save(data, onLoad, onError) {
    var xhr = request(onLoad, onError);

    xhr.open('POST', Url.SEND);
    xhr.send(data);
  }

  function getScrollbarWidth() {
    let div = document.createElement('div');

    div.style.overflowY = 'scroll';
    div.style.width = '50px';
    div.style.height = '50px';

    document.body.appendChild(div);
    let scrollWidth = div.offsetWidth - div.clientWidth;

    document.body.removeChild(div);
    return scrollWidth;
  }

  function getObjModal(selector) {
    let obj = {};
    obj.popup = document.querySelector('.' + selector);
    obj.main_popup = document.querySelector('.' + selector + ' .' + Popups.main);
    obj.success = document.querySelector('.' + selector + ' .' + Popups.success);
    obj.error = document.querySelector('.' + selector + ' .' + Popups.error);
    obj.closeBtn = document.querySelector('.' + selector + ' button[type = "reset"]');
    obj.submitBtn = document.querySelector('.' + selector + ' button[type = "submit"]');
    obj.form = document.querySelector('.' + selector + ' form');
    return obj;
  }

  function validateInput(item) {
    const reg = /[-.\w]+@([\w-]+\.)+[\w-]+/g;

    if (item.value.trim() == '') {
      return 'Fill in this field';
    }
    if (item.id === 'your_email' && !reg.test(item.value)) {

      return 'Enter a correct email address';
    }
    return false;
  }

  function checkFrom(form) {
    let formObj = {};
    formObj.name = form.querySelector('#your_name');
    formObj.email = form.querySelector('#your_email');
    formObj.message = form.querySelector('#your_message');
    for (let key in formObj) {
      let span = document.createElement('span');
      span.textContent = validateInput(formObj[key]);
      let label = form.querySelector('[for = ' + formObj[key].id + ']');
      if (span.textContent !== 'false' && !label.querySelector('span')) {
        label.appendChild(span);
      }
    }

    if (!form.querySelectorAll('label span').length) {
      return true;
    }
  }

  function removePlaceholder(evt) {
    let placeholder = evt.target.parentNode.querySelector('[for = ' + evt.target.id + '] span');
    if (placeholder) {
      return placeholder.remove();
    }
  }

  function successHandler() {
    let modal = getObjModal('modal');
    modal.main_popup.classList.remove('modal__content--open');
    modal.main_popup.classList.add('modal__content--close');
    modal.main_popup.classList.remove('modal__content--close');
    modal.form.reset();
    modal.success.classList.add('modal__content--open');

    let successButtonClose = modal.success.querySelector('.message__btn');

    function closeSuccessMessage() {
      successButtonClose.removeEventListener('click', closeSuccessMessage);
      closeModal();
    }

    successButtonClose.addEventListener('click', closeSuccessMessage);
  };

  function errorHandler() {
    let modal = getObjModal('modal');
    modal.main_popup.classList.remove('modal__content--open');
    modal.error.classList.add('modal__content--open');

    let errorAgainBtn = modal.error.querySelector('.message__btn');
    let errorCloseBtn = modal.error.querySelector('.message__close');


    function closeErrorMessage() {
      errorCloseBtn.removeEventListener('click', closeErrorMessage);
      modal.form.reset();
      closeModal();
    };

    function tryAgain() {
      modal.error.classList.remove('modal__content--open');
      modal.main_popup.classList.add('modal__content--open');
      errorAgainBtn.removeEventListener('click', tryAgain);
    };

    errorAgainBtn.addEventListener('click', tryAgain);
    errorCloseBtn.addEventListener('click', closeErrorMessage);
  }

  function pressSubmitBtn(evt) {
    evt.preventDefault();

    if (checkFrom(evt.target)) {
      save(new FormData(evt.target), successHandler, errorHandler);
    }
  }

  function closeModal() {
    let modal = getObjModal('modal');
    modal.popup.classList.remove('modal--open');
    modal.popup.classList.add('modal--close');
    if (modal.main_popup.classList.contains('modal__content--open')) {
      modal.main_popup.classList.remove('modal__content--open');
      modal.main_popup.classList.add('modal__content--close');
    } else if (modal.success.classList.contains('modal__content--open')) {
      modal.success.classList.remove('modal__content--open');
      modal.success.classList.add('modal__content--close');
    } else if (modal.error.classList.contains('modal__content--open')) {
      modal.error.classList.remove('modal__content--open');
      modal.error.classList.add('modal__content--close');
    }

    document.removeEventListener('click', closeModalHandler);
    document.removeEventListener('keydown', closeModalEsc);

    setTimeout(function () {
      document.querySelector('main').removeChild(modal.popup)
      body.classList.remove('body_modal');
      body.style.paddingRight = 0;
      window.scrollTo(0, parseInt(scrollY || '0', 10));
    }, TIMEOUT_HIDE_POPUP);
  }

  function closeModalEsc(evt) {
    if (evt.keyCode === KeyCode.ESC) {
      closeModal();
    }
  };

  function closeModalHandler(evt) {
    if (evt.target.classList.contains('modal')) {
      closeModal();
    }
  };

  function openModal(evt) {
    scrollY = window.pageYOffset;
    evt.preventDefault();
    body.style.paddingRight = getScrollbarWidth() + 'px';
    body.style.top = '-' + scrollY + 'px';
    body.classList.add('body_modal');


    let similarPopup = document.querySelector('#popup')
      .content
      .querySelector('.modal');
    let popup = similarPopup.cloneNode(true);
    document.querySelector('main').appendChild(popup);

    let modal = getObjModal('modal');
    modal.popup.classList.add('modal--open');
    modal.main_popup.classList.add('modal__content--open');

    let inputs = modal.popup.querySelectorAll('input, textarea')

    modal.closeBtn.addEventListener('click', closeModal);
    document.addEventListener('click', closeModalHandler);
    document.addEventListener('keydown', closeModalEsc);
    modal.form.addEventListener('submit', pressSubmitBtn);

    inputs.forEach(function (input) {
      input.addEventListener('input', removePlaceholder);
    });
  }

  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', openModal);
  }

})();
