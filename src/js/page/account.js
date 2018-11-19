let userProfile = new profileInfo({
  block: $("#profileContainer")
});

let edditB = new editBlock({
  form: $("#editBlock"),
  wrapperBlock: $("#editBlockWrapper")
});

let overlook = new overLook({
  wrapperBlock: $("#editBlockWrapper"),
  block: $("#overlookDlock")
});

let tables = new manager({
  ounProduct: $("#ownDevicesTable"),
  rentedProduct: $("#rentedDevicesTable"),
  addButton: $("#addButton"),
  editForm: edditB,
  overlookForm: overlook,
  userProfile,
});

function profileInfo(options) {
  let block = options.block,
      fields = {
        account: block.find("#accountData")
      },
      buttons = {
        replenishAccount: block.find("#replenishAccount")
      };

  function setData(field, data) {
    field.text(data);
  }

  function setAccount(data = fields.account.text()) {
    if(data > 0) {
      fields.account.removeClass("account-value-low").addClass("account-value-normal");
    } else {
      fields.account.removeClass("account-value-normal").addClass("account-value-low");
    }

    fields.account.text(data);
  }

  function getAccount() {
    return fields.account.text();
  }
  
  function replenish(data) {
    const path = "/account/stub/replenishAccount";

    $.ajax({
      type: 'POST',
      url: path,
      data,
      asinc: true,
      success: function(answer){
        if(answer.error)
          throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);
        
        let account = getResultFromAnswer(answer.result, "selectAccount")[0].user_account;
        setAccount(account);
      }
    });
  }

  function replenishStub(){
    replenish({
      cacheAmount: 100
    });
  }

  setAccount();
  buttons.replenishAccount.click(replenishStub);

  this.setAccount = setAccount;
  this.getAccount = getAccount;
}

