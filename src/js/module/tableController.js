'use strict';

import CustomdropDownSelector from '/js/module/customSelector.js';
import PageController from '/js/module/pageController.js';
import PopupForm from '/js/module/popupForm.js';

export default class TableController {
    constructor ({selector, pages, editForm, block, addButton = false, schema, generalDataLength, data}) {
        this.selector = selector;
        this.pages = pages;
        this.editForm = editForm;
        this.block = block;
        this.addButton = addButton;
        this.schema = schema;
        this.generalDataLength = generalDataLength;
        this.data = data;

        this.SelectorBlock = new CustomdropDownSelector(this.selector);
        this.pages.maxPages = this.calculatePages();
        this.PageControllerBlock = new PageController(this.pages);
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
    }

    calculatePages() {
        return Math.ceil( this.generalDataLength / this.SelectorBlock.getSetValue() );
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

    createBody(data) {
        this.block.find("tbody").html( this.generateBody(data) );
    }

    addToBody(data) {
        this.block.find("tbody").prepend( this.generateBody([data]) );
    }

    updateBody(target, object) {
        let schema = this.schema.columns;

        for(let i = 0; i < schema.length; i++) {
            if (schema[i].relatedData) {
                target.find(`td:eq(${i})`).text(object[schema[i].relatedData]);
            }
        }
    }

    generateBody (data = this.data) {
        if (data === undefined || data.length === 0)
            return;

        let linkVariableName = "relatedElement";

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
                    column.relatedData ? `data-title="${column.relatedData}"` : ""
                }>${
                    setValue(element, i, column, this.schema)
                }</td>`;
            }

            tr.innerHTML = html;
            this.setEditEvent($(tr), "data-action", linkVariableName)
            fragment.appendChild(tr);
        }

        return fragment;

        function setValue(element, index, column, schema) {
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
                return element[column.relatedData]
        }
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

    setEditEvent(block, selector, variable) {
        let popupFormEventHandler = (event) => {
            let obj = Object.create(null),
                action = event.target.dataset.action;

            Object.assign(obj, event.delegateTarget[variable]);

            this.PopupFormBlock.open(action, obj, (error, answer) => {
                if (error)
                    return false;

                this.triggerEvent("edit", answer, (...args) => {
                    this.editEventCallBack(...args, event.delegateTarget, variable);
                });
            });
        };

        block.on("click", `[${selector}]`, popupFormEventHandler);   
    }

    setSelectorEvent() {
        this.SelectorBlock.subscribe((length) => {
            this.triggerEvent("get", length, this.PageControllerBlock.CurrentPosition, (...args) => {
                this.getEventCallBack(...args);
                this.PageControllerBlock.setPageBlock(undefined, this.calculatePages());
            });
        });
    }

    setPageEvent() {
        this.PageControllerBlock.subscribe((page, cb) => {
            this.triggerEvent("get", this.SelectorBlock.getSetValue(), page, (error, result = {}) => {
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
        if (error || result.dbLength === undefined)
            return false;

        this.generalDataLength = result.dbLength;
        this.createBody(result.data);
    }

    addEventCallBack(error, result = {}) {
        if (error)
            return false;

        this.generalDataLength += 1;
        this.addToBody(result);
        this.normalizeTable();
    }

    editEventCallBack(error, result = {}, block, variable) {
        block[variable] = result;
        this.updateBody($(block), result);
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
