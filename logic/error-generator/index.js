function errorGenerator() {

  this.create = (title, message, result) => {
    return {
      error: {
        title: title,
        message: message
      },
      result: result || []
    }
  };
  this.accessError = (result) => {
    return this.create("accessError", "Request don't have appropriate access level.", result);
  };
  this.requireData = (result) => {
    return this.create("requireDataError", "The request don't have appropriate variables.", result);
  };
  this.dataBaseCriticalError = (result) => {
    return this.create("dataBaseCriticalError", "Database request don't work properly.", result);
  };
  this.loginError = (result) => {
    return this.create("loginError", "Wrong email or password.", result);
  };
  this.registrationError = (result) => {
    return this.create("registrationError", "This mail are already in use.", result);
  };
  this.redisError = (error, result) => {
    return this.create("redisError", error, result);
  };
  this.notEnoughMoney = (result) => {
    return this.create("notEnoughMoney", "Your account is too low.", result);
  };
  this.selfRent = (result) => {
    return this.create("selfRent", "Your can't rent your oun device.", result);
  };
  this.middlewareError = (result) => {
    return this.create("middlewareError", "Page not found.", result);
  };
  this.userSaltError = (result) => {
    return this.create("userSaltError", "Missing option variable: salt.", result);
  };
}

module.exports = new errorGenerator();