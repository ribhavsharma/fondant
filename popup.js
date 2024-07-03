let isEnabled = false;

chrome.storage.local.get(["enabled"], (result) => {
  isEnabled = result.enabled || false;
  updateButtonText();
});

document.getElementById("btn").addEventListener("click", () => {
  isEnabled = !isEnabled;
  chrome.storage.local.set({ enabled: isEnabled }, () => {
    const action = isEnabled ? "enable" : "disable";
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: action });
      });
    });
    updateButtonText();
  });
});

function updateButtonText() {
  const button = document.getElementById("btn");
  button.textContent = isEnabled ? "Disable Tooltip" : "Enable Tooltip";
}
