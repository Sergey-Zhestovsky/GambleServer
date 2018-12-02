'use strict';

import CustomDropDownSelector from '/js/module/customSelector.js';

export default class PopupForm {
	constructor({title, block, validate, succes, schema, relatedData}) {
		this.title = title;
		this.block = block;
		this.validate = (validate && validate.func) ? validate : false;
		this.succes = succes;
		this.schema = schema;
		this.relatedData = relatedData;

		this.initialObject;
		this.succesCallBack;

		this.createForm();
	}

	createForm() {
		for(let field of this.schema)
			switch (field.type) {
				case "select":
					createSelectFiald(field, this.schema, this.relatedData);
					break;
				default:
					break;
			}

		function createSelectFiald(schemaField, schema, source) {
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
	}

	open(action, object, cb = object) {
		switch (action) {
			case "add":

				break;
			case "edit":
				this.openEdit(object);
				this.initialObject = object;
				break;
			default:
				return cb("unknown action")
				break;
		}

		this.succesCallBack = cb;

		this.show();
		this.setEvent("close");
		this.setEvent("close", this.block.find(".popup-form_header-close i"));
		this.setEvent("succes", this.block.find(this.succes));
	}

	openEdit(object) {
		for(let value of this.schema) {
			fillField(value.type, $(value.field), object[value.name], value);
		}

		function fillField(type, field, data, schemaField) {
			switch (type) {
				case "input":
					field.val(data)
					break;
				case "select":
					schemaField.selector.getSetValue( data[schemaField.selectorConfig.key],  data[schemaField.selectorConfig.value])
					break;
				default:
					break;
			}
		}
	}

	show() {
		this.block.addClass("show-block");
	}

	hide(cb = () => {}) {
		const delay = 125;
		this.block.removeClass("show-block");
		setTimeout(cb, delay);
	}

	clear() {
		for(let value of this.schema) {
			clearField(value.type, $(value.field), value)
		}

		this.initialObject = undefined;
		this.succesCallBack = undefined;

		if (this.validate)
			this.removeErrors();

		function clearField(type, field, schema) {
			switch (type) {
				case "input":
					field.val("")
					break;
				case "select":
					schema.selector.setDefault();
					break;
				default:
					break;
			}
		}
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
		                this.hide(() => {
		                	this.clear();
		                });
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
		let obj = this.getObject(this.initialObject),
			options = {},
			result;

		if ( equalObject(this.initialObject, obj, this.schema) )
			return true;

		for(let value of this.schema) {
			if (value.validation)
				options[value.name] = value.validation;
		}

		if (this.validate) {
			result = new this.validate.func().validate(obj, options);

			if (Object.keys(result) == 0) {
		    	this.succesCallBack(null, obj);
			}
		    else {
		    	this.errorHandler(result);
		    	return false;
		    }
		} else {
			this.succesCallBack(null, obj);
		}

		return true;

		function equalObject(mainObject = {}, object, schema) {
			let result = true;

			for(let field of schema) {
				switch (field.type) {
					case "input":
						result &= mainObject[field.name] == object[field.name];
						break;
					case "select":
						result &= mainObject[field.name] && mainObject[field.name][field.selectorConfig.key] == object[field.name];
						break;
					default:
						break;
				}
			}

			return result;
		}
	}

	getObject(obj = {}) {
		let temp = {}; 
		Object.assign(temp, obj);
		
		for(let value of this.schema) {
			temp[value.name] = getField(value.type, $(value.field), value)
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
				default:
					break;
			}
		}
	}

	errorHandler(error) { 
		for(let value of this.schema) {
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
		for(let value of this.schema) {
			this.removeError($(value.field), $(value.field).siblings(".popup-form_error-block"), value.type);
		}
	}
}