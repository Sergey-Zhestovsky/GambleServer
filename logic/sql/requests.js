let mysql = require('mysql'),
    errorGenerator = require('../error-generator');

function sqlRequest(options) {
  this.connection = options.connection;
}

sqlRequest.prototype.request = function (options, done, toAnswer) {
  let connection = mysql.createConnection(this.connection);

  connection.query(options.query, options.variables, function (error, result) {
    connection.end();
    return done(answerConstructor(options, error, result, toAnswer));
  });
};

sqlRequest.prototype.getProducts = function (done) {
  this.request({
    query: `SELECT P.product_id, T.type_id, T.type_name, P.product_company, P.product_model, P.product_price, 
                A.address_id, A.address_city, A.address_place, P.tracker_id
              FROM (Product P, ProductType T, Address A, Container C)
              LEFT JOIN Rent
              ON P.product_id = Rent.product_id
              WHERE P.type_id = T.type_id AND P.container_id = C.container_id AND A.address_id = C.address_id 
                AND NOT P.product_isInitialDelivered = 0 AND Rent.rent_id IS NULL`,
    title: "ProductType"
  }, done);
};

sqlRequest.prototype.getProduct = function (data, done) {
  this.request({
    query: `SELECT P.product_id, T.type_id, T.type_name, P.product_company, P.product_model, P.product_price, P.product_state, 
                P.product_context, A.address_id, A.address_city, A.address_place,  A.address_coordinates, P.tracker_id, Rent.rent_id
              FROM (Product P, ProductType T, Address A, Container C)
              LEFT JOIN Rent
              ON P.product_id = Rent.product_id
              WHERE P.type_id = T.type_id AND P.container_id = C.container_id AND A.address_id = C.address_id 
                AND NOT P.product_isInitialDelivered = 0 AND P.product_id = ?`,
    variables: [data.productId],
    title: "getProduct"
  }, done);
};

