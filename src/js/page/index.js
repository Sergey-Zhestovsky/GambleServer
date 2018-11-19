let triggerEvent = "filterChanged",
	filter = new filterBlock({
		filter: $("#filterBlock"),
		typeFilter: $("#typeFilter"), 
		addressFilter: $("#addressFilter"),
		trackerFilter: $("#trackerFilter"),
		event: triggerEvent
	}),
	shop = new productBlock({
		block: $("#shop"),
		filter: filter,
		event: triggerEvent
	});

filter.getRequest();
shop.getRequest();

function filterBlock(options = {}){
	const path = "api/filters";
	let filter = options.filter,
		typeFilter = options.typeFilter,
		addressFilter = options.addressFilter,
		trackerFilter = options.trackerFilter,
		event = options.event;

	function getRequest(){
		$.ajax({
			type: 'POST',
			url: path,
			asinc: true,
			success: function(answer){

				if(answer.error)
					throw new Error("POST ERROR path: " + path);

				generateFilter(answer.result[0].data, answer.result[1].data);
			}
		});
	}

	function generateFilter(typeFilterObj, addressFilterObj){
		typeFilter.append(generateHTML(typeFilterObj));
		addressFilter.append(generateHTML(addressFilterObj));
	}

	function generateHTML(data){
		let html = '';

		for (let i = 0; i < data.length; i++)
			html += `<option data-id="${data[i].id}">${data[i].content}</option>`;

		return html;
	}

	function getFilter(){
		return {
			type: typeFilter.find("option:selected").attr("data-id") || true,
			address: addressFilter.find("option:selected").attr("data-id") || true,
			tracker: trackerFilter.attr( "checked") == "checked" ? true : null
		};
	}

	function setEvent(block, event){
		block.change(function() {
			block.trigger(event);
		});
	}
	setEvent(filter, event);

	this.getRequest = getRequest;
	this.getFilter = getFilter;
}

function productBlock(options = {}){
	const path = "api/posts",
		local = window.localization ? window.localization : {};

	let block = options.block,
		filter = options.filter,
		event = options.event,
		data;

	function getRequest(){
		$.ajax({
			type: 'POST',
			url: path,
			asinc: true,
			success: function(answer){

				if(answer.error)
					throw new Error("POST ERROR path: " + path);

				generateBlock(data = answer.result[0].data);
			}
		});
	}

	function generateBlock(productObj){
		block.html(generateHTML(productObj));
	}

	function generateHTML(data){
		let html = '';
			
		for (let i = 0; i < data.length; i++)
			html += `
				<a class="product" href="/product/${data[i].product_id}" data-id="${data[i].product_id}">
    		      <div class="product__title">${data[i].type_name}</div>
    		      <div class="product__context" style="background-image: url('/img/product/default/${data[i].type_id}.jpg')">
    		          <div class="product__context-block">
    		          		<div class="product__context-block-data">
    		              	<div class="product__context-block-field">
    		              	  <span class="product__context-block-field-title">${local.firm}</span>
    		              	  <span class="product__context-block-field-description">${data[i].product_company}</span>
    		              	</div>
    		              	<div class="product__context-block-field">
    		              	  <span class="product__context-block-field-title">${local.model}</span>
    		              	  <span class="product__context-block-field-description">${data[i].product_model}</span>
    		              	</div>
    		              	<div class="product__context-block-field">
    		              	  <span class="product__context-block-field-title">${local.address}</span>
    		              	  <span class="product__context-block-field-description">${data[i].address_city}, ${data[i].address_place}</span>
    		              	</div>
    		              </div>
    		              <div class="product__context-block-link">
    		                <div class="product__context-block-link-button">${local.follow}</div>
    		                <div class="product__context-block-link-img"></div>
    		              </div>
    		          </div>
    		      </div>
    		      <div class="product__price">
    		      	<div class="product__price-title">${local.price}</div>
    		      	<div class="product__price-data">${data[i].product_price}</div>
    		      </div>
    		  </a>
			`;

		return html;
	}

	function catchEvent(event, callback){
		$("body").on(event, callback);
	}

	function filterProducts(){
		let filteкСondition = filter.getFilter();

		filtered = data.filter(function(item, i, arr) {
			return (
				(filteкСondition.type === true || filteкСondition.type == item.type_id) &&
				(filteкСondition.address === true || filteкСondition.address == item.address_id) &&
				(filteкСondition.tracker === true && item.tracker_id !== null || filteкСondition.tracker == item.tracker_id)
			)
		});
		console.log(filtered)

		block.find(".product").hide();
		filtered.map(function(item, i, arr){
			return block.find(`.product[data-id='${item.product_id}']`).first().show();
		});
	}

	catchEvent(event, filterProducts);

	this.getRequest = getRequest;
}