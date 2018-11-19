let tabMenu = new productTab($("#tabMenu"));
tabMenu.click(1);

let priceT = new valueTable({
  table: $("#priceTable")
});
priceT.generateTable();

let rent = rentProduct({
  button: $("#rentButton")
})


function productTab(block){
  let tab = block,
      content = tab.find(".product-revue__data-block");

  tab.on("click", ".product-revue__tabs-button[data-active]", tabButtonEvent);

  function tabButtonEvent(e){
    let block = $("#" + $(this).attr("data-container-id"));

    if(!block.length || $(this).attr("data-active") == true)
      return;

    $(this).parent().find(e.handleObj.selector).attr("data-active", "");
    $(this).attr("data-active", "true");

    toggleContent(block);
  }

  function toggleContent(element){
    if(element === undefined)
      return;

    content.hide();
    element.show();

    return element;
  }

  this.toggleContent = toggleContent;
  this.click = function(block){
    if(isNaN(block) && block.length){
      return block.trigger("click");
    }
    
    if(block){
      return tab.find(`.product-revue__tabs-button[data-active]:eq(${block - 1})`).trigger("click");
    }
   
    return false;
  }
}

function rentAlert(options){
  const animationTime = 150;
  let alertBlock  = options.block,
      title  = options.title || "",
      message  = options.message || "",
      link  = options.link || "",
      linkMessage  = options.linkMessage || "";
  editAlert();

  function set(options){
    title  = options.title,
    message  = options.message,
    link  = options.link,
    linkMessage  = options.linkMessage;

    editAlert();
  }
  function editAlert(){
    $(".popup-block__title").text(title);
    $(".popup-block__message").text(message + ".");
    $(".popup-block__link").text(link);
    $(".popup-block__link").attr("href", linkMessage);
  }
  function show(){
    alertBlock.show();
    alertBlock.animate({
      opacity: 1
      }, animationTime);
    alertBlock.show();
  }
  function hide(){  
    alertBlock.animate({
      opacity: 0
    }, animationTime, function() {
      alertBlock.show();
    });    
  }

  alertBlock.on("click", ".popup-block__close-button", hide);

  this.show = show;
  this.hide = hide;
  this.set = set;
}

function valueTable(options){
  const step = [1, 2, 3, 5, 7, 14, 30];
  let table = options.table,
      price = table.attr("data-value"),
      toBlock = table.find("tbody").first();

  function generateTable(){
    let html = '';

    for(let i = 0; i < step.length; i++){
      html += `
        <tr>
          <td>${step[i]}</td>
          <td>${ (((step[i] * price)*100)|0)/100 }</td>
        </tr>`;
    }

    toBlock.html(html);
  }

  this.generateTable = generateTable;
}

function initMap() {
  let jMap = $("#map"),
      coord = JSON.parse(jMap.attr("data-coordinates")),
      address = jMap.attr("data-address");

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: coord,
    disableDefaultUI: true
  });
  var geocoder = new google.maps.Geocoder;
  var infowindow = new google.maps.InfoWindow({
      content: address
    });

  var marker = new google.maps.Marker({
    position: coord,
    map: map
  });
  infowindow.open(map, marker);
}

function rentProduct(ontions){
  const path = "/product/api/rentProduct";
  let button = ontions.button,
      productId = button.attr("data-value"),
      isRent = button.hasClass("button-disable");


  function getRequest(){
    if(isRent) return;

    $.ajax({
      type: 'POST',
      data: ({
        productId
      }),
      url: path,
      asinc: true,
      success: function(answer){
        if(answer.error != null)
          return errorHandler(answer.error)

        getAnswer(getResultFromAnswer(answer.result, "setRent").affectedRows);
      }
    });

    function errorHandler(error) {
      switch(error.title){
        case "notEnoughMoney":
          getAnswer("notEnoughMoney");
          break;
        case "selfRent":
          getAnswer("selfRent");
          break;
        default:
          throw new Error(`POST ERROR path: ${path}. \n ${error.message}`);
          break;
      }
    }
  }

  function getAnswer(answer){
    local = window.localization ? window.localization : {};

    let buttonAlert = new rentAlert({
      block: $("#rentAlert") 
    });

    switch(answer) {
      case 1:
        generateAlert(localization.done, localization.successfulAnswer, 
          localization.gotoAccount, "/account");
        break;
      case "notEnoughMoney":
        generateAlert(localization.error, localization.notEnoughMoney)
        break;
      case "selfRent":
        generateAlert(localization.error, localization.selfRent)
        break;
      default:
        generateAlert(localization.error, localization.errorAnswer);
        break;
    }

    function generateAlert(title, message, link = "", linkMessage = "") {
      return buttonAlert.set({ title, message, link, linkMessage });
    }

    buttonAlert.show();
  }

  button.click(getRequest);
}

function getResultFromAnswer(answer, title) {
  for(let i = 0; i < answer.length; i++){
    if(answer[i].title == title)
      return answer[i].data;
  }
  return false;
}