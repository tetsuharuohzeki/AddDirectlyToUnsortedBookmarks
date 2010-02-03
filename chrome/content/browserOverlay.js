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

	onLoad: function AddDToUnsortBkm_onload() {
		this.addMenuToTabCtx("AddDToUnsortBkm-tabContext-saveTab");

		var contentAreaContext = document.getElementById("contentAreaContextMenu");
		var self = this;
		contentAreaContext.addEventListener("popupshowing", function () { self.ctrlContetCtxMenu(); }, false);
	},

	addMenuToTabCtx: function AddDToUnsortBkm_addMenuToTabCtx(aItemId) {
		var tabContextMenu = document.getAnonymousElementByAttribute(gBrowser, "anonid", "tabContextMenu");
		var menuItem = document.getElementById(aItemId);
		var contextBkmAll_Next = document.getElementById('context_bookmarkAllTabs').nextSibling;
		tabContextMenu.insertBefore(menuItem, contextBkmAll_Next);
	},

	ctrlContetCtxMenu: function () {
		gContextMenu.showItem("AddDToUnsortBkm-contentContext-savePage",
		                      !(gContextMenu.isContentSelected || gContextMenu.onTextInput || gContextMenu.onLink ||
		                        gContextMenu.onImage || gContextMenu.onVideo || gContextMenu.onAudio));
		gContextMenu.showItem("AddDToUnsortBkm-contentContext-saveLink",
		                      gContextMenu.onLink && !gContextMenu.onMailtoLink);
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

};
window.addEventListener("load", function (){ AddDToUnsortBkm.onLoad(); }, false);