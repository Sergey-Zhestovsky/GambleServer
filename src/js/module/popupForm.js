'use strict';

export default class PopupForm {
	constructor({title, block, validate, succes, schema}) {
		this.title = title;
		this.block = block;
		this.validate = (validate && validate.func) ? validate : false;
		this.succes = succes;
		this.schema = schema;

		this.initialObject;
		this.succesCallBack;
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
			fillField(value.type, $(value.field), object[value.name])
		}

		function fillField(type, field, data) {
			switch (type) {
				case "input":
					field.val(data)
					break;
				default:
					break;
			}
		}
	}

	show() {
		this.block.addClass("show-block");
	}

	hide() {
		this.block.removeClass("show-block");
	}

	clear() {
		for(let value of this.schema) {
			clearField(value.type, $(value.field))
		}

		this.initialObject = undefined;
		this.succesCallBack = undefined;

		if (this.validate)
			this.removeErrors();

		function clearField(type, field) {
			switch (type) {
				case "input":
					field.val("")
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
		                this.clear();
		                this.hide();
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
	}

	getObject(obj = {}) {
		for(let value of this.schema) {
			obj[value.name] = getField(value.type, $(value.field))
		}

		return obj;

		function getField(type, field) {
			switch (type) {
				case "input":
					return field.val()
					break;
				default:
					break;
			}
		}
	}

	errorHandler(error) { 
		for(let value of this.schema) {
			if(error[value.name])
				this.setError( $(value.field),  $(value.field).siblings(".popup-form_error-block") );
			else
				this.removeError( $(value.field),  $(value.field).siblings(".popup-form_error-block") );
		}
	}

	setError(field, errorBlock) {
		field.addClass("popup-form_error");
		errorBlock.addClass("show-block");
	}

	removeError(field, errorBlock) { 
		field.removeClass("popup-form_error");
		errorBlock.removeClass("show-block");
	}

	removeErrors() {
		for(let value of this.schema) {
			this.removeError($(value.field), $(value.field).siblings(".popup-form_error-block"));
		}
	}
}