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
        succes: ".popup-form_body-container-submit",
        validate: {
            func: formValidator,
            messages: {
                required: "Required data"
            }
        },
        schema: [{
                name: "productType",
                field: "#popupFormProductType",
                type: "select",
                selectorConfig: {
                    key: "_id",
                    value: "name"
                },
                validation: ["required"]
            },
            {
                name: "shopCode",
                field: "#popupFormShopCode",
                type: "input",
                validation: ["required"]
        }]
    },
    block: $(".table-block").first(),
    loader: {
        wrapperLoader: $(".moderation_container").first(),
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
            buttons: ["edit", "delete"]
        }],
        buttons: {
            edit: {
                name: "edit",
                class: "item-table_button",
                action: "edit"
            },
            delete: {
                name: "delete",
                class: "item-table_button",
                action: "delete"
            }
        }
    }
};

let connector = new ServerConnector({
    path: "/moderation",
    tableConfig: tableConfig,
    actions: {
        get: {
            path: "/products/get"
        },
        add: {
            path: "/products/add"
        },
        edit: {
            path: "/products/edit"
        },
        delete: {
            path: "/products/delete"
        }
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