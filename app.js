(function () {
  var app = document.getElementById("app");
  var viewControls = document.getElementById("viewControls");
  var viewButtons = Array.prototype.slice.call(document.querySelectorAll(".view-button"));
  var params = new URLSearchParams(window.location.search);
  var workId = params.get("work");
  var activeView = params.get("view") === "reader" ? "reader" : "gallery";
  var activePage = Math.max(0, parseInt(params.get("page") || "1", 10) - 1);
  var works = [];
  var currentWork = null;

  fetch("works.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load works.json");
      }
      return response.json();
    })
    .then(function (data) {
      works = Array.isArray(data.works) ? data.works : [];
      currentWork = works.find(function (work) {
        return work.id === workId;
      });

      if (workId && !currentWork) {
        renderError("Work not found.");
        return;
      }

      if (currentWork) {
        renderWork();
      } else {
        renderHome();
      }
    })
    .catch(function () {
      renderError("Could not load the manga list.");
    });

  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeView = button.getAttribute("data-view");
      activePage = Math.min(activePage, currentWork.pages.length - 1);
      updateUrl();
      renderWork();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (!currentWork || activeView !== "reader") {
      return;
    }

    if (event.key === "ArrowRight") {
      goToPage(activePage + 1);
    }

    if (event.key === "ArrowLeft") {
      goToPage(activePage - 1);
    }
  });

  function renderHome() {
    document.title = "paya8";
    viewControls.hidden = true;
    app.className = "app";

    if (!works.length) {
      app.innerHTML = '<h1 class="page-title">Works</h1><p class="empty">No works have been added yet.</p>' + renderDisclaimer();
      return;
    }

    app.innerHTML =
      '<h1 class="page-title">Works</h1>' +
      '<section class="works-grid">' +
      works.map(renderWorkCard).join("") +
      "</section>" +
      renderDisclaimer();
  }

  function renderWorkCard(work) {
    var pageCount = Array.isArray(work.pages) ? work.pages.length : 0;
    var thumbnail = pageCount ? work.pages[0] : "";

    return (
      '<article class="work-card-wrap">' +
      '<a class="work-card" href="?work=' + encodeURIComponent(work.id) + '">' +
      '<img class="work-thumb" src="' + escapeHtml(thumbnail) + '" alt="">' +
      '<h2 class="work-title">' + escapeHtml(work.title) + "</h2>" +
      '<p class="work-meta">' + pageCount + " pages</p>" +
      "</a>" +
      '<a class="download-link" href="' + escapeHtml(work.download || "#") + '" download>Download zip</a>' +
      "</article>"
    );
  }

  function renderWork() {
    document.title = currentWork.title + " - paya8";
    viewControls.hidden = false;
    setActiveViewButton();

    if (!Array.isArray(currentWork.pages) || !currentWork.pages.length) {
      app.innerHTML = '<h1 class="page-title">' + escapeHtml(currentWork.title) + '</h1><p class="empty">No pages have been added for this work yet.</p>';
      return;
    }

    activePage = Math.min(Math.max(activePage, 0), currentWork.pages.length - 1);
    app.className = activeView === "reader" ? "app app-reader" : "app";

    if (activeView === "reader") {
      renderReader();
    } else {
      renderGallery();
    }
  }

  function renderGallery() {
    app.innerHTML =
      '<h1 class="page-title">' + escapeHtml(currentWork.title) + "</h1>" +
      '<section class="gallery">' +
      currentWork.pages.map(function (page, index) {
        return '<button class="gallery-item" type="button" data-page="' + index + '" aria-label="Open page ' + (index + 1) + ' in reader"><img class="gallery-image" src="' + escapeHtml(page) + '" alt="Page ' + (index + 1) + '" loading="lazy"></button>';
      }).join("") +
      "</section>";

    Array.prototype.slice.call(app.querySelectorAll(".gallery-item")).forEach(function (button) {
      button.addEventListener("click", function () {
        openReaderAt(parseInt(button.getAttribute("data-page"), 10));
      });
    });
  }

  function renderReader() {
    var page = currentWork.pages[activePage];
    app.innerHTML =
      '<section class="reader">' +
      '<button class="reader-button prev" type="button" aria-label="Previous page">&lsaquo;</button>' +
      '<img class="reader-image" src="' + escapeHtml(page) + '" alt="Page ' + (activePage + 1) + '">' +
      '<button class="reader-button next" type="button" aria-label="Next page">&rsaquo;</button>' +
      '<div class="reader-count">' + (activePage + 1) + " / " + currentWork.pages.length + "</div>" +
      "</section>";

    app.querySelector(".reader-image").addEventListener("click", function () {
      goToPage(activePage + 1);
    });
    app.querySelector(".reader-button.prev").addEventListener("click", function () {
      goToPage(activePage - 1);
    });
    app.querySelector(".reader-button.next").addEventListener("click", function () {
      goToPage(activePage + 1);
    });
  }

  function goToPage(nextPage) {
    if (!currentWork.pages.length) {
      return;
    }

    activePage = Math.min(Math.max(nextPage, 0), currentWork.pages.length - 1);
    updateUrl();
    renderReader();
  }

  function openReaderAt(pageIndex) {
    activeView = "reader";
    activePage = Math.min(Math.max(pageIndex, 0), currentWork.pages.length - 1);
    updateUrl();
    renderWork();
  }

  function updateUrl() {
    var nextParams = new URLSearchParams();
    nextParams.set("work", currentWork.id);
    nextParams.set("view", activeView);

    if (activeView === "reader") {
      nextParams.set("page", String(activePage + 1));
    }

    history.replaceState(null, "", "?" + nextParams.toString());
  }

  function setActiveViewButton() {
    viewButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-view") === activeView);
    });
  }

  function renderError(message) {
    viewControls.hidden = true;
    app.innerHTML = '<p class="error">' + escapeHtml(message) + ' <a href="./">Return home</a>.</p>';
  }

  function renderDisclaimer() {
    return '<p class="disclaimer">Disclaimer: All works here are produced by paya8 at <a href="https://www.fanbox.cc/@paya8">https://www.fanbox.cc/@paya8</a>. Support the creator there. I will only host English translations that I produce. I can be contacted at <a href="mailto:f00l2642@gmail.com">f00l2642@gmail.com</a></p>';
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
