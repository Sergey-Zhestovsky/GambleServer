'use strict';

import CustomDropDownSelector from '/js/module/customSelector.js';
import DeviceSettingSlider from '/js/module/deviceSettingSlider.js';

export default class PopupForm {
	constructor({title, block, validate, behavior, succes, schema = [], relatedData, nestedElements, connector}) {
		this.title = title;
		this.block = block;
		this.validate = (validate && validate.func) ? validate : false;
		this.behavior = behavior;
		this.succes = succes;
		this.schema = schema;
		this.relatedData = relatedData;
		this.nestedElements = nestedElements;
		this.connector = connector;

		this.formStack = [];

		this.createForm();
	}

	get form() {
		return this.formStack[this.formStack.length - 1];
	}

	get previousForm() {
		return this.formStack[this.formStack.length - 2];
	}

	createForm() {
		let globalSchema = this.schema || [];

		if (this.behavior) {
			let keys = Object.keys(this.behavior);

			for(let key of keys) {
				let behaviorObj = this.behavior[key];

				behaviorObj.schema && (globalSchema = globalSchema.concat(behaviorObj.schema))
			}
		}

		if (this.nestedElements) {
			this.createNestedForm();

			for(let object of this.nestedElements) {
				object.schema && (globalSchema = globalSchema.concat(object.schema))
			}
		}

		for(let field of globalSchema)
			switch (field.type) {
				case "select":
					createSelectField(field, this.relatedData);
					break;
				case "slider":
					createSlider(field, this);
					break;
				default:
					break;
			}

		function createSelectField(schemaField, source) {
			let keyStep = [], dataStep = [];

			for(let data of source[schemaField.name]) {
				keyStep.push( data[schemaField.selectorConfig.key] );
				dataStep.push( data[schemaField.selectorConfig.value] );	
			}

			schemaField.selector = new CustomDropDownSelector({
				block: $(schemaField.field),
				dataStep,
				keyStep
			});
		}

		function createSlider(schemaField, context) {
			schemaField.slider = new DeviceSettingSlider({
				block: $(schemaField.field),
				dataSchema: schemaField.dataSchema,
				schema: schemaField.schema,
				parentForm: context,
				onAdd: schemaField.onAdd
			});
		}
	}

	open(action, object, cb = object) {
		let currentBlock, succes, initialObject,
			currentSchema = (this.behavior && this.behavior[action].schema)
				? this.behavior[action].schema 
				: this.schema;

		switch (action) {
			case "add":
				break;
			case "edit":
				this.openEdit(object, currentSchema);
				initialObject = object;
				// this.initialObject = object;
				break;
			default:
				return cb("unknown action")
				break;
		}

		currentBlock = this.behavior ? this.behavior[action].block : null;
		succes = this.behavior ? this.behavior[action].succes : this.succes;
		// this.succesCallBack = cb;
		this.formStack.push({
			currentBlock,
			succesCallBack: cb,
			initialObject,
			currentSchema
		});

		this.show(currentBlock);
		this.setEvent("close");
		this.setEvent("close", this.block.find(".popup-form_header-close i"));
		this.setEvent("succes", this.block.find(succes));
	}

	openEdit(object, currentSchema) {
		object = JSON.parse( JSON.stringify(object) );

		for(let value of currentSchema) {
			fillField(value.type, $(value.field), object[value.name], value);
		}

		function fillField(type, field, data, schemaField) {
			switch (type) {
				case "input":
					field.val(data)
					break;
				case "select":
					schemaField.selector.getSetValue( data[schemaField.selectorConfig.key],  data[schemaField.selectorConfig.value]);
					break;
				case "text":
					field.text(getRelatedData(data, schemaField.source));
					break;
				case "slider":
					schemaField.slider.setData(data);
					break;
				default:
					break;
			}

			function getRelatedData(object, path) {
		        if(!path || !Array.isArray(path))
		            return object;

		        let result = object;

		        for(let el of path) {
		            result = result[el] || "";
		        }

		        return result;
		    }
		}
	}

	show(innerWrapperBlock) {
		if (innerWrapperBlock)
			this.block.find(innerWrapperBlock).show();

		this.block.addClass("show-block");
	}

	hide(cb = () => {}) {
		const delay = 125;

		this.block.removeClass("show-block");
		setTimeout(cb, delay);
	}

	clear() {
		if(!this.form)
			return;
		
		for(let value of this.form.currentSchema) {
			clearField(value.type, $(value.field), value)
		}

		if (this.validate)
			this.removeErrors();

		this.closeBlockInStack();

		function clearField(type, field, schema) {
			switch (type) {
				case "input":
					field.val("")
					break;
				case "select":
					schema.selector.setDefault();
					break;
				case "text":
					field.text("");
					break;
				case "slider":
					schema.slider.clear();
					break;
				default:
					break;
			}
		}
	}

	clearAll() {
		while(this.formStack.length != 0)
			this.clear();
	}

	setEvent(state, target) {
		let activeState,
			eventList = new Map();

		let close = (state) => {
		    return (e) => {
		        if (e.delegateTarget === e.target) {
		        	if ( state == "succes" && !this.submit()) { 
		                return;
		            }

		            if (activeState) {
		                for (let [key, value] of eventList) {
		                    key.off("click", value);
		                }
		                
		                eventList.clear();
		                this.hide(() => { this.clearAll(); });
		                activeState = false;
		            }
		        }
		    }
		};

		let result = (state, target  = this.block) => {
			let temp = close(state);
			
			activeState = true;
			eventList.set(target, temp);
			target.on("click", temp);
		};

		this.setEvent = result;
		result(state, target);
	}

