(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function() {
    var TrelloProfile;
    TrelloProfile = (function() {
      function TrelloProfile(config) {
        this.config = config;
        this.addTimer = __bind(this.addTimer, this);
        this.projectNameSelector = "title:first";
        this.boardNameSelector = ".board-name";
        this.cardNameSelector = ".window-title-text";
        this.actionSelector = ".other-actions .u-clearfix";
        this.platformLoaded = false;
        this.loadHarvestPlatform();
        this.addTimerWhenUrlChanges();
      }

      TrelloProfile.prototype.loadHarvestPlatform = function() {
        var configScript, ph, platformConfig, platformScript,
          _this = this;
        platformConfig = {
          applicationName: "Trello",
          permalink: "https://trello.com/c/%ITEM_ID%",
          environment: "production",
          skipStyling: true
        };
        configScript = document.createElement("script");
        configScript.innerHTML = "window._harvestPlatformConfig = " + (JSON.stringify(platformConfig)) + ";";
        platformScript = document.createElement("script");
        platformScript.src = "//platform.harvestapp.com/assets/platform.js";
        platformScript.async = true;
        ph = document.getElementsByTagName("script")[0];
        ph.parentNode.insertBefore(configScript, ph);
        ph.parentNode.insertBefore(platformScript, ph);
        return document.body.addEventListener("harvest-event:ready", function() {
          _this.platformLoaded = true;
          return _this.addTimer();
        });
      };

      TrelloProfile.prototype.addTimer = function() {
        var data;
        if (!this.platformLoaded) {
          return;
        }
        if (document.querySelector(".harvest-timer") != null) {
          return;
        }
        data = this.getDataForTimer();
        if (this.notEnoughInfo(data)) {
          return;
        }
        this.buildTimer(data);
        return this.notifyPlatformOfNewTimers();
      };

      TrelloProfile.prototype.getDataForTimer = function() {
        var itemName, link, linkParts, projectName, _ref, _ref1;
        itemName = (_ref = document.querySelector(this.cardNameSelector)) != null ? _ref.innerText.trim() : void 0;
        projectName = (_ref1 = document.querySelector(this.boardNameSelector)) != null ? _ref1.innerText.trim() : void 0;
        link = window.location.href;
        linkParts = link.match(/^https:\/\/trello.com\/c\/([a-zA-Z0-9-]+)\/.*$/);
        return {
          project: {
            id: linkParts != null ? linkParts[1] : void 0,
            name: projectName
          },
          item: {
            id: linkParts != null ? linkParts[1] : void 0,
            name: itemName
          }
        };
      };

      TrelloProfile.prototype.notEnoughInfo = function(data) {
        var _ref, _ref1;
        return !(((data != null ? (_ref = data.project) != null ? _ref.id : void 0 : void 0) != null) && ((data != null ? (_ref1 = data.item) != null ? _ref1.id : void 0 : void 0) != null));
      };

      TrelloProfile.prototype.buildTimer = function(data) {
        var actions, icon, timer;
        actions = document.querySelector(this.actionSelector);
        if (!actions) {
          return;
        }
        timer = document.createElement("a");
        timer.className = "harvest-timer button-link js-add-trello-timer";
        timer.setAttribute("id", "harvest-trello-timer");
        timer.setAttribute("data-project", JSON.stringify(data.project));
        timer.setAttribute("data-item", JSON.stringify(data.item));
        icon = document.createElement("span");
        icon.className = "trello-timer-icon";
        //icon.style.backgroundImage = "url('" + (chrome.extension.getURL("images/trello-timer-icon.png")) + "')";
        timer.appendChild(icon);
        timer.appendChild(document.createTextNode(" Track time…"));
        return actions.insertBefore(timer, actions.children[0]);
      };

      TrelloProfile.prototype.notifyPlatformOfNewTimers = function() {
        var evt;
        evt = new CustomEvent("harvest-event:timers:chrome:add");
        return document.querySelector("#harvest-messaging").dispatchEvent(evt);
      };

      TrelloProfile.prototype.addTimerWhenUrlChanges = function() {
        var ph, script,
          _this = this;
        script = document.createElement("script");
        script.innerHTML = "(" + (this.notifyOnUrlChanges.toString()) + ")()";
        ph = document.getElementsByTagName("script")[0];
        ph.parentNode.insertBefore(script, ph);
        return window.addEventListener("message", function(evt) {
          if (evt.source !== window) {
            return;
          }
          if (evt.data !== "urlChange") {
            return;
          }
          return _this.addTimer();
        });
      };

      TrelloProfile.prototype.notifyOnUrlChanges = function() {
        var change, fn;
        change = function() {
          return window.postMessage("urlChange", "*");
        };
        fn = window.history.pushState;
        window.history.pushState = function() {
          fn.apply(window.history, arguments);
          return change();
        };
        return window.addEventListener("popstate", change);
      };

      return TrelloProfile;

    })();
    console.log("Harvest for Trello extension. Github: http://github.com/gsholtz/harvest-trello-safari")
    return new TrelloProfile();
  })();

}).call(this);
