import { DependencyContainer } from "tsyringe";
import { Ilogger } from "@spt-aki/models/spt/utils/Ilogger";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

class LessRestrictingHedwear implements IPostDBLoadMod
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

		let allowAllHelmetsWithAllHeadsets = 0, allowAllFacemasksWithAllHeadsets = 0, allowAllFacemasksWithAllHelmets = 0, removeAllHelmetAndHeadsetRestrictions = 0;

		// 5a341c4086f77401f2541505 - headwear
		// 5a341c4686f77469e155819e - facecover
		// 5645bcb74bdc2ded0b8b4578 - headphones
		
		for (let item in itemDB) {
			// allowAllHelmetsWithAllHeadsets - find all helmets and unblock earpiece
			if (this.config.allowAllHelmetsWithAllHeadsets && itemDB[item]._parent == "5a341c4086f77401f2541505" && itemDB[item]._props.BlocksEarpiece){
				itemDB[item]._props.BlocksEarpiece = false;
				allowAllHelmetsWithAllHeadsets++;
			}
			// removeAllHelmetAndHeadsetRestrictions - remove restricted items from helmets/headsets
			if (this.config.removeAllHelmetAndHeadsetRestrictions && (itemDB[item]._parent == "5a341c4086f77401f2541505" || itemDB[item]._parent == "5645bcb74bdc2ded0b8b4578") && itemDB[item]._props.ConflictingItems.length > 0) {
				itemDB[item]._props.ConflictingItems.length = 0;
				removeAllHelmetAndHeadsetRestrictions++;
			}
			// allowAllFacemasksWithAllHeadsets - find all facecovers and unblock earpiece
			if (this.config.allowAllFacemasksWithAllHeadsets && itemDB[item]._parent == "5a341c4686f77469e155819e" && itemDB[item]._props.BlocksEarpiece) {
				itemDB[item]._props.BlocksEarpiece = false;
				allowAllFacemasksWithAllHeadsets++;
			}
			// allowAllFacemasksWithAllHelmets - find all helmets and facecovers and unblock facecover/helmet slot
			if (this.config.allowAllFacemasksWithAllHelmets && (itemDB[item]._parent == "5a341c4686f77469e155819e" || itemDB[item]._parent == "5a341c4086f77401f2541505") && (itemDB[item]._props.BlocksFaceCover || itemDB[item]._props.BlocksHeadwear)) {
				itemDB[item]._props.BlocksFaceCover = false;
				itemDB[item]._props.BlocksHeadwear = false;
				allowAllFacemasksWithAllHelmets++;
			}
			
		}

		logger.info("[Less Restricting Headwear] MusicManiac - Less Restricting Headwear Loaded:");
		logger.info("[Less Restricting Headwear] " + allowAllHelmetsWithAllHeadsets + " helmets modified to allow headphones");
		logger.info("[Less Restricting Headwear] " + allowAllFacemasksWithAllHeadsets + " facemasks modified to allow headphones");
		logger.info("[Less Restricting Headwear] " + allowAllFacemasksWithAllHelmets + " facemasks and helmets modified to allow facemask+helmet combo");
		logger.info("[Less Restricting Headwear] " + removeAllHelmetAndHeadsetRestrictions + " helmets/headphones conflicting items have been purged");
	}
}

module.exports = { mod: new LessRestrictingHedwear() }