'use strict';

import CustomDropDownSelector from '/js/module/customSelector.js';
import PageController from '/js/module/pageController.js';
import PopupForm from '/js/module/popupForm.js';

export default class TableController {
    constructor ({selector, pages, editForm, block, loader, addButton = false, schema, dbLength = 0, data = []}) {
        this.selector = selector;
        this.pages = pages;
        this.editForm = editForm;
        this.block = block;
        this.loader = loader;
        this.addButton = addButton;
        this.schema = schema;
        this.dbLength = dbLength;
        this.data = data;

        this.SelectorBlock = new CustomDropDownSelector(this.selector);
        this.pages.maxPages = this.calculatePages();
        this.PageControllerBlock = new PageController(this.pages);
        if (this.editForm)
            this.PopupFormBlock = new PopupForm(this.editForm);

        this.eventListner = new Map();
        this.setSelectorEvent();
        this.setPageEvent();

        this.create();
    }

    create() {
        this.createHead();
        this.createBody();
        this.setAddEvent();

        this.triggerTableCreate();
    }

    calculatePages(length = this.dbLength, step = this.SelectorBlock.getSetValue()) {
        return Math.ceil(length / step);
    }

    calculatePadding(length = this.SelectorBlock.getSetValue(), page = this.PageControllerBlock.CurrentPosition) {
        return (page - 1) * length;
    }

    createHead () {
        if (this.block.find("thead").length == 0) {
            this.block.html("<thead></thead>");
        }

        let head = this.block.find("thead"),
            html = "";

        for(let block of this.schema.columns) {
            html += `<td class="${block.class || ""}">${block.value}</td>`;
        }

        head.html(html);
    }

    getRelatedData(object, path) {
        if(!Array.isArray(path))
            return object[path];

        let result = object;

        for(let el of path) {
            result = result[el] || "";
        }

        return result;
    }

    createBody(data) {
        this.block.find("tbody").html( this.generateBody(data) );
    }

    addToBody(data) {
        this.block.find("tbody").append( this.generateBody([data]) );
    }

    deleteFromBody(data) {
        data.remove();
    }

    updateBody(target, object) {
        let schema = this.schema.columns;

        for(let i = 0; i < schema.length; i++) {
            if (schema[i].relatedData) {
                target.find(`td:eq(${i})`).text( this.getRelatedData(object, schema[i].relatedData) );
            }
        }
    }

    generateBody (data = this.data) {
        if (data === undefined || data.length === 0)
            return;

        let linkVariableName = "relatedElement",
            setValue = (element, index, column, schema) => {
                if (column.autoIncrement)
                    return index + 1;

                if (column.buttons) {
                    let temp = "";

                    for (let i = 0; i < column.buttons.length; i++) {
                        let buttonLink = schema.buttons[column.buttons[i]];

                        temp += `<div class="${buttonLink.class}" data-action="${buttonLink.action}">${buttonLink.name}</div>`;
                    }

                    return temp;
                }

                if (column.relatedData)
                    return this.getRelatedData(element, column.relatedData);
            };

        if (this.block.find("tbody").length == 0) {
            this.block.html("<tbody></tbody>");
        }

        let fragment = document.createDocumentFragment(),
            tr;

        for(let i = 0; i < data.length; i++) {
            let element  = data[i],
                html = "";

            tr = document.createElement("tr");
            tr[linkVariableName] = element;

            for(let column of this.schema.columns) {
                html += `<td class="${
                    column.class || ""
                }" ${
                    column.relatedData ? `data-title="${column.value}"` : ""
                }>${
                    setValue(element, i, column, this.schema)
                }</td>`;
            }

            tr.innerHTML = html;
            this.setBtnEvent($(tr), "data-action", linkVariableName)
            fragment.appendChild(tr);
        }

        return fragment;
    }

    normalizeTable() {
        let table = this.block.find("tbody"),
            schema = this.schema.columns;


        for(let i = 0; i < schema.length; i++) {
            if( schema[i].autoIncrement ) {
                let inc = 1;

                table.find(`tr > td:first-child`).each(function () {
                    $(this).text(inc++)
                });
            }
        }
    }

