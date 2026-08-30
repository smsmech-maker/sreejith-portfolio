/*
  Sreejith M S — Portfolio Analytics (GoatCounter)
  ---------------------------------------------------------------
  What this does:
  1. Tracks real pageviews on every page it's included on.
  2. Tracks resume PDF downloads as a separate "event" (not just a pageview).
  3. Excludes YOU (the owner) from both, once you've flagged your browser.

  SETUP — do this once:
  1. Go to https://www.goatcounter.com/ and click "Create an account".
     Free, no credit card. Pick a site code, e.g. "sreejith-portfolio"
     (this becomes your dashboard URL: sreejith-portfolio.goatcounter.com)
  2. Replace YOURCODE below (one line, marked clearly) with your real site code.
  3. Add this line to the <head> of EVERY page (index.html, field-notes.html,
     case-file-01.html, case-file-02.html, case-file-03.html):

       <script src="analytics.js"></script>

     Put analytics.js in the same folder as your other files.

  EXCLUDING YOURSELF FROM STATS:
  Visit your own site ONCE per browser/device using this link instead of the
  normal one:

       https://smsmech-maker.github.io/sreejith-portfolio/?me=1

  Bookmark that link and always use it when checking your own site. That
  browser is now permanently excluded (until you clear site data). Every
  other visitor is tracked normally with no extra step needed.
*/

(function () {
  // ============================================================
  // STEP 1 OF 1 YOU NEED TO EDIT: put your real GoatCounter code here
  // ============================================================
  var GOATCOUNTER_CODE = "sreejith-portfolio"; // <-- your real site code, already set
  // ============================================================

  var OWNER_KEY = "sreejith_portfolio_owner";

  function isOwner() {
    if (window.location.search.indexOf("me=1") !== -1) {
      try {
        localStorage.setItem(OWNER_KEY, "1");
      } catch (e) {}
    }
    try {
      return localStorage.getItem(OWNER_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  var owner = isOwner();
  window.__portfolioIsOwner = owner;

  if (owner) {
    // Owner detected: load nothing, track nothing. Silent no-op.
    return;
  }

  // Disable GoatCounter's automatic on-load pageview so we can fire it
  // ourselves after confirming this isn't the owner.
  window.goatcounter = { no_onload: true };

  // Load the GoatCounter script itself.
  var gcScript = document.createElement("script");
  gcScript.async = true;
  gcScript.src = "//gc.zgo.at/count.js";
  gcScript.setAttribute(
    "data-goatcounter",
    "https://" + GOATCOUNTER_CODE + ".goatcounter.com/count"
  );
  document.head.appendChild(gcScript);

  function trackPageview() {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({
        path: location.pathname + location.search,
        title: document.title,
      });
    } else {
      // Script not ready yet, try again shortly.
      setTimeout(trackPageview, 150);
    }
  }

  window.addEventListener("load", function () {
    trackPageview();
    attachDownloadTracking();
  });

  // Track any click on a link to a .pdf as a distinct "event", separate
  // from ordinary pageviews, so downloads show up clearly in GoatCounter.
  function attachDownloadTracking() {
    var links = document.querySelectorAll('a[href$=".pdf"]');
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (window.__portfolioIsOwner) return; // safety net, shouldn't hit
        var href = link.getAttribute("href");
        e.preventDefault();
        if (window.goatcounter && window.goatcounter.count) {
          window.goatcounter.count({
            path: "/downloads" + (href.indexOf("/") === 0 ? href : "/" + href),
            title: "Download: " + href,
            event: true,
          });
        }
        // Small delay so the tracking request has time to send before
        // the browser navigates to the PDF.
        setTimeout(function () {
          window.location.href = href;
        }, 250);
      });
    });
  }
})();
