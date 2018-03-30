const imgur = require('imgur');

module.exports = {
	/**
	 * processInmatePhotos
	 *
	 * @param {array} inmates
	 * @returns {Promise}
	 */
	processInmatePhotos: function(inmates) {
		let promises = [];

		inmates.forEach((inmate, index) => {
			promises.push(this.upload(inmate.image)
				.then(imageUrl => {
					inmates[index].image = imageUrl;
				}));
		});

		return Promise.all(promises)
			.then(() => {
				return inmates;
			});
	},

	/**
	 * upload
	 *
	 * @param {string} imageUrl
	 * @param {bool} base64
	 * @returns {promise}
	 */
	upload: function(imageUrl, base64 = false) {
		let imgurProcessor = (base64) ? imgur.uploadBase64 : imgur.uploadUrl;

		if (imageUrl === undefined || imageUrl.indexOf('number_') > -1) return Promise.resolve(null);

		return imgurProcessor(imageUrl)
			.then(response => {
				return response.data.link;
			})
			.catch(error => {
				// eslint-disable-next-line
				console.log(error.message);

				return;
			});
	},
};