    triggerEvent(event, ...args) {
        if (!this.eventListner.has(event))
            return;

        for(let current of this.eventListner.get(event)) {
            current(...args)
        }
    }

    triggerGetEvent(length, padding, cb) {
        let event = "get";

        if (!this.eventListner.has(event))
            return;

        this.block.addClass("loading");
        this.triggerEvent(event, {length, padding}, cb);
    }

    setAddEvent() {
        if (!this.addButton) 
            return;

         this.addButton.on("click", () => {
            this.PopupFormBlock.open("add", (error, answer) => {
                if (error)
                    return false;

                this.triggerEvent("add", answer, (...args) => {
                    this.addEventCallBack(...args);
                });
            });
         });
    }

    setBtnEvent(block, selector, variable) {
        let popupFormEventHandler = (event) => {
            let action = event.target.dataset.action;

            switch (action) {
                case "edit":
                    this.setEditHandler(event, action, variable);
                    break;
                case "delete":
                    this.setDeleteHandler(event, variable);
                    break;
                default:
                    break;
            }
        };

        block.on("click", `[${selector}]`, popupFormEventHandler);   
    }

    setEditHandler(event, action, variable) {
        let obj = Object.create(null);

        Object.assign(obj, event.delegateTarget[variable]);

        this.PopupFormBlock.open(action, obj, (error, answer) => {
            if (error)
                return false;

            this.triggerEvent("edit", answer, (...args) => {
                this.editEventCallBack(...args, event.delegateTarget, variable);
            });
        });
    }

    setDeleteHandler(event, variable) {
        this.triggerEvent("delete", event.delegateTarget[variable], (...args) => {
            this.deleteEventCallBack(...args, event.delegateTarget);
        });
    }

    setSelectorEvent() {
        this.SelectorBlock.subscribe((length) => {
            this.triggerGetEvent(length, this.calculatePadding(length, this.calculatePages(undefined, length)), (...args) => {
                this.getEventCallBack(...args);
                this.PageControllerBlock.setPageBlock(undefined, this.calculatePages());
            });
        });
    }

    setPageEvent() {
        this.PageControllerBlock.subscribe((page, cb) => {
            this.triggerGetEvent(this.SelectorBlock.getSetValue(), this.calculatePadding(undefined, page), (error, result = {}) => {
                if (error) {
                    this.getEventCallBack(error);
                    cb(error);
                    return false;
                }

                this.getEventCallBack(error, result);
                cb(error, this.calculatePages());
            });
        });
    }

    getEventCallBack(error, result = {}) {
        this.block.removeClass("loading");

        if (error || result.dbLength === undefined)
            return false;

        this.dbLength = result.dbLength;
        this.createBody(result.data);
    }

    addEventCallBack(error, result = {}) {
        if (error)
            return false;

        this.dbLength += 1;
        this.addToBody(result);
        this.normalizeTable();
    }

    editEventCallBack(error, result = {}, block, variable) {
        block[variable] = result;
        this.updateBody($(block), result);
    }

    deleteEventCallBack(error, result = {}, block) {
        if (error)
            return false;

        this.dbLength -= 1;
        this.deleteFromBody(block);
        this.normalizeTable();
    }

    triggerTableCreate() {
        if (!this.loader)
            return;

        this.loader.wrapperLoader.addClass("loaded");
        this.loader.wrapperTable.addClass("loaded");
    }

    on(event, func) {
        if (this.eventListner.has(event)) {
            this.eventListner.get(event).push(func);
        } else {
            this.eventListner.set(event, [func]);
        }
    }

    off(event, func) {
        if (eventListner.has(event)) {
            let arr = this.eventListner.get(event);
            
            for(let i = 0; i < arr.length; i++) {
                if (arr[i] === func) 
                    arr.splice(i--, 1)
            }
        }
    }
}