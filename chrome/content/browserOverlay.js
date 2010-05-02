var AddDToUnsortBkm = {

	_bookmarksService: null,
	get bookmarksService() {
		if (!this._bookmarksService) {
			this._bookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
			                         .getService(Components.interfaces.nsINavBookmarksService);
		}
		return this._bookmarksService;
	},

	_unfiledBookmarksFolder: null,
	get unfiledBookmarksFolder() {
		if (!this._unfiledBookmarksFolder) {
			this._unfiledBookmarksFolder = this.bookmarksService.unfiledBookmarksFolder;
		}
		return this._unfiledBookmarksFolder;
	},

	_IOService: null,
	get IOService() {
		if (!this._IOService) {
			this._IOService = Components.classes["@mozilla.org/network/io-service;1"]
			                  .getService(Components.interfaces.nsIIOService);
		}
		return this._IOService;
	},

	//The preference domain of this add-on
	PREF_DOMAIN: "extensions.add_d_to_unsortedbookmarks.",

	PREF: {
		ctx_saveTab: null,
		ctx_saveSelectedTabs: null,
		content_savePage: null,
		content_saveLink: null,
	},

	_prefBranch: null,
	get prefBranch() {
		if (!this._prefBranch) {
			this._prefBranch = (new this.Preferences(this.PREF_DOMAIN));
		}
		return this._prefBranch;
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
		this.insertAllToTabCtx("AddDToUnsortBkm-tabContext",
		                       document.getElementById("context_bookmarkAllTabs").nextSibling);

		var contentAreaCtx = document.getElementById("contentAreaContextMenu");
		contentAreaCtx.addEventListener("popupshowing", this, false);
	},

	insertAllToTabCtx: function AddDToUnsortBkm_insertAllToTabCtx(aId, aReference) {
		var menuParent = document.getElementById(aId);
		while (menuParent.hasChildNodes()) {
			var node = menuParent.firstChild;
			this.insertToTabCtxBefore(node, aReference);
		}
	},

	insertToTabCtxBefore: function AddDToUnsortBkm_insertToTabCtxBefore(aElem, aReference) {
		var tabContextMenu = gBrowser.tabContextMenu ||
		                     document.getAnonymousElementByAttribute(gBrowser, "anonid", "tabContextMenu");
		tabContextMenu.insertBefore(aElem, aReference);
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
		urlSecurityCheck(gContextMenu.linkURL, gContextMenu.target.ownerDocument.nodePrincipal);
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
			aIndex = -1;
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
