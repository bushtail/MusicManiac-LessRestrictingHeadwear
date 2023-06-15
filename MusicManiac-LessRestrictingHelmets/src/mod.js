"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LessRestrictingHelmets {
    constructor() {
        this.config = require("../config/config.json");
    }
    postDBLoad(container) {
        // Get the logger from the server container.
        const logger = container.resolve("WinstonLogger");
        // Get database from server.
        const db = container.resolve("DatabaseServer");
        // Get tables from database
        const tables = db.getTables();
        // Get item database from tables
        const itemDB = tables.templates.items;
        let helmetesAdjusted = 0, faceSheildsAdjusted = 0;
        for (let item in itemDB) {
            // check if item has helmet parent
            if (itemDB[item]._parent == "5a341c4086f77401f2541505") {
                if (this.config.allowHeadPhonesOnAllHelmets && itemDB[item]._props.BlocksEarpiece) {
                    itemDB[item]._props.BlocksEarpiece = false;
                    //logger.info(itemDB[item]._props.Name + " - " + itemDB[item]._props.BlocksEarpiece);
                    helmetesAdjusted++;
                }
            }
        }
        logger.info("MusicManiac - Less Restricting Helmets Loaded:");
        logger.info(helmetesAdjusted + " helmets modified to allow headphones");
    }
}
module.exports = { mod: new LessRestrictingHelmets() };
