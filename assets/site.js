/* Duck River Concrete Texas site script: gallery, quote form, click tracking, cookie consent. */
(function(){
  /* Send an analytics event only if the visitor accepted analytics (gtag exists). */
  function track(name, params){ if(window.gtag){ try{ window.gtag("event", name, params || {}); }catch(e){} } }

  /* Call and text taps. */
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("a");
    if(!a) return;
    var h = a.getAttribute("href") || "";
    if(h.indexOf("tel:") === 0) track("phone_click", {link_location: a.dataset.loc || "page"});
    else if(h.indexOf("sms:") === 0) track("text_click", {link_location: a.dataset.loc || "page"});
  });

  /* Gallery filters. */
  var items = document.querySelectorAll(".gallery a");
  document.querySelectorAll(".filters button").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelectorAll(".filters button").forEach(function(x){ x.classList.remove("on"); });
      b.classList.add("on");
      var f = b.getAttribute("data-f");
      items.forEach(function(a){
        a.hidden = !(f === "all" || (" " + a.getAttribute("data-c") + " ").indexOf(" " + f + " ") > -1);
      });
    });
  });

  /* Photo viewer. */
  var dlg = document.getElementById("viewer");
  if(dlg && dlg.showModal){
    var big = dlg.querySelector("img");
    items.forEach(function(a){
      a.addEventListener("click", function(e){
        e.preventDefault();
        big.src = a.getAttribute("href");
        big.alt = a.querySelector("img").alt;
        dlg.showModal();
      });
    });
    dlg.querySelector(".close").addEventListener("click", function(){ dlg.close(); });
    dlg.addEventListener("click", function(e){ if(e.target === dlg || e.target === big) dlg.close(); });
  }

  /* Quote form (Formspree). */
  document.querySelectorAll("form.lead-form").forEach(function(form){
    if(!window.fetch) return;
    var box = form.parentNode;
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var btn = form.querySelector(".submit"); btn.disabled = true; btn.textContent = "Sending…";
      fetch(form.action, {method:"POST", body:new FormData(form), headers:{"Accept":"application/json"}})
        .then(function(r){
          if(!r.ok) throw new Error();
          form.hidden = true;
          box.querySelector(".form-thanks").hidden = false;
          track("generate_lead", {form_page: location.pathname});
        })
        .catch(function(){
          btn.disabled = false; btn.textContent = "Send";
          box.querySelector(".form-error").hidden = false;
        });
    });
  });

  /* Analytics load ONLY after a visitor clicks Accept. */
  var GA_ID = "G-YPLW0ZJBNJ";
  var KEY = "drc-cookie-consent";
  var banner = document.getElementById("consent");
  if(!GA_ID || !banner) return;
  var linkWrap = document.getElementById("cookie-link-wrap");
  if(linkWrap) linkWrap.hidden = false;
  function get(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function set(v){ try{ localStorage.setItem(KEY, v); }catch(e){} }
  function loadAnalytics(){
    if(window.__gaLoaded) return; window.__gaLoaded = true;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }
  function clearAnalyticsCookies(){
    document.cookie.split(";").forEach(function(c){
      var name = c.split("=")[0].trim();
      if(/^_ga/.test(name) || /^_gid/.test(name)){
        var host = location.hostname, parts = host.split(".");
        [host, "." + host, "." + parts.slice(-2).join(".")].forEach(function(d){
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + d;
        });
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }
    });
  }
  var choice = get();
  if(choice === "granted") loadAnalytics();
  else if(choice !== "denied") banner.hidden = false;
  document.getElementById("consent-accept").addEventListener("click", function(){
    set("granted"); banner.hidden = true; loadAnalytics();
  });
  document.getElementById("consent-deny").addEventListener("click", function(){
    var wasOn = window.__gaLoaded;
    set("denied"); banner.hidden = true; clearAnalyticsCookies();
    if(wasOn) location.reload();
  });
  var cs = document.getElementById("cookie-settings");
  if(cs) cs.addEventListener("click", function(){ banner.hidden = false; });
})();
