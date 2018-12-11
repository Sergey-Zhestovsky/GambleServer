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
                value: localization.layouts.previous
            },
            next: {
                value: localization.layouts.next
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
    block: $(".table-block").first(),
    loader: {
        wrapperLoader: $(".moderation_container").first(),
        wrapperTable: $(".item-table").first(),
    },
    schema: {
        columns: [{
            value: "№",
            class: "table-block_min-width responsive-hide",
            autoIncrement: true,
            responsive: false
        },
        {
            value: localization.page.name,
            relatedData: "name"
        },
        {
            value: localization.page.mail,
            relatedData: "mail"
        },
        {
            value: localization.page.privilege,
            class: "table-block_min-width",
            relatedData: ["privilege", "name"]
        }]
    }
};

let connector = new ServerConnector({
    path: "/moderation",
    tableConfig: tableConfig,
    actions: {
        get: {
            path: "/users/get"
        }
    }
});