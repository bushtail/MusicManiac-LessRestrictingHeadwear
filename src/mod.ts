import { DependencyContainer } from "tsyringe";
import { Ilogger } from "@spt-aki/models/spt/utils/Ilogger";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { BaseClasses } from  "@spt-aki/models/enums/BaseClasses";

class LessRestrictingHedwear implements IPostDBLoadMod
{
	private config = require("../config/config.json");

	public postDBLoad(container: DependencyContainer): void 
	{
		const logger = container.resolve<Ilogger>("WinstonLogger");
		const db = container.resolve<DatabaseServer>("DatabaseServer");
		const tables = db.getTables();    
		const itemDB = tables.templates.items;
		const itemHelper = container.resolve<ItemHelper>("ItemHelper");

		let allowAllHelmetsWithAllHeadsets = 0, allowAllFacemasksWithAllHeadsets = 0, allowAllFacemasksWithAllHelmets = 0, removeAllHelmetAndHeadsetRestrictions = 0, removeAllFacemasksRestrictions = 0;

		// 5a341c4686f77469e155819e - facecover
		// 5645bcb74bdc2ded0b8b4578 - headphones
		
		for (let item in itemDB) {
			if (itemDB[item]._type !== "Node") {
				const itemId = itemDB[item]._id
				if (itemHelper.isOfBaseclass(itemId, BaseClasses.HEADWEAR) && itemDB[item]._props.BlocksEarpiece) {
					if (this.config.allowAllHelmetsWithAllHeadsets && itemDB[item]._props.BlocksEarpiece) {
						itemDB[item]._props.BlocksEarpiece = false;
						allowAllHelmetsWithAllHeadsets++;
					}
					if (this.config.removeAllHelmetAndHeadsetRestrictions && itemDB[item]._props.ConflictingItems.length > 0) {
						itemDB[item]._props.ConflictingItems.length = 0;
						removeAllHelmetAndHeadsetRestrictions++;
					}
					if (this.config.allowAllFacemasksWithAllHelmets && itemDB[item]._props.BlocksFaceCover) {
						itemDB[item]._props.BlocksFaceCover = false;
						allowAllFacemasksWithAllHelmets++;
					}
				}
				if (itemHelper.isOfBaseclass(itemId, BaseClasses.HEADPHONES)) {
					if (this.config.removeAllHelmetAndHeadsetRestrictions && itemDB[item]._props.ConflictingItems.length > 0) {
						itemDB[item]._props.ConflictingItems.length = 0;
						removeAllHelmetAndHeadsetRestrictions++;
					}
				}
				if (itemHelper.isOfBaseclass(itemId, BaseClasses.FACECOVER)) {
					if (this.config.allowAllFacemasksWithAllHeadsets && itemDB[item]._props.BlocksEarpiece) {
						itemDB[item]._props.ConflictingItems.length = 0;
						removeAllHelmetAndHeadsetRestrictions++;
					}
					if (this.config.allowAllFacemasksWithAllHelmets && itemDB[item]._props.BlocksFaceCover) {
						itemDB[item]._props.BlocksFaceCover = false;
						allowAllFacemasksWithAllHelmets++;
					}
					if (this.config.removeAllFacemasksRestrictions && itemDB[item]._props.ConflictingItems.length > 0) {
						itemDB[item]._props.ConflictingItems.length = 0;
						removeAllFacemasksRestrictions++;
					}
				}

			}
		}

		for (const id of this.config.faceshieldsToCleanConflictingItemsFrom) {
			if (itemDB[id]._props.ConflictingItems.length > 0) {
				itemDB[id]._props.ConflictingItems.length = 0;
				removeAllFacemasksRestrictions++;
			}
		}

		logger.info("[Less Restricting Headwear] MusicManiac - Less Restricting Headwear Loaded:");
		logger.info("[Less Restricting Headwear] " + allowAllHelmetsWithAllHeadsets + " helmets modified to allow headphones");
		logger.info("[Less Restricting Headwear] " + allowAllFacemasksWithAllHeadsets + " facemasks modified to allow headphones");
		logger.info("[Less Restricting Headwear] " + allowAllFacemasksWithAllHelmets + " facemasks and helmets modified to allow facemask+helmet combo");
		logger.info("[Less Restricting Headwear] " + removeAllHelmetAndHeadsetRestrictions + " helmets/headphones conflicting items have been purged");
		logger.info("[Less Restricting Headwear] " + removeAllFacemasksRestrictions + " facemasks conflicting items have been purged");
	}
}

module.exports = { mod: new LessRestrictingHedwear() }