'use strict';

import TableController from '/js/module/tableController.js';
import Connector from '/js/module/connector.js';

export default class ServerConnector extends Connector {
    constructor({ path, tableConfig, actions = {}, relatedData, signRequests }) {
        super({signRequests});

        this.path = path;
        this.tableConfig = tableConfig;
        this.actions = actions;
        this.relatedData = relatedData;
        this.table;

        this.create();
    }

    create() {
        if (!this.actions.get)
            return;

        let promiseArray = [this.actionRequest("get", { length: this.tableConfig.selector.dataStep[0], padding: 0 })];

        if (this.relatedData) 
            this.getRelatedData(this.relatedData, promiseArray);

        Promise.all(promiseArray)
            .then(( allResults ) => {
                if (this.relatedData) {
                    let i = 1;

                    for(let data of this.relatedData) {
                        this.tableConfig[data.to].relatedData || (this.tableConfig[data.to].relatedData = []) && 
                        (this.tableConfig[data.to].relatedData[data.name] = data.storeVariable 
                            ? allResults[i++][data.storeVariable] 
                            : allResults[i++])
                    }
                }

                this.connectToTableController(allResults[0]);
            })
            .catch((e) => {
                console.error(new Error("ServerConnector"), e);
            });
    }

    getRelatedData(dataArray, result = []) {
        for(let data of dataArray) {
            result.push(this.request(data.path, data.options));
        }

        return result;
    }

    connectToTableController(data) {
        this.tableConfig = Object.assign(this.tableConfig, data);
        this.table = new TableController(this.tableConfig);
        this.setTableListners();
    }

    setTableListners() {
        const actions = ["get", "add", "edit", "delete"];

        for(let action of actions) {
            if (this.actions[action])
                this.tableDataListner(action, this.actionRequest.bind(this, action));
        }
    }

    actionRequest(action, object) {
        return this.request(this.path + this.actions[action].path, object);
    }

    request(path, object) {
        return super.request(path, object);
    }

    tableDataListner(eventName, handler) {
        this.table.on(eventName, (object, cb) => {
            handler(object)
                .then( (result) => cb(null, result) )
                .catch( (error) => {
                    console.log(error)
                    cb(error)
                } );
        });
    }
}