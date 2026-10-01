/* DataInvent shared component loader
   Loads header.html and footer.html, then loads js/main.js only after the
   shared navigation/footer elements exist in the DOM. */
(function () {
  'use strict';

  function loadFragment(targetId, fileName) {
    var target = document.getElementById(targetId);
    if (!target) return Promise.resolve();

    return fetch(fileName, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load ' + fileName + ': HTTP ' + response.status);
        }
        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;
      });
  }

  function loadSharedBehaviours() {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'js/main.js';
      script.onload = function () {
        /* main.js may register DOMContentLoaded handlers. Components are now
           present, so emit the event once for those deferred initializers. */
        document.dispatchEvent(new Event('DOMContentLoaded'));
        resolve();
      };
      script.onerror = function () {
        reject(new Error('Unable to load js/main.js'));
      };
      document.body.appendChild(script);
    });
  }

  function showLoadError(error) {
    console.error('[DataInvent components]', error);
  }

  function initializeComponents() {
    Promise.all([
      loadFragment('site-header', 'header.html'),
      loadFragment('site-footer', 'footer.html')
    ])
      .then(loadSharedBehaviours)
      .catch(showLoadError);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents, { once: true });
  } else {
    initializeComponents();
  }
})();
