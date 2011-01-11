var AddDToUnsortBkmMultipleTab = {

	ElmId_tabCtxSaveTab: "AddDToUnsortBkm-tabCtx-saveTab",

	get service() {
		delete this.service
		return this.service = AddDToUnsortBkm;
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
			this.service.saveTab(aTab);
		}, this);
	}
};
window.addEventListener("load", AddDToUnsortBkmMultipleTab, false);