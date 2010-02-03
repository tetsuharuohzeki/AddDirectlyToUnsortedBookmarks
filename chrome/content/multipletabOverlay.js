var AddDToUnsortBkmMultipleTab = {

	_service: null,
	get service() {
		if (!this._service) {
			this._service = AddDToUnsortBkm;
		}
		return this._service;
	},

	onLoad: function AddDToUnsortBkmMultipleTab_onLoad() {
		this.changeInsertionWhere();
		this.deleteItemFromTabCtx();
	},

	deleteItemFromTabCtx: function AddDToUnsortBkmMultipleTab_deleteItemFromTabCtx() {
		var tabContextMenu = document.getAnonymousElementByAttribute(gBrowser, "anonid", "tabContextMenu");
		var menuitem = document.getElementById("AddDToUnsortBkm-tabContext-saveTab");
		tabContextMenu.removeChild(menuitem);
	},

	changeInsertionWhere: function AddDToUnsortBkmMultipleTab_changeInsertionWhere() {
		var menuitem = document.getElementById("AddDToUnsortBkm-tabContext-saveSelected-multipletab-selection");
		var multipleSelection = document.getElementById("multipletab-selection-menu");
		multipleSelection.insertBefore(menuitem, document.getElementById("multipletab-selection-duplicate-separator"));
	},

	saveSelectedTabs: function AddDToUnsortBkmMultipleTab_saveSelectedTabs() {
		MultipleTabService.getSelectedTabs().map(function(aTab) {
			this.service.saveItem(aTab.linkedBrowser.currentURI.spec,
			                      aTab.linkedBrowser.contentDocument.title || aTab.getAttribute("label"));
		});
	}
};
window.addEventListener("load", function (){ AddDToUnsortBkmMultipleTab.onLoad(); }, false);