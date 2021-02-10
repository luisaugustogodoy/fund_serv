"use strict";

const DbMixin = require("../mixins/db.mixin");

const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const tabletojson = require('../node_modules/tabletojson').Tabletojson;

const vgmUrl= 'http://www.fundamentus.com.br/resultado.php';


/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "products",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("products")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"Papel",
			"Cotacao",
			"PL",
			"PVP",
			"PSR"
		],

		// Validator for the `create` & `insert` actions.
		entityValidator: {
			name: "string|min:3",
			price: "number|positive"
		}
	},

	/**
	 * Action Hooks
	 */
	hooks: {
		before: {
			/**
			 * Register a before hook for the `create` action.
			 * It sets a default value for the quantity field.
			 *
			 * @param {Context} ctx
			 */
			create(ctx) {
				ctx.params.quantity = 0;
			}
		}
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * The "moleculer-db" mixin registers the following actions:
		 *  - list
		 *  - find
		 *  - count
		 *  - create
		 *  - insert
		 *  - update
		 *  - remove
		 */

		// --- ADDITIONAL ACTIONS ---

	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Loading sample data to the collection.
		 * It is called in the DB.mixin after the database
		 * connection establishing & the collection is empty.
		 */
		async seedDB() {
			var json;
			got(vgmUrl).then(response => {
			  const $ = cheerio.load(response.body, { decodeEntities: false });
				let result = $("body").html();
				result = result.replace('/ç/g','c');
				json = tabletojson.convert(result);
				let jstr = JSON.stringify(json)
				jstr = jstr.replace(/\./g,'');
				//jstr = jstr.replace(/\,/g,'.');
				jstr = jstr.replace(/\�/g,'');
				jstr = jstr.replace(/\%/g,'');
				jstr = jstr.replace(/\//g,'');
				jstr = jstr.replace(/\ /g,'_');

				const search = 'Cotao';
				const replacer = new RegExp(search, 'g')
				jstr = jstr.replace(replacer,'Cotacao');

				json = JSON.parse(jstr);
				console.log(json);

				this.adapter.insertMany(
					[json]


				//	{ name: "Samsung Galaxy S10 Plus", quantity: 10, price: 704, a:2, b:3 },
				//	{ name: "iPhone 11 Pro", quantity: 25, price: 999 },
				//	{ name: "Huawei P30 Pro", quantity: 15, price: 679 },
				);
			}).catch(err => {
			  console.log(err);
			});
			console.log(json);
			// await this.adapter.insertMany(
			// 	[json]
			//
			//
			// //	{ name: "Samsung Galaxy S10 Plus", quantity: 10, price: 704, a:2, b:3 },
			// //	{ name: "iPhone 11 Pro", quantity: 25, price: 999 },
			// //	{ name: "Huawei P30 Pro", quantity: 15, price: 679 },
			// );
		}
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