function manager(options){
  let ownProduct = options.ounProduct,
      rentedProduct = options.rentedProduct,
      addButton = options.addButton,
      editForm = options.editForm,
      overlookForm = options.overlookForm,
      userProfile = options.userProfile;

  function getRequest(){
    const path = "/account/api/getAccountTables";

    $.ajax({
      type: 'POST',
      url: path,
      asinc: true,
      success: function(answer){
        if(answer.error)
          throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

        generateOwnProductTables(answer.result[0].data);
        generateRentedProductTables(answer.result[1].data);
      }
    });
  }

  function generateOwnProductTables(data){
    let fragment = document.createDocumentFragment();

    for (var i = 0; i < data.length; i++) {
      fragment.appendChild(generateOwnProductTablesHTML(data[i], i+1));
    }

    ownProduct.find("tbody").html(fragment);
  }

  function appendOwnProductTables(data, iterator){
    ownProduct.find("tbody").append(generateOwnProductTablesHTML(data, iterator));
  }

  function generateOwnProductTablesHTML(data, iterator) {
    let html = document.createElement("tr"),
        temp = '';

    html.product = data;
    iterator = iterator || ownProduct.find("tbody tr").size() + 1;

    temp =  `          
        <td>${iterator}</td>
        <td>${data.type_name}</td>
        <td>${data.product_company}</td>
        <td>${data.product_model}</td>
        <td class="account__table-button-cell">
          ${data.rent_id != null? '<i class="far fa-check-circle fa-2x"></i>' : '<i class="far fa-times-circle fa-2x"></i>'}  
        </td>
        <td>${data.address_city}, ${data.address_place}</td>`;

      if(data.product_isInitialDelivered != 0){
        temp += generateOwnProductTablesButtons("dafault", data.rent_id);
      }else{
        temp += generateOwnProductTablesButtons("delivery", data.rent_id);
      }
      temp += "</tr>";
      html.innerHTML = temp

      return html;
  }

  function generateOwnProductTablesButtons(action, isRented = 1) {
    switch(action){
      case "dafault":
        return `
          <td class="account__table-button-cell"><div class="account__table-button ${isRented != null ? 'disabled' : ""}" data-action="edit">${localization.edit}</div></td>
          <td class="account__table-button-cell"><div class="account__table-button ${isRented != null ? 'disabled' : ""}" data-action="takeOut">${localization.takeAway}</div></td>
        `;
      case "delivery":
        return `
          <td class="account__table-button-cell"><div class="account__table-button" data-action="delivered">${localization.delivered}</div></td>
          <td class="account__table-button-cell"><div class="account__table-button" data-action="remove">${localization.cancel}</div></td>
        `;
      case "takeOut":
        return `
          <td class="account__table-button-cell"><div class="account__table-button" data-action="remove">${localization.collected}</div></td>
          <td class="account__table-button-cell"><div class="account__table-button" data-action="removeCancel">${localization.cancel}</div></td>
        `;
      default:
        return `
          <td class="account__table-button-cell"></td>
          <td class="account__table-button-cell"></td>
        `;
    }
  }

  function generateRentedProductTables(data) {
    let fragment = document.createDocumentFragment();

    for (var i = 0; i < data.length; i++) {
      fragment.appendChild(generateRentedProductTablesHTML(data[i], i+1));
    }

    rentedProduct.find("tbody").html(fragment);
  }

  function generateRentedProductTablesHTML(data, iterator) {
    let html = document.createElement("tr"),
        temp = '';

    html.product = data;
    temp += `
      <tr>
        <td>${iterator}</td>
        <td>${data.type_name}</td>
        <td>${data.product_model}</td>
        <td>${data.address_city}, ${data.address_place}</td>
        <td>${data.rent_dataFrom == null ? "" : data.rent_dataFrom}</td>
    `;

    if(data.rent_dataFrom == null){
      temp += generateRentedProductTablesButtons("pickUp", data);
    }else{
      temp += generateRentedProductTablesButtons("dafault");
    }

    temp += "</tr>";
    html.innerHTML = temp;
    return html;
  }

  function generateRentedProductTablesButtons(action, data){
    switch(action){
      case "dafault":
        return `
          <td class="account__table-button-cell"></td>
          <td class="account__table-button-cell"></td>
          <td class="account__table-button-cell"><div class=" account__table-button" data-action="return">${localization.return}</div></td>
          <td class="account__table-button-cell"></td>
        `;
      case "pickUp":
        return `
          <td class="account__table-button-cell">${data.container_id}</td>
          <td class="account__table-button-cell">${data.container_password}</td>
          <td class="account__table-button-cell"><div class=" account__table-button" data-action="received">${localization.received}</div></td>
          <td class="account__table-button-cell"><div class=" account__table-button" data-action="remove">${localization.cancel}</div></td>
        `;
      case "return":
        return `
          <td class="account__table-button-cell">${data.container_id}</td>
          <td class="account__table-button-cell">${data.container_password}</td>
          <td class="account__table-button-cell"><div class=" account__table-button" data-action="remove">${localization.returned}</div></td>
          <td class="account__table-button-cell"><div class=" account__table-button" data-action="returnCancel">${localization.cancel}</div></td>
        `;
      default:
        return `
          <td class="account__table-button-cell"></td>
          <td class="account__table-button-cell"></td>
        `;
    }
  }

  function ownTableButtonAction(e){
    let action = $(this).attr("data-action"),
        block = $(this).parents("tr"),
        productData = block.get(0).product;

    switch(action){
      case "edit":
        if(productData.rent_id === null)
          editForm.openEdit(editOwnProduct, productData);
        break;
      case "delivered":
        if(!productData.product_isInitialDelivered)
          deliveryOwnProduct(productData, action);
        break;
      case "takeOut":
        if(productData.rent_id === null)
          changeTableButtons(block, generateOwnProductTablesButtons(action));
        break;
      case "removeCancel": 
        changeTableButtons(block, generateOwnProductTablesButtons("dafault", productData.rent_id));
        break;
      case "remove": 
        if(productData.rent_id === null)
          deleteOwnProduct(productData.product_id)
        break;
      default:
        break;
    }

    function editOwnProduct(product){
      block.replaceWith(generateOwnProductTablesHTML(product, block.find('td:eq(0)').text()));
    }

    function deliveryOwnProduct(data, action){
      const path = '/account/api/deliveryProduct';

      $.ajax({
        type: 'POST',
        url: path,
        data: ({
          id: data.product_id
        }),
        asinc: true,
        success: function(answer){
          if(answer.error)
            throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

          data.product_isInitialDelivered = 1;
          changeTableButtons(block, generateOwnProductTablesButtons("dafault", data.rent_id));
        }
      });
    }

    function deleteOwnProduct(id){
      const path = `/account/api/deleteProduct`;
  
      $.ajax({
        type: 'POST',
        url: path,
        data: ({
          id
        }),
        asinc: true,
        success: function(answer){console.log(answer)
          if(answer.error)
            throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

          block.remove();
        }
      });
    }

    function changeTableButtons(block, html){
      block.find("td:last-child, td:nth-last-child(2)").remove();
      block.append(html);
    }
  }

  function rentedTableButtonAction(e){
    let action = $(this).attr("data-action"),
        block = $(this).parents("tr"),
        productData = block.get(0).product;

    switch(action){
      case "received":
        receivedRentedProduct(productData);
        break;
      case "return":
        changeTableButtons(block, generateRentedProductTablesButtons(action, productData));
        break;
      case "returnCancel":
        changeTableButtons(block, generateRentedProductTablesButtons("dafault"));
        break;
      case "remove": 
          removeRentedProduct(productData);
        break;
      default:
        break;
    }

    function receivedRentedProduct(data){
      const path = '/account/api/receiveRentedProduct';

      $.ajax({
        type: 'POST',
        url: path,
        data: ({
          id: data.rent_id
        }),
        asinc: true,
        success: function(answer){
          if(answer.error)
            throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

          changeTableButtons(block, generateRentedProductTablesButtons("dafault"));
        }
      });
    }

    function removeRentedProduct(data){
      const path = '/account/api/removeRentedProduct';

      $.ajax({
        type: 'POST',
        url: path,
        data: ({
          id: data.rent_id
        }),
        asinc: true,
        success: function(answer){console.log(answer);
          if(answer.error)
            throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

          block.remove();
          let paymentData = getResultFromAnswer(answer.result, "paymentData"); 
          userProfile.setAccount( userProfile.getAccount() - paymentData );    
        }
      });
    }

    function changeTableButtons(block, html){
      block.find("td:last-child, td:nth-last-child(2), td:nth-last-child(3), td:nth-last-child(4)").remove();
      block.append(html);
    }
  }

  function overlookProduct(e){
    if($(e.target).hasClass('account__table-button'))
      return;

    let data = this.product;

    overlook.showData(data);
  }

  getRequest();
  addButton.click(function(){
    editForm.openAdd(tables.appendOwnProductTables);
  });
  ownProduct.on('click', 'tbody tr', overlookProduct);
  ownProduct.on('click', '.account__table-button', ownTableButtonAction);
  rentedProduct.on('click', '.account__table-button', rentedTableButtonAction);

  this.appendOwnProductTables = appendOwnProductTables;
}

