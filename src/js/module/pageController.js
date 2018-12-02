'use strict';

export default class PageController {
    constructor({block, maxPages, schema = {}, buttonExpansion = 1, currentPosition = 1}) {
        this.block = block;
        this.maxPages = Math.max(maxPages, 1);
        this.schema = {};
        ({
            previous: this.schema.previous = {},
            next: this.schema.next = {},
            current: this.schema.current = {},
            defaultBlock: this.schema.defaultBlock = {},
            separator: this.schema.separator = {}
        } = schema);
        this.buttonExpansion = buttonExpansion;
        this.currentPosition = currentPosition;

        this.subscribeStack = new Set();

        this.create();
    }

    get CurrentPosition() {
        return this.currentPosition;
    }

    set CurrentPosition(v) {
        if (v > this.maxPages)
            this.currentPosition = this.maxPages;
        else
            this.currentPosition = v;
    }

    create (currentPosition, maxPages) {
        this.setPageBlock(currentPosition, maxPages);
        this.setListner();
    }

    setPageBlock(currentPosition = this.currentPosition, maxPages = this.maxPages) {
        this.maxPages = maxPages;
        this.CurrentPosition = currentPosition;

        this.block.html( this.constructButtons(this.createNumericButtons()) );

        this.block.find("div[data-goto]").each(function() {
            this.goto = Number($(this).attr("data-goto"));
        });
    }

    setListner () {
        let goTo;
        let listner = (e) => {
            let current = e.target;

            if (this.subscribeStack.size == 0)
                return;

            this.block.off("click", "div[data-goto]", listner);
            subscribeCallBack.counter = this.subscribeStack.size;
            subscribeCallBack.result = true;
            goTo = current.goto;

            for(let cb of this.subscribeStack) {
                cb(current.goto, subscribeCallBack);
            }
        };
        let subscribeCallBack = (error, result) => {
            subscribeCallBack.counter--;
            
            if (error)
                subscribeCallBack.result = false;
            else
                subscribeCallBack.result = subscribeCallBack.result && result;

            if (subscribeCallBack.counter == 0) {
                if (subscribeCallBack.result) {
                    this.create(goTo, subscribeCallBack.result);
                } else {
                    this.block.on("click", "div[data-goto]", listner);
                }                
            }
        };

        this.block.on("click", "div[data-goto]", listner);
    }

    createNumericButtons () {
        let array = [],
            min = (this.currentPosition - this.buttonExpansion) < 1 
            ? 1 
            : (this.currentPosition - this.buttonExpansion),
            max = (this.currentPosition + this.buttonExpansion) > this.maxPages 
            ? this.maxPages 
            : (this.currentPosition + this.buttonExpansion);

        for (let i = min; i <= max; i++) {
            array.push(i);
        }

        if (!array.includes(1)) {
            array = concatPageArray([1], array);
        }

        if (!array.includes(this.maxPages)) {
            array = concatPageArray(array, [this.maxPages]);
        }

        return array;

        function concatPageArray(arr1, arr2) {
            if (arr1[arr1.length - 1] + 1 !== arr2[0]) {
                arr1.push(null);
            }

            return arr1.concat(arr2);
        }
    }

    constructButtons (array = []) {
        let html = '',
            previousClass = this.schema.previous.class || this.schema.defaultBlock.class || "",
            nextClass = this.schema.next.class || this.schema.defaultBlock.class || "";

        if (this.currentPosition == 1) {
            html += `<div class="${this.schema.separator.class || ""}">${this.schema.previous.value || "Previous"}</div>`;
        } else {
            html += `<div class="${previousClass}" data-goto="${this.currentPosition - 1}">${this.schema.previous.value || "Previous"}</div>`;
        }
        
        for (let i = 0; i < array.length; i++) {
            if (this.currentPosition == array[i]) {
                html += `<div class="${this.schema.current.class || ""}">${array[i]}</div>`
            } else if (array[i] == null) {
                html += `<div class="${this.schema.separator.class || ""}">${this.schema.separator.value || "..."}</div>`;
            } else {
                html += `<div class="${this.schema.defaultBlock.class || ""}" data-goto="${array[i]}">${array[i]}</div>`;
            }
        }

        if (this.currentPosition == this.maxPages) {
            html += `<div class="${this.schema.separator.class || ""}">${this.schema.next.value || "Next"}</div>`;
        } else {
            html += `<div class="${nextClass}" data-goto="${this.currentPosition + 1}">${this.schema.next.value || "Next"}</div>`;
        }


        return html;
    }

    subscribe(cb) {
        this.subscribeStack.add(cb);
    }

    unsubscribe(cb) {
        this.subscribeStack.delete(cb);
    }
}