let form = new authorisation({
  block: $('#registrationForm')
})

function authorisation(options) {
  let block = options.block,
    fields = {
      name: block.find('#nameInput'),
      mail: block.find('#mailInput'),
      password: block.find('#passwordInput'),
      rePassword: block.find('#rePasswordInput')
    },
    errorFields = {
      name: block.find('#nameError'),
      mail: block.find('#mailError'),
      password: block.find('#passwordError'),
      rePassword: block.find('#rePasswordError')
    };

  function submit() {
    let validator = new formValidator(),
      data = {
        name: fields.name.val(),
        mail: fields.mail.val(),
        password: fields.password.val(),
        rePassword: fields.rePassword.val()
      },
      option = {
        name: ["required"],
        mail: ["required", "email"],
        password: ["required", validator.setOptionObject("password", data.rePassword)],
        rePassword: ["required"]
      },
      result = validator.validate(data, option);

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
      case "registrationError":
        setErrorMessage(errorFields.mail, error.message);
        break;
      default:
        throw new Error(`POST ERROR: \n ${error.message}`);
        break;
    }
  }

  function registration() {
    const path = '/registration';
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

  block.find("#submitForm").click(registration);
  block.submit(function (event) {
    registration();
    event.preventDefault();
  });
}