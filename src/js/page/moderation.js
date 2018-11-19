let edditB = new editBlock({
  form: $("#editBlock"),
  wrapperBlock: $("#editBlockWrapper")
});

let tables = new manager({
  userTable: $("#userTable"),
  rentTable: $("#rentTable"),
  deliveryTable: $("#deliveryTable"),
  editForm: edditB
});

function manager(options){
  let userTable = options.userTable,
      rentTable = options.rentTable,
      deliveryTable = options.deliveryTable,
      editForm = options.editForm

  function getRequest(){
    const path = "/moderation";

    $.ajax({
      type: 'POST',
      url: path,
      asinc: true,
      success: function(answer){
        if(answer.error)
          throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

        
        generateTable(answer.result[0].data, userTable, generateUserConfirmHTML);
        //generateTable(answer.result[1].data, rentTable, generateProductHTML);
        generateTable(answer.result[1].data, deliveryTable, generateProductHTML);
      }
    });
  }

  function generateTable(data, toBlock, generatorFunction){
    let fragment = document.createDocumentFragment();

    for (var i = 0; i < data.length; i++) {
      fragment.appendChild(generatorFunction(data[i], i+1));
    }

    toBlock.find("tbody").html(fragment);
  }

  function generateUserConfirmHTML(data, iterator) {
    let html = document.createElement("tr"),
        temp = '';

    html.user = data;

    temp =  `
      <td>${iterator}</td>
      <td>${data.user_id}</td>
      <td>${data.user_name}</td>
      <td>${data.user_mail}</td>
      <td>${data.user_account}</td>
      <td class="account__table-button-cell"><div class="account__table-button">${localization.confirm}</div></td>`;

    html.innerHTML = temp;

    return html;
  }

  function generateProductHTML(data, iterator) {
    let html = document.createElement("tr"),
        temp = '';

    html.product = data;

    temp =  `
      <td>${iterator}</td>
      <td>${data.product_id}</td>
      <td>${data.address_city}, ${data.address_place}</td>
      <td>${data.container_id}</td>
      <td class="account__table-button-cell"><div class="account__table-button">${localization.confirm}</div></td>`;

    html.innerHTML = temp;

    return html;
  }

  function openEditForm(){
    let block = $(this).parents("tr"),
        user = block.get(0).user;

    editForm.open(function(data){
      block.remove();
    }, user);
  }

  function confirmDelivery(){
    const path = `/moderation/confirmDelivery`;

    let block = $(this).parents("tr"),
        data = block.get(0).product;

      $.ajax({
        type: 'POST',
        url: path,
        data: ({
          id: data.product_id,
          userId: data.user_id
        }),
        asinc: true,
        success: function(answer){
          if(answer.error)
            throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

          block.remove();
        }
      });
    
  }

  getRequest();

  userTable.on('click', '.account__table-button', openEditForm);
  deliveryTable.on('click', '.account__table-button', confirmDelivery);
}

function editBlock(options) {
  let form = options.form,
      wrapperBlock = options.wrapperBlock,
      userId,
      fields = {
        id: form.find('#editFieldId'),
        name: form.find('#editFieldName'),
        mail: form.find('#editFieldMail'),
        passportId: form.find('#editFieldPasspordId')
     };

  function open(callback, data){
    userId = data.user_id;

    let filterOption = {
      passportId: ["required"]
    };

    clearForm();
    fillFormWithData(data);
    wrapperBlock.show();
    form.show();
    wrapperBlock.one("click", close);
    form.find("#editBlockSubmit").on("click", null, {callback, filterOption}, userRequest);
  }

  function fillFormWithData(data){
    fields.id.text(data.user_id);
    fields.name.text(data.user_name);
    fields.mail.text(data.user_mail);
  }

  function clearForm(){
    setErrors();
    form.find("input").val("");
    form.find(".edit-product__form-label-value").html("");
  }

  function close(){
    form.hide();
    wrapperBlock.hide();
  }

  function setErrors(errors){
    let errorClass = "edit-product__form-error"
    
    form.find('.'+errorClass).removeClass(errorClass);

    for(let key in errors){
      if(key in fields)
        fields[key].addClass(errorClass);
    }
  }

  function submit(option){
    let data = {
      passportId: fields.passportId.val()
    },
      result = new formValidator().validate(data, option);

    if(Object.keys(result) == 0)
      return data;
    else
      setErrors(result);
      return false;
  }

  function userRequest(e){
    let values = submit(e.data.filterOption);
    values.id = userId;
    if(values != false)    
      addDataRequest();

    function addDataRequest(){
      const path = `/moderation/confirmUser`;

      $.ajax({
        type: 'POST',
        url: path,
        data: (values),
        asinc: true,
        success: function(answer){
          if(answer.error)
            throw new Error(`POST ERROR path: ${path}. \n ${answer.error.message}`);

          form.find("#editBlockSubmit").off("click", userRequest);
          close();

          e.data.callback(answer);
        }
      });
    }
  }

  form.find("#editBlockBack").click(close);

  this.open = open;
}

function getResultFromAnswer(answer, title) {
  for(let i = 0; i < answer.length; i++){
    if(answer[i].title == title)
      return answer[i].data;
  }
  return false;
}