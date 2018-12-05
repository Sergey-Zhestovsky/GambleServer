'use strict';

import CustomDropDownSelector from '/js/module/customSelector.js';

export default class PopupForm {
	constructor({title, block, validate, behavior, succes, schema = [], relatedData}) {
		this.title = title;
		this.block = block;
		this.validate = (validate && validate.func) ? validate : false;
		this.behavior = behavior;
		this.succes = succes;
		this.schema = schema;
		this.relatedData = relatedData;

		this.initialObject;
		this.succesCallBack;
		this.action;
		this.currentSchema;

		this.createForm();
	}

	createForm() {
		let globalSchema = this.schema || [];

		if (this.behavior) {
			let keys = Object.keys(this.behavior);

			for(let behaviorObj of keys)
				behaviorObj.schema && (globalSchema = globalSchema.concat(behaviorObj.schema))
		}

		for(let field of globalSchema)
			switch (field.type) {
				case "select":
					createSelectField(field, this.relatedData);
					break;
				case "slider":
					createSlider(field);
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

		function createSlider(schemaField) {
			
		}
	}

	open(action, object, cb = object) {
		let currentBlock, succes;

		this.currentSchema = (this.behavior && this.behavior[action].schema)
			? this.behavior[action].schema 
			: this.schema;	

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

		currentBlock = this.behavior ? this.behavior[action].block : null;
		succes = this.behavior ? this.behavior[action].succes : this.succes;
		this.action = action;
		this.succesCallBack = cb;

		this.show(currentBlock);
		this.setEvent("close");
		this.setEvent("close", this.block.find(".popup-form_header-close i"));
		this.setEvent("succes", this.block.find(succes));
	}

	openEdit(object) {
		for(let value of this.currentSchema) {
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
		let currentBlock = this.behavior ? this.behavior[this.action].block : null;

		if (currentBlock)
			this.block.find(currentBlock).hide();
		
		for(let value of this.currentSchema) {
			clearField(value.type, $(value.field), value)
		}

		this.initialObject = undefined;
		this.succesCallBack = undefined;
		this.action = undefined;

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
		                this.hide(() => { this.clear(); });
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

		if ( equalObject(this.initialObject, obj, this.currentSchema) )
			return true;

		for(let value of this.currentSchema) {
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
						result &= mainObject[field.name] && 
							mainObject[field.name][field.selectorConfig.key] == object[field.name];
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
		
		for(let value of this.currentSchema) {
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
		for(let value of this.currentSchema) {
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
		for(let value of this.currentSchema) {
			this.removeError($(value.field), $(value.field).siblings(".popup-form_error-block"), value.type);
		}
	}
}