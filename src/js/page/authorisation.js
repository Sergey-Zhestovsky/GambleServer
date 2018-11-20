let form = new authorisation({
  block: $('#authorisationForm')
})

function authorisation(options) {
  let block = options.block,
    fields = {
      mail: block.find('#mailInput'),
      password: block.find('#passwordInput')
    },
    errorFields = {
      mail: block.find('#mailError'),
      password: block.find('#passwordError')
    };


  function submit() {
    let data = {
        mail: fields.mail.val(),
        password: fields.password.val()
      },
      option = {
        mail: ["required", "email"],
        password: ["required"]
      },
      result = new formValidator().validate(data, option);

    if (Object.keys(result) == 0)
      return data;
    else
      setErrors(result);
    return false;
  }

  function setErrors(errors) {
    clear();

    for (let key in errors) {
      if (key in fields)
        fields[key].addClass('authorisation__form-error');

      if (key in errorFields) {
        setErrorMessage(errorFields[key], localization["validate_" + errors[key][0]]);
      }
    }
  }

  function setErrorMessage(field, message) {
    field.text(message).parent().show();
  }

  function errorHandler(error) {
    clear();

    switch (error.title) {
      case "loginError":
        setErrorMessage(errorFields.mail, error.message);
        break;
      default:
        throw new Error(`POST ERROR: \n ${error.message}`);
        break;
    }
  }

  function login() {
    const path = '/authorisation/login';
    let values = submit();

    if (values == false)
      return;

    $.ajax({
      type: 'POST',
      url: path,
      data: (values),
      asinc: true,
      success: function(answer) {
        if (answer.error) {
          errorHandler(answer.error);
        } else {
          location.reload();
        }
      }
    });
  }

  function clear() {
    block.find('.authorisation__form-error').removeClass("authorisation__form-error");
    block.find('.authorisation__error').hide();
  }

  block.find("#submitForm").click(login);
  block.submit(function (event) {
    login();
    event.preventDefault();
  });
}