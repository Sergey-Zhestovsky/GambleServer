'use strict';

export default class customdropDownSelector {

    constructor({ block, activeClass = "active", dataStep, keyStep}) {
        this.block = block;
        this.activeClass = activeClass;
        this.styledSelect = block.find('.select-styled');
        this.list = block.find('.select-options');
        this.selectedData;
        this.subscribeStack = new Set();
        this.dataStep = dataStep;
        this.keyStep = keyStep;

        this.create();
    }

    create() {
        if (!this.dataStep)
            return;

        this.generateList();

        this.list.find("li").each(function() {
            this.val = $(this).attr("val");
        });

        if (this.styledSelect.text() == "")
            this.setDefault();

        this.styledSelect.click((e) => {
            if (this.isOpen())
                return;

            this.open();

            $(document).one("click", () => {
                $(document).one("click", () => {
                    this.close();
                });
            });
        });

        this.list.on("click", "li", (e) => {
            let current = e.target;

            if (current.val === this.getSetValue())
                return;
            
            this.getSetValue(current.val, current.textContent);
            this.selectedData = current.val;

            for (let cb of this.subscribeStack) {
                cb(this.selectedData);
            }
        });
    }

    setDefault() {
        let first = this.list.find("li").get(0);
        
        this.getSetValue(first.val, first.textContent)
    }

    generateList() {
        let html = '';

        for (let i = 0; i < this.dataStep.length; i++) {
            html += `<li val="${ this.keyStep ? this.keyStep[i] : this.dataStep[i] }">${this.dataStep[i]}</li>`
        }

        this.list.html(html);
    }

    close() {
        this.styledSelect.removeClass(this.activeClass);
        this.list.addClass("hide");
    }

    open() {
        this.styledSelect.addClass(this.activeClass);
        this.list.removeClass("hide");
    }

    isOpen() {
        return this.styledSelect.hasClass('active');
    }

    getSetValue(key, value) {
        if (!key || !value)
            return this.selectedData;

        this.selectedData = key;
        this.styledSelect.text(value);
    }

    subscribe(cb) {
        this.subscribeStack.add(cb);
    }

    unsubscribe(cb) {
        this.subscribeStack.delete(cb);
    }
}