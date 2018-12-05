import ServerConnector from '/js/module/serverConnector.js';

let tableConfig = {
    selector: {
        block: $(".custom-select").first(),
        dataStep: [10, 20, 50, 100]
    },
    pages: {
        block: $(".item-table_view-pages").first(),
        schema: {
            previous: {
                value: "Previous"
            },
            next: {
                value: "Next"
            },
            current: {
                class: "item-table_page-button page-current"
            },
            defaultBlock: {
                class: "item-table_page-button page-button"
            },
            separator: {
                value: "...",
                class: "item-table_page-button page-view"
            }
        }
    },
    editForm: {
        title: "Product",
        block: $(".popup-form-wrapper").first(),
        validate: {
            func: formValidator,
            messages: {
                required: "Required data"
            }
        },
        behavior: {
            add: {
                block: "#popupFormAdd",
                succes: "#popupFormAddSucces",
                schema: [{
                    name: "shopCode",
                    field: "#popupFormAddShopCode",
                    type: "input",
                    validation: ["required"]
                }]
            },
            edit: {
                block: "#popupFormEdit",
                succes: "#popupFormEditSucces",
                schema: [{
                    name: "productType",
                    field: "#popupFormEditProductType",
                    type: "text",
                    source: ["productType", "name"]
                }, {
                    name: "shopCode",
                    field: "#popupFormEditShopCode",
                    type: "text"
                }, {
                    name: "passwordPreferenceList",
                    field: "#popupFormEditPassword",
                    type: "slider",
                    schema: {
                        header: {
                            class: "slider-password"
                        }
                    },
                    onAdd: {
                        schema: [{
                            
                        }, {

                        }]
                    }
                }, {
                    name: "fingerprintPreferenceList",
                    field: "#popupFormEditFingerprint",
                    type: "slider",
                    schema: {
                        header: {
                            class: "slider-fingerprint"
                        }
                    },
                    onAdd: {
                        serverRequest: {
                            eventName: "synchroniseWithDevice"
                        },
                        schema: [{

                        }, {

                        }]
                    }
                }, {
                    name: "voicePreferenceList",
                    field: "#popupFormEditVoice",
                    type: "slider",
                    schema: {
                        header: {
                            class: "slider-voice"
                        }
                    }
                }]
            }
        },
        succes: ".popup-form_body-container-submit"
    },
    block: $(".table-block").first(),
    loader: {
        wrapperLoader: $(".container-item-table").first(),
        wrapperTable: $(".item-table").first(),
    },
    addButton: $(".item-table_add-button").first(),
    schema: {
        columns: [{
            value: "№",
            class: "table-block_min-width responsive-hide",
            autoIncrement: true,
            responsive: false
        },
        {
            value: "Product type",
            relatedData: ["productType", "name"]
        },
        {
            value: "Shop code",
            relatedData: "shopCode"
        },
        {
            value: "options",
            class: "table-block_min-width table-block_center",
            buttons: ["edit"]
        }],
        buttons: {
            edit: {
                name: "edit",
                class: "item-table_button",
                action: "edit"
            }
        }
    }
};

let connector = new ServerConnector({
    path: "/account",
    signRequests: true,
    tableConfig: tableConfig,
    actions: {
        get: {
            path: "/devices/get"
        },
        add: {
            path: "/devices/add"
        },
        edit: {
            path: "/devices/edit"
        }
    },
    customEvents: {
        synchroniseWithDevice: "/some/path"
    },
    relatedData: [{
        name: "productType",
        to: "editForm",
        path: "/moderation/productTypes/get",
        options: {
            length: -1,
            padding: 0
        },
        storeVariable: "data"
    }]
});

let personalInformationController = {
    amountOfDevices: $("#amountOfDevices"),
    incrementAmount() {
        this.amountOfDevices.text( Number(this.amountOfDevices.text()) + 1 );
    }
}

connector.on("add", () => {
    personalInformationController.incrementAmount();
})