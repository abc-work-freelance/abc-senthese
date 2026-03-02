self.addEventListener("push", function (event) {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    // ignore malformed payloads
  }

  const title = data.title || "ABC App update";
  const body = data.body || "There was an update.";

  const options = {
    body,
    data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

