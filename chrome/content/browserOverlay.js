Components.utils.import("resource://gre/modules/Services.jsm");
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
		return this.prefBranch =Services.prefs.getBranch(this.PREF_DOMAIN)
		                        .QueryInterface(Components.interfaces.nsIPrefBranch2);
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
			var value = this.prefBranch.getBoolPref(aData);
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

		//Set Preferences Observer
		this.prefBranch.addObserver("", this, false);

		//set user preferences
		this.initPref();

		//set Context menu
		this.initContext();
	},

	onUnLoad: function() {
		window.removeEventListener("unload", this, false);

		var contentAreaCtx = document.getElementById("contentAreaContextMenu");
		contentAreaCtx.removeEventListener("popupshowing", this, false);

		this.prefBranch.removeObserver("", this);
	},

	initPref: function () {
		var allPref = this.prefBranch.getChildList("", {});
		allPref.forEach(function(aPref) {
			this.observe(null, "nsPref:changed", aPref);
		}, this);
	},

	initContext: function () {
		var contentAreaCtx = document.getElementById("contentAreaContextMenu");
		contentAreaCtx.addEventListener("popupshowing", this, false);
	},

	ctrlContentCtxMenu: function AddDToUnsortBkm_ctrlContentCtxMenu() {
		let isContntSavePage = this.PREF.content_savePage && 
		                        !(
		                          gContextMenu.isContentSelected || gContextMenu.onTextInput || 
		                          gContextMenu.onLink || gContextMenu.onImage || 
		                          gContextMenu.onVideo || gContextMenu.onAudio
		                        );
		gContextMenu.showItem("AddDToUnsortBkm-contentCtx-savePage", isContntSavePage);
		
		let isContentSaveLink = this.PREF.content_saveLink && 
		                         (gContextMenu.onLink && !gContextMenu.onMailtoLink);
		gContextMenu.showItem("AddDToUnsortBkm-contentCtx-saveLink", isContentSaveLink);
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
		let browser = aTab.linkedBrowser;
		var URI     = browser.currentURI.spec;
		var title   = browser.contentDocument.title || aTab.getAttribute("label");
		this.saveItem(URI, title);
	},

	saveItem: function AddDToUnsortBkm_saveItem(aURI, aTitle, aIndex) {
		var uri = Services.io.newURI(aURI, null, null);
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
