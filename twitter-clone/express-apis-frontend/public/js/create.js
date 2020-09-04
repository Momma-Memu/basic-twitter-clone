const form = document.querySelector(".create-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const message = formData.get("message");
  const userId = localStorage.getItem('TWITTER_LITE_CURRENT_USER_ID')
  const body = { message, userId };
  try {
    const res = await fetch("http://localhost:8080/tweets", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem(
        "TWITTER_LITE_ACCESS_TOKEN"
        )}`,
      },
      body: JSON.stringify(body)
    });

    if(res.ok) {
      window.location.href = "/"
      return
  }

    if (res.status === 401) {
      window.location.href = "/users";
      return;
    }

    const { tweets } = await res.json();

    const tweetsContainer = document.querySelector("#tweets-container");
    const tweetsHtml = tweets.map(
      ({ message, id }) => `
      <div class="card" id="tweet-${id}">
        <div class="card-body">
          <p class="card-text">${message}</p>
        </div>
      </div>
    `
    );
    tweetsContainer.innerHTML = tweetsHtml.join("");
  } catch (err) {
    if (err.status >= 400 && err.status < 600) {
      const errorJSON = await err.json();
      const errorsContainer = document.querySelector(".errors-container");
      let errorsHtml = [
        `
        <div class="alert alert-danger">
            Something went wrong. Please try again.
        </div>
      `,
      ];
      const { errors } = errorJSON;
      if (errors && Array.isArray(errors)) {
        errorsHtml = errors.map(
          (message) => `
          <div class="alert alert-danger">
              ${message}
          </div>
        `
        );
      }
      errorsContainer.innerHTML = errorsHtml.join("");
    } else {
      alert(
        "Something went wrong. Please check your internet connection and try again!"
      );
    }
  }
});