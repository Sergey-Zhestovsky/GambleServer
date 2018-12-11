'use strict';

import TableController from '/js/module/tableController.js';
import Connector from '/js/module/connector.js';

export default class ServerConnector extends Connector {
    constructor({ path, tableConfig, actions = {}, relatedData, signRequests, customEvents = {} }) {
        super({signRequests});

        this.path = path;
        this.tableConfig = tableConfig;
        this.actions = actions;
        this.relatedData = relatedData;
        this.customEvents = customEvents;
        
        this.table;
        this.eventList = new Map();

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
        this.tableConfig.connector = this;
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

    customEventRequest(eventName, object, cb) {
        if (!this.customEvents[eventName])
            return cb("wrong path");

        let requestObjcet = this.cancelableRequest(this.path + this.customEvents[eventName], object);

        requestObjcet.request
            .then((result) => {
                cb(null, result);
            })
            .catch((error) => {
                cb(error)
            });

        return requestObjcet;
    }

    request(path, object) {
        return super.straightRequest(path, object);
    }

    cancelableRequest(path, object) {
        return super.request(path, object);
    }

    tableDataListner(eventName, handler) {
        this.table.on(eventName, (object, cb) => {
            handler(object)
                .then((result) => {
                    this.triggerEvent(eventName);
                    cb(null, result);
                })
                .catch( (error) => {
                    console.error(error)
                    cb(error)
                } );
        });
    }

    triggerEvent(event) {
        if (this.eventList.has(event)) 
            for(let f of this.eventList.get(event))
                f();
    }

    on(event, func) {
        if (this.eventList.has(event))
            this.eventList.get(event).push(func)
        else
            this.eventList.set(event, [func]) 
    }

    of(event, func) {
        if (this.eventList.has(event)) {
            let arr = this.eventList.get(event);
            
            for(let i = 0; i < arr.length; i++) {
                if (arr[i] === func) 
                    arr.splice(i--, 1)
            }
        }
    }
}