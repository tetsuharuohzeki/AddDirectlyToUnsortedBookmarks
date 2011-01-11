var AddDToUnsortBkm = {

	get bookmarksService () {
		delete this.bookmarksService
		return this.bookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
		                               .getService(Components.interfaces.nsINavBookmarksService);
	},

	get unfiledBookmarksFolder () {
		delete this.unfiledBookmarksFolder;
		return this.unfiledBookmarksFolder = this.bookmarksService.unfiledBookmarksFolder;
	},

	get IOService () {
		delete this.IOService;
		return this.IOService = Components.classes["@mozilla.org/network/io-service;1"]
		                        .getService(Components.interfaces.nsIIOService);
	},

	//The preference domain of this add-on
	PREF_DOMAIN: "extensions.add_d_to_unsortedbookmarks.",

	PREF: {
		ctx_saveTab: null,
		ctx_saveSelectedTabs: null,
		content_savePage: null,
		content_saveLink: null,
	},

	get prefBranch () {
		delete this.prefBranch;
		return this.prefBranch = new this.Preferences(this.PREF_DOMAIN);
	},

	handleEvent: function (aEvent) {
		switch (aEvent.type) {
			case "load":
				this.onLoad();
				break;
			case "popupshowing":
				this.ctrlContentCtxMenu();
				break;
			case "unload":
				this.onUnLoad();
				break;
		}
	},

	observe: function (aSubject, aTopic, aData) {
		if (aTopic == "nsPref:changed") {
			var value = this.prefBranch.get(aData);
			switch (aData) {
				case "tab.saveTab":
					this.PREF.ctx_saveTab = value;
					this.prefShowItem("AddDToUnsortBkm-tabCtx-saveTab", value);
					break;
				case "tab.saveSeleCtedTabs":
					this.PREF.ctx_saveSelectedTabs = value;
					break;
				case "content.savePage":
					this.PREF.content_savePage = value;
					break;
				case "content.saveLink":
					this.PREF.content_saveLink = value;
					break;
			}
		}
	},

	onLoad: function AddDToUnsortBkm_onload() {
		window.removeEventListener("load", this, false);
		window.addEventListener("unload", this, false);

		//Import JS Utils module
		Components.utils.import("resource://AddDToUnsortBkm/UtilsForExtension.js", this);

		//Set Preferences Observer
		this.prefBranch.observe("", this);

		//set user preferences
		this.initPref();

		//set Context menu
		this.initContext();
	},

	onUnLoad: function() {
		window.removeEventListener("unload", this, false);

		var contentAreaCtx = document.getElementById("contentAreaContextMenu");
		contentAreaCtx.removeEventListener("popupshowing", this, false);

		this.prefBranch.ignore("", this);
	},

	initPref: function () {
		var allPref = this.prefBranch.getChildList("");
		allPref.forEach(function(aPref) {
			this.observe(null, "nsPref:changed", aPref);
		}, this);
	},

	initContext: function () {
		var contentAreaCtx = document.getElementById("contentAreaContextMenu");
		contentAreaCtx.addEventListener("popupshowing", this, false);
	},

	ctrlContentCtxMenu: function AddDToUnsortBkm_ctrlContentCtxMenu() {
		gContextMenu.showItem("AddDToUnsortBkm-contentCtx-savePage",
		                      !(gContextMenu.isContentSelected || gContextMenu.onTextInput || gContextMenu.onLink ||
		                        gContextMenu.onImage || gContextMenu.onVideo || gContextMenu.onAudio) &&
		                      this.PREF.content_savePage);
		gContextMenu.showItem("AddDToUnsortBkm-contentCtx-saveLink",
		                      gContextMenu.onLink && !gContextMenu.onMailtoLink &&
		                      this.PREF.content_saveLink);
	},

	saveLink: function AddDToUnsortBkm_saveLink() {
		this.saveItem(gContextMenu.linkURL, gContextMenu.linkText());
	},

	saveThisPage: function AddDToUnsortBkm_saveThisPage() {
		this.saveTab(gBrowser.mCurrentTab);
	},

	saveThisTab: function AddDToUnsortBkm_saveThisTab() {
		this.saveTab(gBrowser.mContextTab);
	},

	saveTab: function AddDToUnsortBkm_saveTab(aTab) {
		var URI = aTab.linkedBrowser.currentURI.spec
		var title = aTab.linkedBrowser.contentDocument.title || aTab.getAttribute("label");
		this.saveItem(URI, title);
	},

	saveItem: function AddDToUnsortBkm_saveItem(aURI, aTitle, aIndex) {
		var uri = this.IOService.newURI(aURI, null, null);
		if (!aIndex) {
			aIndex = this.bookmarksService.DEFAULT_INDEX;
		}
		this.bookmarksService.insertBookmark(this.unfiledBookmarksFolder, uri,
		                                     aIndex, aTitle);
	},

	prefShowItem: function (aItemId, aPref) {
		var item = document.getElementById(aItemId);
		if (aPref) {
			item.removeAttribute("hidden");
		} else {
			item.setAttribute("hidden", "true");
		}
	},

};
window.addEventListener("load", AddDToUnsortBkm, false);
