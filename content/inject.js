// inject.js — messageDisplayScript
//
// S'exécute dans le contexte du message affiché (CSP restrictive).
// Insère un conteneur sous le corps du message, contenant un iframe pointant
// vers la page extension viewer.html (CSP normale, PDF.js OK).
//
// La communication inject ↔ viewer passe par postMessage (window.parent / iframe).
// La communication inject ↔ background passe par runtime.sendMessage.

(function () {
  const CONTAINER_ID = "apercu-pj-container";
  const IFRAME_ID = "apercu-pj-iframe";
  const TOGGLE_ID = "apercu-pj-toggle";
  const COLLAPSED_KEY = "apercu-pj-collapsed";

  let currentMessageId = null;
  let currentPdfs = [];
  let currentSettings = null;

  // -------- UI : conteneur + bouton repli --------

  function ensureContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (container) return container;

    container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.setAttribute("data-collapsed", "false");

    const header = document.createElement("div");
    header.id = "apercu-pj-header";

    const title = document.createElement("span");
    title.id = "apercu-pj-title";
    title.textContent = "Aperçu PDF";
    header.appendChild(title);

    const toggle = document.createElement("button");
    toggle.id = TOGGLE_ID;
    toggle.type = "button";
    toggle.textContent = "▼";
    toggle.title = "Replier / déplier l'aperçu";
    toggle.addEventListener("click", toggleCollapsed);
    header.appendChild(toggle);

    const iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.src = browser.runtime.getURL("viewer/viewer.html");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");

    container.appendChild(header);
    container.appendChild(iframe);
    document.body.appendChild(container);

    // Restaure l'état replié depuis localStorage (sessionStorage est vidé
    // entre messages, localStorage persiste).
    try {
      const collapsed = localStorage.getItem(COLLAPSED_KEY) === "1";
      if (collapsed) setCollapsed(container, true);
    } catch (_) { /* localStorage peut être bloqué selon CSP */ }

    return container;
  }

  function setCollapsed(container, collapsed) {
    container.setAttribute("data-collapsed", collapsed ? "true" : "false");
    const toggle = document.getElementById(TOGGLE_ID);
    if (toggle) toggle.textContent = collapsed ? "▶" : "▼";
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch (_) {}
  }

  function toggleCollapsed() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;
    const isCollapsed = container.getAttribute("data-collapsed") === "true";
    setCollapsed(container, !isCollapsed);
  }

  function removeContainer() {
    const c = document.getElementById(CONTAINER_ID);
    if (c) c.remove();
  }

  // -------- Communication avec le viewer (postMessage) --------

  function sendToViewer(payload) {
    const iframe = document.getElementById(IFRAME_ID);
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(payload, "*");
  }

  // Quand l'iframe nous signale qu'elle est prête, on lui pousse l'état courant.
  window.addEventListener("message", (event) => {
    if (event.data?.type === "viewerReady") {
      pushStateToViewer();
    }
  });

  function pushStateToViewer() {
    if (currentMessageId === null) return;
    sendToViewer({
      type: "showPdfs",
      messageId: currentMessageId,
      pdfs: currentPdfs,
      settings: currentSettings,
    });
  }

  // -------- Réception depuis le background --------

  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type !== "pdfsFound") return;
    currentMessageId = msg.messageId;
    currentPdfs = msg.pdfs || [];
    currentSettings = msg.settings || {};

    if (currentPdfs.length === 0) {
      removeContainer();
      return;
    }
    ensureContainer();
    pushStateToViewer();
  });

  // Au chargement initial, le content script peut arriver après l'event
  // onMessageDisplayed → on redemande l'état au background.
  browser.runtime
    .sendMessage({ type: "requestPdfs" })
    .then((res) => {
      if (!res?.ok || !res.pdfs?.length) return;
      currentMessageId = res.messageId;
      currentPdfs = res.pdfs;
      currentSettings = res.settings || {};
      ensureContainer();
      pushStateToViewer();
    })
    .catch(() => { /* ignore */ });
})();
