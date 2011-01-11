var AddDToUnsortBkmMultipleTab = {

	ElmId_tabCtxSaveTab: "AddDToUnsortBkm-tabCtx-saveTab",

	_service: null,
	get service() {
		if (!this._service) {
			this._service = AddDToUnsortBkm;
		}
		return this._service;
	},

	handleEvent: function (aEvent) {
		switch (aEvent.type) {
			case "load":
				this.onLoad();
				break;
		}
	},

	onLoad: function AddDToUnsortBkmMultipleTab_onLoad() {
		window.removeEventListener("load", this, false);

		this.deleteItemFromTabCtx();
	},


	deleteItemFromTabCtx: function AddDToUnsortBkmMultipleTab_deleteItemFromTabCtx() {
		var tabContextMenu = gBrowser.tabContextMenu;
		var menuitem = document.getElementById(this.ElmId_tabCtxSaveTab);
		tabContextMenu.removeChild(menuitem);
	},

	saveSelectedTabs: function AddDToUnsortBkmMultipleTab_saveSelectedTabs() {
		MultipleTabService.getSelectedTabs().forEach(function(aTab) {
			this.service.saveItem(aTab.linkedBrowser.currentURI.spec,
			                      aTab.linkedBrowser.contentDocument.title || aTab.getAttribute("label"));
		}, this);
	}
};
window.addEventListener("load", AddDToUnsortBkmMultipleTab, false);