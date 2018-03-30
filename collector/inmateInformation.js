const argv = require('minimist')(process.argv.slice(2));
const axios = require('axios');
const profileInformation = require(`../profiles/${argv.profile}`);

module.exports = {
	/**
	 * getInmates
	 *
	 * @param {object} db
	 * @returns {promise}
	 */
	getInmates: function(db) {
		db.collection(profileInformation.databaseCollection).find().toArray((error, results) => {
			if (error) throw error;

			this.cachedInmates = results;
		});

		let apiEndpoint = `https://mobile-ws.apprissmobile.com/mobilepatrolws/mobile/entity/${profileInformation.mpAccountId}/content/${profileInformation.mpContentType}`;
		let getAuth = {
			auth: {
				username: profileInformation.mpUsername,
				password: profileInformation.mpPassword,
			},
		};

		return axios.all([
			axios.get(apiEndpoint, getAuth),
			axios.get(`${apiEndpoint}?page=1`, getAuth),
			axios.get(`${apiEndpoint}?page=2`, getAuth),
			axios.get(`${apiEndpoint}?page=3`, getAuth),
			axios.get(`${apiEndpoint}?page=4`, getAuth),
		])
			.then(axios.spread((res1, res2, res3, res4, res5) => {
				let inmateData = [];

				if (!res1.data) {
					throw new Error('API unreachable');
				}

				inmateData = inmateData.concat(
					res1.data.data.listItems,
					res2.data.data.listItems,
					res3.data.data.listItems,
					res4.data.data.listItems,
					res5.data.data.listItems
				);

				return this.getInmateData(inmateData.reverse());
			}));
	},

	/**
	 * getInmateData
	 *
	 * @param {object} inmateData
	 * @returns {promise}
	 */
	getInmateData: function(inmateData) {
		let publishInmates = [];

		inmateData.forEach((inmate) => {
			if (!inmate) return;

			if (this.cachedInmates.find(x => x.id === inmate.id) !== undefined) return;

			let prunedInmate = {
				id: inmate.id,
				name: inmate.header,
			};

			if (inmate.images) {
				prunedInmate.image = inmate.images[0].url;
			}

			// store this inmate
			publishInmates.push(prunedInmate);
		});

		// eslint-disable-next-line
		console.log(`Found ${publishInmates.length} new inmates...`);

		return Promise.resolve(publishInmates);
	},
};
