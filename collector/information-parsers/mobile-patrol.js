const argv = require('minimist')(process.argv.slice(2));
const profileInformation = require(`../../profiles/${argv.profile}`);
const axios = require('axios');

module.exports = {
	/**
	 * getInfo
	 *
	 * @param {obj} inmateData
	 * @returns {Promise}
	 */
	getInfo: function(inmateData) {
		let apiEndpoint = `https://mobile-ws.apprissmobile.com/mobilepatrolws/mobile/entity/${profileInformation.mpAccountId}/content/${profileInformation.mpContentType}`;
		let getAuth = {
			auth: {
				username: profileInformation.mpUsername,
				password: profileInformation.mpPassword,
			},
		};
		let requests = [];
		let newInmateData = [];

		inmateData.forEach(inmate => {
			requests.push(axios.get(`${apiEndpoint}/${inmate.id}`, getAuth));
		});

		return axios.all(requests)
			.then(results => results.map(r => r.data.data))
			.then(inmateDetails => {
				inmateDetails.some(thisInmate => {
					let thisInmateData = inmateData.filter(inmate => {
						return parseInt(inmate.id) === parseInt(thisInmate.id);
					})[0];

					thisInmateData.person = thisInmate.person;
					thisInmateData.charges = thisInmate.charges;
					thisInmateData.datetimeIn = (thisInmate.extras && thisInmate.extras[0]) ? thisInmate.extras[0].value : undefined;
					thisInmateData.datetimeOut = (thisInmate.extras && thisInmate.extras[1]) ? thisInmate.extras[1].value : undefined;
					thisInmateData.ISODate = new Date(thisInmateData.datetimeIn).toISOString();

					if (this.isRecentPost(thisInmateData.datetimeIn) === false || (thisInmateData.image !== undefined && thisInmateData.datetimeIn !== undefined && thisInmate.charges.length > 0)) {
						newInmateData.image = (newInmateData.image === undefined) ? undefined : null;
						newInmateData.push(thisInmateData);
					}
					else if (thisInmateData.image === undefined) {
						// eslint-disable-next-line
						console.log(`Skipping ${thisInmateData.name} because they don't have an image yet.`);
					}
					else if (thisInmate.charges.length === 0) {
						// eslint-disable-next-line
						console.log(`Skipping ${thisInmateData.name} because they don't have any charges listed yet.`);
					}
					else if (thisInmate.datetimeIn === undefined) {
						// eslint-disable-next-line
						console.log(`Skipping ${thisInmateData.name} because the intake date is undefined.`);
					}
					else if (thisInmateData.name.trim().indexOf(' ') < -1) {
						// eslint-disable-next-line
						console.log(`Skipping ${thisInmateData.name} because full name is not defined.`);
					}
					else {
						// eslint-disable-next-line
						console.log(`Skipping ${thisInmateData.name} for an unspecified reason.`);
					}

					if (newInmateData.length >= 10) return true;
				});

				return Promise.resolve(newInmateData);
			});
	},

	/**
	 * isRecentPost
	 *
	 * @param {string} intakeDatetime
	 * @returns {bool}
	 */
	isRecentPost: function(intakeDatetime) {
		if (intakeDatetime === undefined) return true;

		return ((new Date) - new Date(intakeDatetime) < 60 * 60 * 24 * 1000);
	},
};