sqlRequest.prototype.filterRequest = function (done) {
  new Promise((resolve, reject) => {
    this.request({query: `SELECT type_id as id, type_name as content FROM ProductType`, title: "ProductType"}, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    this.request({query: `SELECT address_id as id, concat(address_city, " ", address_place) as content FROM Address`, title: "Address"}, done, answer);
  });
};

sqlRequest.prototype.setRent = function (data, done) {
  new Promise((resolve, reject) => {
    this.request({
      query: `SELECT U.user_account, 
                  (SELECT product_id FROM Product WHERE user_id = ? AND product_id = ?) AS product_id
                FROM User U
                WHERE U.user_id = ?`,
      variables: [data.userId, data.productId, data.userId],
      title: "selectAccount"
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    let account = getResultFromAnswer(answer.result, "selectAccount")[0];

    if(account !== undefined && account.user_account < 0)
      return done(errorGenerator.notEnoughMoney(answer.result));
    if(account.user_account != null)
      return done(errorGenerator.selfRent(answer.result));

    this.request({
      query: `INSERT INTO Rent(user_id, product_id ) 
              SELECT ?, ?
              FROM Product
              LEFT JOIN Rent
              ON "${data.productId}" = Rent.product_id
              WHERE Rent.rent_id IS NULL`,
      variables: [data.userId, data.productId],
      title: "setRent"
    }, done, answer);
  });
};

sqlRequest.prototype.getAccountTables = function (data, done) {
  new Promise((resolve, reject) => {
    this.request({
      query: `SELECT P.*, PT.type_name, A.*, R.rent_id, C.container_initial_password, T.*
              FROM (Product P, ProductType PT, Address A, Container C)
              LEFT JOIN Rent R ON P.product_id = R.product_id
              LEFT JOIN Tracker T ON P.tracker_id = T.tracker_id
              WHERE P.type_id = PT.type_id AND P.container_id = C.container_id
                AND A.address_id = C.address_id AND P.user_id = ?`,
      variables: [data.id],
      title: "owtProduct"
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    this.request({
      query: `SELECT P.*, T.type_name, A.address_id, A.address_city, A.address_place, R.rent_id,
                  DATE_FORMAT(R.rent_dataFrom,'%d.%m.%Y') as rent_dataFrom, C.container_password
                FROM Product P, ProductType T, Address A, Container C, Rent R
                WHERE P.type_id = T.type_id AND P.container_id = C.container_id AND A.address_id = C.address_id 
                  AND P.product_id = R.product_id AND R.user_id = ?`,
      variables: [data.id],
      title: "rentedProduct"}, done, answer);
  });
};

sqlRequest.prototype.addProduct = function (data, done) {
  new Promise((resolve, reject) => {
    if(data.tracker != "true")
      return resolve();

    this.request({
      query: `INSERT INTO Tracker (tracker_state, tracker_coordinates)
                VALUES ("normal", 
                (SELECT address_coordinates FROM Address WHERE address_id = ?))`,
      variables: [data.address],
      title: "insertTracker"
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    return new Promise((resolve, reject) => {
      this.request({
        query: `INSERT INTO Container (address_id, container_initial_password, container_password)
                VALUES (?, ?, ?)`,
        variables: [data.address, data.initialPassword, data.password],
        title: "insertContainer"
      }, function (answer) {
        resolve(answer)
      }, answer);
    });
  }).then(answer => {
    let trackerId = getResultFromAnswer(answer.result, "insertTracker"),
      containerId = getResultFromAnswer(answer.result, "insertContainer");

    if(
      trackerId.affectedRows !== undefined && trackerId.affectedRows != 1 ||
      containerId.affectedRows !== undefined && containerId.affectedRows != 1
    )
      return done(errorGenerator.dataBaseCriticalError(answer.result));

    return new Promise((resolve, reject) => {
      this.request({
        query: `INSERT INTO Product (type_id, user_id, product_company, product_model, product_state, product_context, product_price, container_id, tracker_id)
                VALUES (?,?,?,?,?,?,?,?,?);`,
        variables: [data.type, data.userId, data.company, data.model, data.state, data.context, data.price, containerId.insertId, trackerId.insertId],
        title: "insertProduct"
      }, function (answer) {
        resolve(answer)
      }, answer);
    });
  }).then(answer => {
    let productId = getResultFromAnswer(answer.result, "insertProduct");

    if(productId.affectedRows !== undefined && productId.affectedRows != 1)
      return done(errorGenerator.dataBaseCriticalError(answer.result));

    this.request({
      query: `SELECT P.product_id, T.type_id, T.type_name, P.product_company, P.product_model,
                  A.address_id, A.address_city, A.address_place, R.rent_id, P.product_isInitialDelivered
                FROM (Product P, ProductType T, Address A, Container C)
                LEFT JOIN Rent R
                ON P.product_id = R.product_id
                WHERE P.type_id = T.type_id AND P.container_id = C.container_id
                  AND A.address_id = C.address_id AND P.product_id = ?`,
      variables: [productId.insertId],
      title: "selectProduct"
    }, done, answer);
  });
};

sqlRequest.prototype.deliveryProduct = function (data, done) {
  this.request({
    query: `UPDATE Product
              SET product_isInitialDelivered = '1'
              WHERE product_id = ? AND user_id = ?`,
    variables: [data.id, data.userId],
    title: "deliveryProduct"
  }, done);
};

sqlRequest.prototype.editProduct = function (data, done) {
  new Promise((resolve, reject) => {
    this.request({
      query: `UPDATE Product
              SET type_id = ?,
                  product_company = ?,
                  product_model = ?,
                  product_state = ?,
                  product_price = ?,
                  product_context = ?
              WHERE product_id = ? AND user_id = ?`,
      variables: [data.type, data.company, data.model, data.state, data.price, data.context, data.id, data.userId],
      title: "editProduct"
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    this.request({
      query: `SELECT P.*, T.type_name,
                  A.address_id, A.address_city, A.address_place, R.rent_id
                FROM (Product P, ProductType T, Address A, Container C)
                LEFT JOIN Rent R
                ON P.product_id = R.product_id
                WHERE P.type_id = T.type_id AND P.container_id = C.container_id
                  AND A.address_id = C.address_id AND P.user_id = ? AND P.product_id = ?`,
      variables: [data.userId, data.id],
      title: "selectProduct"}, done, answer);
  });
};

sqlRequest.prototype.deleteProduct = function (data, done) {
  new Promise((resolve, reject) => {

    this.request({
      query: `SELECT tracker_id, container_id
                FROM Product
                WHERE product_id = ? AND user_id = ?`,
      variables: [data.id, data.userId],
      title: "selectProduct"
    }, function (answer) {
      resolve(answer)
    });

  }).then(answer => {

    return new Promise((resolve, reject) => {
      this.request({
        query: `DELETE FROM Product WHERE product_id = ? AND user_id = ?`,
        variables: [data.id, data.userId],
        title: "deleteProduct"
      }, function (answer) {
        resolve(answer)
      }, answer);
    });

  }).then(answer => {
    let trackerId = getResultFromAnswer(answer.result, "selectProduct")[0].tracker_id;

    if(trackerId == null)
      return answer;

    return new Promise((resolve, reject) => {
      this.request({
        query: `DELETE T FROM (Tracker T)
                  LEFT JOIN Product P
                    ON P.tracker_id = T.tracker_id
                  WHERE T.tracker_id = ?`,
        variables: [trackerId],
        title: "deleteTracker"
      }, function (answer) {
        resolve(answer)
      }, answer);
    });

  }).then(answer => {
    let containerId = getResultFromAnswer(answer.result, "selectProduct")[0].container_id;

    if(containerId == null)
      return answer;

    this.request({
      query: `DELETE C FROM (Container C)
                LEFT JOIN Product P
                  ON P.container_id = C.container_id
                WHERE C.container_id = ?`,
      variables: [containerId],
      title: "deleteContainer"
    }, done, answer);
  });
};

sqlRequest.prototype.receiveRentedProduct = function (data, done) {
  new Promise((resolve, reject) => {
    this.request({
      query: `SELECT rent_dataFrom 
                FROM Rent
                WHERE rent_id = ?`,
      variables: [data.id],
      title: "selectDate",
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    let date = getResultFromAnswer(answer.result, "selectDate")[0].rent_dataFrom;

    if(date != null)
      return done(errorGenerator.dataBaseCriticalError(answer.result));

    this.request({
      query: `UPDATE Rent
                SET rent_dataFrom = current_date()
                WHERE rent_id = ? AND user_id = ?`,
      variables: [data.id, data.userId],
      title: "receiveRentedProduct"
    }, done);
  });
};

sqlRequest.prototype.removeRentedProduct = function (data, done) {
  new Promise((resolve, reject) => {
    this.request({
      query: `SELECT rent_dataFrom, product_id
                FROM Rent 
                WHERE rent_id = ? AND user_id = ?`,
      variables: [data.id, data.userId],
      title: "selectRentedProduct"
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    return new Promise((resolve, reject) => {
      this.request({
        query: `DELETE FROM Rent 
              WHERE rent_id = ? AND user_id = ?`,
        variables: [data.id, data.userId],
        title: "removeRentedProduct"
      }, function (answer) {
        resolve(answer)
      }, answer);
    });
  }).then(answer => {
    let selectRentedProduct = getResultFromAnswer(answer.result, "selectRentedProduct")[0],
      dateFrom = selectRentedProduct.rent_dataFrom,
      productId = selectRentedProduct.product_id;

    if(dateFrom == null)
      return done(answer);

    new Promise((resolve, reject) => {
      this.request({
        query: `SELECT product_price, user_id
                  FROM Product
                  WHERE product_id = ?`,
        variables: [productId],
        title: "selectProduct"
      }, function (answer) {
        resolve(answer)
      }, answer);
    }).then(answer => {
      let selectProduct = getResultFromAnswer(answer.result, "selectProduct")[0],
        productUserId = selectProduct.user_id,
        productPrice = selectProduct.product_price,
        payment = productPrice * (Math.ceil((Date.now() - new Date(dateFrom)) / 86400000));

      return new Promise((resolve, reject) => {
        this.request({
          query: `UPDATE User
              SET user_account = user_account - ?
              WHERE user_id = ?`,
          variables: [payment, data.userId],
          title: "paymentRent"
        }, function (answer) {
          resolve([answer, productUserId, payment])
        }, answer);
      });
    }).then(([answer, productUserId, payment]) => {
      this.request({
        query: `UPDATE User
              SET user_account = user_account + ?
              WHERE user_id = ?`,
        variables: [payment, productUserId],
        title: "salaryRent"
      }, function (answer) {
        done(answerConstructor({title: "paymentData"}, null, payment, answer));
      }, answer);
    });

  });
};

sqlRequest.prototype.getUser = function (data, done) {
  this.request({
    query: `SELECT *
                FROM User U
                WHERE (U.user_mail=? AND U.user_password=?) OR U.user_id=?`,
    variables: [data.mail, data.password, data.id],
    title: "selectUser"
  }, function (answer) {
    done(getResultFromAnswer(answer.result, "selectUser")[0]);
  });
};

sqlRequest.prototype.setUser = function (data, done) {
  new Promise((resolve, reject) => {
    this.request({
      query: `SELECT *
              FROM User U
              WHERE U.user_mail=?`,
      variables: [data.mail],
      title: "selectUser"
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    let user = getResultFromAnswer(answer.result, "selectUser")[0];

    if(user !== undefined)
      return done(errorGenerator.registrationError(answer.result));

    return new Promise((resolve, reject) => {
      this.request({
        query: `INSERT INTO User (user_name, user_mail, user_password)
                VALUES (?,?,?)`,
        variables: [data.name, data.mail, data.password],
        title: "insertUser"
      }, function (answer) {
        resolve(answer)
      }, answer);
    });

  }).then(answer => {
    let result = getResultFromAnswer(answer.result, "insertUser");
    if(result.affectedRows != 1)
      return done(errorGenerator.dataBaseCriticalError(answer.result));

    this.getUser({id: result.insertId}, done);
  });
};

sqlRequest.prototype.overlookProduct = function (data, done) {
  this.request({
    query: `SELECT P.*, PT.type_name, A.*, R.rent_id, C.container_initial_password, T.*
              FROM (Product P, ProductType PT, Address A, Container C)
              LEFT JOIN Rent R ON P.product_id = R.product_id
              LEFT JOIN Tracker T ON P.tracker_id = T.tracker_id
              WHERE P.type_id = PT.type_id AND P.container_id = C.container_id
                AND A.address_id = C.address_id AND P.user_id = ? AND P.product_id=?`,
    variables: [data.userId, data.id],
    title: "overlookProduct"
  }, done);
};

sqlRequest.prototype.getModerationData = function (done) {
  new Promise((resolve, reject) => {
    this.request({
      query: `SELECT user_id, user_name, user_mail, user_account
                FROM User
                WHERE user_passportId IS NULL`,
      title: "selectUsers"
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    this.request({
      query: `SELECT P.product_id, P.user_id, A.address_city, A.address_place, C.container_id
                FROM Product P, Container C, Address A
                WHERE C.container_id = P.container_id AND A.address_id = C.address_id 
                  AND P.product_isInitialDelivered = 0`,
      title: "selectDeliveredProduct"
    }, done, answer);
  });
};

sqlRequest.prototype.confirmUser = function (data, done) {
  this.request({
    query: `UPDATE User
              SET user_passportId = ?
              WHERE user_id = ?`,
    variables: [data.passportId, data.id],
    title: "deliveryProduct"
  }, done);
};

sqlRequest.prototype.replenishAccount = function (data, done) {
  new Promise((resolve, reject) => {
    this.request({
      query: `UPDATE User
              SET user_account = user_account + ?
              WHERE user_id = ?`,
      variables: [data.cacheAmount, data.userId],
      title: "replenishAccount"
    }, function (answer) {
      resolve(answer)
    });
  }).then(answer => {
    let replenish = getResultFromAnswer(answer.result, "replenishAccount");

    if(replenish.affectedRows !== undefined && replenish.affectedRows != 1)
      return done(errorGenerator.dataBaseCriticalError(answer.result));

    this.request({
      query: `SELECT user_account
                FROM User
                WHERE user_id = ?`,
      variables: [data.userId],
      title: "selectAccount"
    }, done, answer);
  });
};

sqlRequest.prototype.getUserDevices = function (data, done) {
  this.request({
    query: `SELECT T.tracker_id
              FROM Tracker T, Product P
              WHERE P.user_id = ? AND P.tracker_id = T.tracker_id`,
    variables: [data.id],
    title: "selectTracker"
  }, function (answer) {
    answer = getResultFromAnswer(answer.result, "selectTracker").map(function (item) {
      return item.tracker_id;
    });
    done(answer);
  });
};

sqlRequest.prototype.setTrackerLog = function (data, done) {
  this.request({
    query: `UPDATE Tracker T
              SET tracker_log = ?, tracker_coordinates = ?
              WHERE tracker_id = ?;`,
    variables: [data.message, data.lastLocation, data.id],
    title: "deliveryProduct"
  }, function (answer) {
    if(done)
      done(answer)
  });
};

sqlRequest.prototype.getUserTrackers = function (data, done) {
  this.request({
    query: `SELECT T.tracker_id, T.tracker_state, T.tracker_coordinates
              FROM Tracker T, Product P
              WHERE P.user_id = ? AND P.tracker_id = T.tracker_id`,
    variables: [data.id],
    title: "selectTracker"
  }, done);
};


function answerConstructor(options, error, result, toAnswer = {error: null, result: []}) {
  toAnswer.result.push({
    title: options.title,
    data: options.isParse ? JSON.stringify(result) : result
  });

  if(toAnswer){
    return {
      error: toAnswer.error === null? error: toAnswer.error,
      result: toAnswer.result
    }
  }

  return {
    error: error,
    result: toAnswer.result
  }
}

function getResultFromAnswer(answer, title) {
  for(let i = 0; i < answer.length; i++){
    if(answer[i].title == title)
      return answer[i].data;
  }
  return false;
}


module.exports = sqlRequest;