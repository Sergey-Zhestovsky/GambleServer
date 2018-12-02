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
        title: "Product type",
        block: $(".popup-form-wrapper").first(),
        succes: ".popup-form_body-container-submit",
        validate: {
            func: formValidator,
            messages: {
                required: "Required data"
            }
        },
        schema: [{
                name: "name",
                field: "#popupFormName",
                type: "input",
                validation: ["required"]
            },
            {
                name: "url",
                field: "#popupFormUrl",
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
            value: "name",
            relatedData: "name"
        },
        {
            value: "url",
            relatedData: "url"
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
    path: "/moderation",
    tableConfig: tableConfig,
    actions: {
        get: {
            path: "/productTypes/get"
        },
        add: {
            path: "/productTypes/add"
        },
        edit: {
            path: "/productTypes/edit"
        }
    }
});