	submit() {
		let obj = this.getObject(this.form.initialObject),
			options = {},
			equality,
			result;

		if ( this.form.initialObject && equalityOfObjects(this.form.initialObject, obj, this.form.currentSchema) ) {
			return true;
		}

		for(let value of this.form.currentSchema) {
			if (value.validation)
				options[value.name] = value.validation;
		}

		if (this.validate) {
			result = new this.validate.func().validate(obj, options);

			if (Object.keys(result) == 0) {
		    	this.form.succesCallBack(null, obj);
			}
		    else {
		    	this.errorHandler(result);
		    	return false;
		    }
		} else {
			this.form.succesCallBack(null, obj);
		}

		return true;

		function equalityOfObjects(mainObject = {}, object, schema) {
			let result = true;

			for(let field of schema) {
				switch (field.type) {
					case "input":
						result &= mainObject[field.name] == object[field.name];
						break;
					case "select":
						result &= mainObject[field.name] && 
							mainObject[field.name][field.selectorConfig.key] == object[field.name];
						break;
					case "slider":
						result &= JSON.stringify(mainObject[field.name]) === JSON.stringify(object[field.name]);
						break;
					default:
						break;
				}
			}

			return result;
		}
	}

	getObject(obj = {}) {
		let temp = JSON.parse( JSON.stringify(obj) ); 
		
		for(let value of this.form.currentSchema) {
			let val = getField(value.type, $(value.field), value);

			if (val !== undefined)
				temp[value.name] = val;
		}

		return temp;

		function getField(type, field, schema) {
			switch (type) {
				case "input":
					return field.val()
					break;
				case "select":
					return schema.selector.getSetValue();
					break;
				case "slider":
					return schema.slider.getData();
					break;
				default:
					break;
			}
		}
	}

	errorHandler(error) { 
		for(let value of this.form.currentSchema) {
			if(error[value.name])
				this.setError( $(value.field),  $(value.field).siblings(".popup-form_error-block"), value.type);
			else
				this.removeError( $(value.field),  $(value.field).siblings(".popup-form_error-block"), value.type);
		}
	}

	setError(field, errorBlock, type) {
		field.addClass("popup-form_error");
		errorBlock.addClass("show-block");
	}

	removeError(field, errorBlock, type) { 
		field.removeClass("popup-form_error");
		errorBlock.removeClass("show-block");
	}

	removeErrors() {
		for(let value of this.form.currentSchema) {
			this.removeError($(value.field), $(value.field).siblings(".popup-form_error-block"), value.type);
		}
	}

	createNestedForm() { 
		let html = `
			<div class="popup-form_nested-container-header">
	            <div class="popup-form_nested-container-back" data-action="return">
	                <i class="fa fa-arrow-left" aria-hidden="true"></i>
	            </div>
	            <div class="popup-form_nested-container-header-title"></div>
	        </div>`;

		for(let element of this.nestedElements) {
			element.DOM = {};
			element.DOM.block = $(element.block);
			element.DOM.container = element.DOM.block.parent();

			let header = $(html);
			element.DOM.container.prepend(header);

			element.DOM.return = header.find("div[data-action='return']");
			element.DOM.title = header.find(".popup-form_nested-container-header-title");
			element.DOM.loading = element.DOM.block.find(".popup-form_body-container-wrapper-loading");
			element.DOM.succes = $(element.succes);

			element.DOM.succes.on("click", () => {
				if(this.form.currentBlock === element.DOM)
					this.submit();
			});
		}
	}

	openNestedElement({ nestedElement: {id , title}, serverRequest }, initialCB = () => {}) {
		let cb = (...args) => {
			this.form.currentBlock.loading.removeClass("active");
			this.clear();
			initialCB(...args);
		},
		callBack = () => {
			if (serverRequest)
				return (error, result) => {
					if (error)
						return;

					this.form.currentBlock.loading.addClass("active");
					this.connector.customEventRequest(serverRequest.eventName, result, cb);
				};
			
			return cb;
		},
		close = () => {
			this.clear();
		}

		let block;

		for(let element of this.nestedElements)
			if (element.id === id)
				block = element;

		if (!block)
			return;

		block.DOM.title.text(title)
		block.DOM.closeFunction = close;
		this.formStack.push({
			currentBlock: block.DOM,
			succesCallBack: callBack(),
			currentSchema: block.schema
		});

		this.showNestedElement()
		
		block.DOM.return.one("click", close);
	}

	showNestedElement() {
		let current = this.form.currentBlock.container,
			parent = this.previousForm.currentBlock.container 
				? this.previousForm.currentBlock.container 
				: $(this.previousForm.currentBlock).parent();
		
		
		parent.addClass("hide");
		current.show();

		setTimeout(() => {
			parent.hide();
		}, 500);
	}

	hideNestedElement() { 
		let current = this.form.currentBlock.container,
			parent = this.previousForm.currentBlock.container 
				? this.previousForm.currentBlock.container 
				: $(this.previousForm.currentBlock).parent();
		
		
		parent.show();
		
		setTimeout(() => {
			parent.removeClass("hide");
		}, 0);

		setTimeout(() => {
			current.hide();
		}, 500);
	}

	closeNestedElement() {
		if (this.form.currentBlock && this.form.currentBlock.container)
			this.hideNestedElement();
		else if (this.form.currentBlock)
			this.block.find(this.form.currentBlock).hide();

		this.formStack.pop();
	}

	closeBlockInStack() {
		if (this.form.currentBlock && this.form.currentBlock.closeFunction)
			this.form.currentBlock.return.off("click", this.form.currentBlock.closeFunction);
 
		this.closeNestedElement();
	}
}