function editBlock(options) {
  let form = options.form,
      wrapperBlock = options.wrapperBlock,
      productId,
      fields = {
        type: form.find('#editFieldType'),
        company: form.find('#editFieldCompany'),
        model: form.find('#editFieldModel'),
        state: form.find('#editFieldState'),
        address: form.find('#editFieldAddress'),
        price: form.find('#editFieldPrice'),
        tracker: form.find('#editFieldTracker'),
        context: form.find('#editFieldContext')
     };

  function openAdd(callback){
    let filterOption = {
      type: ["required"],
      company: ["required"],
      model: ["required"],
      address: ["required"],
      price: ["required", "float"]
    };
        
    open(callback, "addProduct", filterOption);
    form.find("#editFieldAddress").parent().show();
  }

  function openEdit(callback, product){
    let filterOption = {
      type: ["required"],
      company: ["required"],
      model: ["required"],
      price: ["required", "float"]
    };
        
    open(callback, "editProduct", filterOption, product.product_id);
    fillFormWithData(product);
    form.find("#editFieldAddress").parent().hide();
    form.find("#editFieldTracker").parent().hide();
  }

  function open(callback, action, filterOption, id){
    productId = id || null;

    clearForm();
    wrapperBlock.show();
    form.show();
    wrapperBlock.one("click", close);
    form.find("#editBlockSubmit").on("click", null, {callback, action, filterOption}, productRequest);
  }

  function fillFormWithData(data){
    fields.type.find(`option[data-id='${data.type_id}']`).attr("selected", "selected");
    fields.company.val(data.product_company)
    fields.model.val(data.product_model)
    fields.state.val(data.product_state)
    fields.price.val(data.product_price)
    fields.context.val(data.product_context)
  }

  function clearForm(){
    setErrors();

    form.find("input").val("");
    form.find("textarea").val("");
    form.find("select").each(function(){
      $(this).find('option:eq(0)').attr("selected", "selected");
    });
  }

  function close(){
    form.hide();
    wrapperBlock.hide();
  }

  function setSelectors(){
    const path = "api/filters";
    let typeSelector = form.find("#editFieldType"),
        addressSelector = form.find("#editFieldAddress");

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

    function generateFilter(typeFilterObj, addressFilterObj){
      typeSelector.append(generateHTML(typeFilterObj));
      addressSelector.append(generateHTML(addressFilterObj));
    }

    function generateHTML(data){
      let html = '';

      for (let i = 0; i < data.length; i++)
        html += `<option data-id="${data[i].id}">${data[i].content}</option>`;

      return html;
    }
  }

  function submit(option){
    let data = {
      id: productId,
      type: fields.type.find('option:selected').attr("data-id"),
      company: fields.company.val(),
      model: fields.model.val(),
      state: fields.state.val(),
      address: fields.address.find('option:selected').attr("data-id"),
      price: fields.price.val(),
      tracker: fields.tracker.attr("checked") !== undefined,
      context: fields.context.val()
    },
        result = new formValidator().validate(data, option);

    if(Object.keys(result) == 0)
      return data;
    else
      setErrors(result);
      return false;
  }

  function productRequest(e){
    let values = submit(e.data.filterOption);
    if(values != false)    
      addDataRequest();

    function addDataRequest(){
      const path = `/account/api/${e.data.action}`;
  
      $.ajax({
        type: 'POST',
        url: path,
        data: (values),
        asinc: true,
        success: function(answer){
          if(answer.error)
            throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

          form.find("#editBlockSubmit").off("click", productRequest);
          close();

          e.data.callback(getResultFromAnswer(answer.result, "selectProduct")[0]);
        }
      });
    }
  }

  function setErrors(errors){
    let errorClass = "edit-product__form-error"
    
    form.find('.'+errorClass).removeClass(errorClass);

    for(let key in errors){
      if(key in fields)
        fields[key].addClass(errorClass);
    }
  }

  setSelectors();
  form.find("#editBlockBack").click(close);

  this.openAdd = openAdd;
  this.openEdit = openEdit;
  this.close = close;
}

