import { DependencyContainer } from "tsyringe";
import { Ilogger } from "@spt-aki/models/spt/utils/Ilogger";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

class LessRestrictingHelmets implements IPostDBLoadMod
{
	private config = require("../config/config.json");

	public postDBLoad(container: DependencyContainer): void 
	{
		// Get the logger from the server container.
		const logger = container.resolve<Ilogger>("WinstonLogger");
		// Get database from server.
		const db = container.resolve<DatabaseServer>("DatabaseServer");
		// Get tables from database
		const tables = db.getTables();    
		// Get item database from tables
		const itemDB = tables.templates.items;

		let helmetesAdjusted = 0, facemasksAdjusted = 0
		
		for (let item in itemDB) {
			// check if item has helmet parent
			if (this.config.allowHeadPhonesOnAllHelmets && itemDB[item]._parent == "5a341c4086f77401f2541505" && itemDB[item]._props.BlocksEarpiece) {
				itemDB[item]._props.BlocksEarpiece = false;
				//logger.info(itemDB[item]._props.Name + " - " + itemDB[item]._props.BlocksEarpiece);
				helmetesAdjusted++;
			}
			// // check if item has facemask parent
			if (this.config.allowHeadPhonesOnAllFacemasks && itemDB[item]._parent == "5a341c4686f77469e155819e" && itemDB[item]._props.BlocksEarpiece) {
				itemDB[item]._props.BlocksEarpiece = false;
				//logger.info(itemDB[item]._props.Name + " - " + itemDB[item]._props.BlocksEarpiece);
				facemasksAdjusted++;
			}
			
		}

			logger.info("MusicManiac - Less Restricting Helmets Loaded:");
			logger.info(helmetesAdjusted + " helmets modified to allow headphones");
			logger.info(facemasksAdjusted + " facemasks modified to allow headphones");
		}
	}
}

module.exports = { mod: new LessRestrictingHelmets() }