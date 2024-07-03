let isPopupPinned = false;
const API = "https://fondl-api.vercel.app";

const enableScript = () => {
  document.addEventListener("mouseover", mouseOverHandler);
};

const disableScript = () => {
  document.removeEventListener("mouseover", mouseOverHandler);
  const existingPopup = document.getElementById("font-popup");
  if (existingPopup) {
    existingPopup.remove();
  }
};

const mouseOverHandler = (event) => {
  let element = event.target;

  if (element.nodeType === Node.TEXT_NODE && element.nodeValue.trim() !== "") {
    element = element.parentNode;
  }

  while (
    element &&
    element.nodeType === Node.ELEMENT_NODE &&
    !element.textContent.trim()
  ) {
    element = element.parentNode;
  }

  if (
    element &&
    element.nodeType === Node.ELEMENT_NODE &&
    element.textContent.trim() !== ""
  ) {
    let fontFamily = window
      .getComputedStyle(element)
      .fontFamily.split(",")[0]
      .replace(/[^a-zA-Z ]/g, "")
      .trim();
    let existingPopup = document.getElementById("font-popup");

    if (existingPopup && !isPopupPinned) {
      existingPopup.remove();
    }

    if (!existingPopup || (existingPopup && !isPopupPinned)) {
      let popup = document.createElement("div");
      popup.id = "font-popup";
      popup.style.position = "absolute";
      popup.style.backgroundColor = "#f9f9f9";
      popup.style.borderRadius = "8px";
      popup.style.padding = "1em";
      popup.style.zIndex = "1000";
      popup.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
      popup.style.cursor = "default";
      popup.style.display = "flex";
      popup.style.flexDirection = "column";
      popup.style.justifyContent = "space-between";
      popup.style.fontFamily = fontFamily;
      popup.style.fontSize = "14px";
      popup.style.color = "#333";

      popup.innerHTML = `
                <div style="display: flex; flex-direction: row; gap: 3rem; width: 100%;">
                    <div style="flex-grow: 1;">
                        <p style="margin: 0 0 5px; font-weight: bold; color: black; font-size: 2rem;">${fontFamily}</p>
                        <a id="dafont-link" href="#" target="_blank" style="color: #146EF5; text-decoration: none;">Download from DaFont</a><br>
                        <a id="befont-link" href="#" target="_blank" style="color: #146EF5; text-decoration: none;">Download from BeFonts (slower)</a>
                    </div>
                    <div style="cursor: pointer; color: #146EF5;" id="close-popup">✖</div>
                </div>
                <div id="font-results" style="display: none; flex-direction: column; gap: 10px; width: 100%; margin-top: 10px;"></div>
            `;

      document.body.appendChild(popup);
      element.style.cursor = "default";

      function updatePopupPosition(e) {
        if (!e.clientX || !e.clientY) return;
        popup.style.top = `${e.clientY + 10 + window.scrollY}px`;
        popup.style.left = `${e.clientX + 10 + window.scrollX}px`;
      }

      updatePopupPosition(event);

      element.addEventListener("mousemove", function moveHandler(e) {
        if (!isPopupPinned) {
          updatePopupPosition(e);
        }
      });

      element.addEventListener("click", function () {
        isPopupPinned = !isPopupPinned;
        if (!isPopupPinned) {
          element.style.cursor = "";
          element.removeEventListener("mousemove", updatePopupPosition);
        }
      });

      element.addEventListener("mouseout", function () {
        if (!isPopupPinned) {
          popup.remove();
          element.style.cursor = "";
          element.removeEventListener("mousemove", updatePopupPosition);
        }
      });

      popup
        .querySelector("#close-popup")
        .addEventListener("click", function () {
          popup.remove();
          isPopupPinned = false;
          element.style.cursor = "";
          element.removeEventListener("mousemove", updatePopupPosition);
        });

      async function fetchAndDisplayFonts(source) {
        const apiUrl = `${API}/download?fontName=${encodeURIComponent(fontFamily)}&source=${source}`;
        try {
          const fontResultsDiv = document.getElementById("font-results");
          fontResultsDiv.innerHTML = '<p style="color: #333;">Loading...</p>';
          fontResultsDiv.style.display = "flex";
          const response = await fetch(apiUrl);
          const fonts = await response.json();

          if (fonts.length > 0) {
            fontResultsDiv.innerHTML = '<p style="color: #333;">Results:</p>';
            fontResultsDiv.innerHTML += fonts
              .slice(0, 5)
              .map(
                (font) => `
                            <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; color: #333;">
                                <img src="${font.preview_img}" alt="${font.name}" style="width: 50px; height: auto; border-radius: 4px;">
                                <div>
                                    <p style="margin: 0; font-weight: bold; color:black">${font.name}</p>
                                    <a href="${font.download_link}" target="_blank" style="color: #146EF5; text-decoration: none;">Download</a>
                                </div>
                            </div>
                        `,
              )
              .join("");
          } else {
            fontResultsDiv.innerHTML =
              '<p style="color: #333;">No fonts found.</p>';
          }
        } catch (error) {
          console.error(`Error fetching fonts from ${source}:`, error);
          const fontResultsDiv = document.getElementById("font-results");
          fontResultsDiv.innerHTML =
            '<p style="color: #333;">Error fetching fonts.</p>';
        }
      }

      popup
        .querySelector("#dafont-link")
        .addEventListener("click", async function (e) {
          e.preventDefault();
          await fetchAndDisplayFonts("dafont");
        });

      popup
        .querySelector("#befont-link")
        .addEventListener("click", async function (e) {
          e.preventDefault();
          await fetchAndDisplayFonts("befonts");
        });
    }
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "enable") {
    enableScript();
  } else if (message.action === "disable") {
    disableScript();
  }
});

chrome.storage.local.get(["enabled"], (result) => {
  if (result.enabled) {
    enableScript();
  }
});