function overLook(options) {
  let wrapperBlock = options.wrapperBlock,
      block = options.block,
      fields = {
        type: block.find("#overlookFieldType"),
        firm: block.find("#overlookFieldFirm"),
        model: block.find("#overlookFieldModel"),
        state: block.find("#overlookFieldState"),
        describe: block.find("#overlookFieldDescribe"),
        price: block.find("#overlookFieldPrice"),
        contNum: block.find("#overlookFieldCNumber"),
        countPass: block.find("#overlookFieldCPass"),
        rent: block.find("#overlookFieldRent"),
        address: block.find("#overlookFieldAddress")
      },
      socket;

  function open(){
    wrapperBlock.show();
    block.show();
    wrapperBlock.one("click", close);
    socket = io({transports: ['websocket'], upgrade: false, reconnection: false});
  }
  function clearForm(){
    block.find(".edit-product__form-label-value").html("");
  }
  function close(){
    clearForm();
    block.hide();
    wrapperBlock.hide();
    socket.disconnect();
  }

  function showData(data) {
    clearForm();

    fields.type.text(data.type_name);
    fields.firm.text(data.product_company);
    fields.model.text(data.product_model);
    fields.state.text(data.product_state);
    fields.describe.text(data.product_context);
    fields.price.text(data.product_price);
    fields.contNum.text(data.container_id);
    fields.countPass.text(data.container_initial_password);
    if(data.rent_id != null)
      fields.rent.html('<i class="far fa-check-circle fa-2x"></i>');
    else
      fields.rent.html('<i class="far fa-times-circle fa-2x"></i>');
    fields.address.text(data.address_city + ", " + data.address_place);

    open();

    let jMap = $("#overlookFieldAMap"),
        coord = data.tracker_coordinates != null ?
          data.tracker_coordinates :
          data.address_coordinates;

    coord = JSON.parse(coord);

    let map = new google.maps.Map(document.getElementById('overlookFieldAMap'), {
      zoom: 16,
      center: coord,
      disableDefaultUI: true,
      fullscreenControl: true

    }),
    marker = new google.maps.Marker({
      position: coord,
      map: map
    });

    socket.on("news", function (socketMessage) {
      if(socketMessage.id == data.tracker_id)
        marker.setPosition(socketMessage.location);
    });
  }

  block.find("#overlookBack").click(close);

  this.showData = showData;
}

function getResultFromAnswer(answer, title) {
  for(let i = 0; i < answer.length; i++){
    if(answer[i].title == title)
      return answer[i].data;
  }
  return false;
}