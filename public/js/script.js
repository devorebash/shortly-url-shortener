const longUrl = document.getElementById("longUrl");
const shortenBtn = document.getElementById("shortenBtn");

longUrl.addEventListener("input", () => {
  shortenBtn.disabled = longUrl.value.trim() === "";
});

const shortUrl = document.getElementById("shortUrl");
const copyBtn = document.getElementById("copyBtn");
const resultPanel = document.getElementById("resultPanel");

const observer = new MutationObserver(() => {
  const link = shortUrl.textContent.trim();

  if (link !== "") {
    resultPanel.classList.add("show");
  } else {
    resultPanel.classList.remove("show");
  }

  if (link.startsWith("http://") || link.startsWith("https://")) {
    copyBtn.classList.add("show");
  } else {
    copyBtn.classList.remove("show");
  }
});

observer.observe(shortUrl, {
  childList: true,
  characterData: true,
  subtree: true,
});

copyBtn.addEventListener("click", async () => {
  const link = shortUrl.textContent.trim();

  try {
    await navigator.clipboard.writeText(link);
    copyBtn.textContent = "Copied!";
  } catch (error) {
    console.error("Copy failed:", error);
    copyBtn.textContent = "Copy failed";
  }
});

shortenBtn.addEventListener("click", async () => {
  const url = longUrl.value.trim();

  shortenBtn.disabled = true;
  shortenBtn.textContent = "Creating...";

  try {
    const response = await fetch("/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullUrl: url,
      }),
    });

    const data = await response.json();

    console.log("Server response:", data);

    if (!response.ok) {
      shortUrl.textContent = data.message;
      return;
    }

    shortUrl.textContent = data.shortUrl;
    copyBtn.textContent = "Copy";
  } catch (error) {
    console.error(error);
    shortUrl.textContent = "Something went wrong!";
  } finally {
    shortenBtn.disabled = longUrl.value.trim() === "";
    shortenBtn.textContent = "Shorten URL";
  }
});
