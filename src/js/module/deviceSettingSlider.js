'use strict';

export default class DeviceSlider {
	constructor({block, schema = {}, data = [], dataSchema = {}, parentForm, onAdd = {}}) {
		this.block = block;
		this.schema = schema;
		this.data = data;
		this.dataSchema = {};
		({
            name: this.dataSchema.name = "name",
            state: this.dataSchema.state = "state"
        } = dataSchema);
		this.parentForm = parentForm;
		this.onAdd = onAdd;

		this.blockList = [];
		this.deleteDataList = [];
		this.addButton;

        this.create();
	}

	create() {
		let fragment = document.createDocumentFragment();

		if (this.data.length > 0)
			fragment.appendChild( this.uppendDataBlocks() );

		let addButton = `
			<div class="popup-form_slider-block add-block" data-action="add">
		        <div class="popup-form_slider-add-button">
		            <i class="fa fa-plus" aria-hidden="true"></i>
		        </div>
		    </div>`;

	    this.addButton = $(addButton);
	    this.setAddEvent(this.addButton);
	    fragment.appendChild( this.addButton.get(0) );
	    this.block.html(fragment);
	}

	setData(data) {
		this.data = data; 
		this.block.prepend( this.uppendDataBlocks() );
	}

	getData() {
		let result = [];

		for(let current of this.data)
			if (!~this.deleteDataList.indexOf(current))
				result.push(current)

		return result;
	}


	uppendDataBlocks(data = this.data) {
		const variableName = "relatedElement";

		let setBlockEvents = (block, dataSchema) => {
			$(block)
				.on("change", "input[type='checkbox']", function(e) {
					block[variableName][dataSchema.state] = this.checked;
				})
				.on("click", "div[data-action='dalete']", (e) => {
					this.setDeleteState(block, variableName);
				});
		}

		let fragment = document.createDocumentFragment(),
			block;

		for(let object of data) {
			block = document.createElement("div");
			block.classList.add("popup-form_slider-block");
			block[variableName] = object;

			let html = `
			<div class="popup-form_slider-block-header${
				this.schema.header && this.schema.header.class ? ` ${this.schema.header.class}` : ""
			}">
				<span>${object[this.dataSchema.name]}</span>
			</div>
            <div class="popup-form_slider-block-footer">
                <label class="el-switch">
                    <input type="checkbox" ${object[this.dataSchema.state] ? "checked" : ""}>
                    <span class="el-switch-style"></span>
                </label>
                <div class="popup-form_slider-delete-button" data-action="dalete">${
                	this.schema.delete && this.schema.delete.value ? this.schema.delete.value : ""
                }</div>
            </div>`;

            block.innerHTML = html;
            setBlockEvents(block, this.dataSchema);
            fragment.appendChild(block);
            this.blockList.push(block);
		}

		return fragment;
	}

	setDeleteState(block, variableName) {
		if ( ~this.deleteDataList.indexOf(block[variableName]) )
			return;

		let html = `<div class="popup-form_slider-delete-wrapper">
                        <div class="popup-form_slider-cancel-button" data-action="cancel">${
                        	this.schema.cancel && this.schema.cancel.value ? this.schema.cancel.value : ""
                        }</div>
                    </div>`,
            element = $(html);

        element.one("click", "div[data-action='cancel']", (e) => {
        	this.removeDeleteState(block, element, variableName);
        });
        this.deleteDataList.push(block[variableName]);
        $(block).append(element);
	}

	removeDeleteState(block, element, variableName) {
		const delay = 125;

		element.addClass("hide");
		setTimeout(() => {
			element.remove();
		}, delay);
		this.deleteDataList.splice( this.deleteDataList.indexOf(block[variableName]), 1 );
	}

	clear() {
		this.data = undefined;

		for(let block of this.blockList)
			$(block).remove();

		this.blockList = [];
	}

	setAddEvent(addButton) {
		addButton.on("click", () => {
			this.parentForm.openNestedElement(this.onAdd, (error, result) => {
				if (error)
					return;

				this.addData(result);
			});
		});
	}

	addData(data) {
		data[this.dataSchema.state] = true;
		this.data.push(data);
		this.addButton.before(this.uppendDataBlocks([data]));
	}
}