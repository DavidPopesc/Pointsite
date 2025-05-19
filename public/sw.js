self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
  });
  
  self.addEventListener('fetch', function (e) {
    // Optionally handle requests
  });