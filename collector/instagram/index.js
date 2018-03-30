const Client = require('instagram-private-api').V1;
const imageDownloader = require('image-downloader');
const argv = require('minimist')(process.argv.slice(2));
const profileInformation = require(`../../profiles/${argv.profile}`);
const device = new Client.Device(profileInformation.instagramUsername);
const storage = new Client.CookieFileStorage(__dirname + `/cookies/${profileInformation.databaseCollection}.json`);
const chalk = require('chalk');
const postBuilder = require('../postBuilder');

module.exports = {
	/**
	 * session
	 *
	 * @type {(object|null)}
	 */
	session: null,

	/**
	 * hashtags
	 *
	 * @type {array}
	 */
	hashtags: [
		'inmate',
		'crime',
		'mugshot',
		'headshot',
		'arrested',
	],

	/**
	 * postInmates
	 *
	 * @param {object} inmates
	 * @param {object} db
	 * @returns {void}
	 */
	postInmates: function(inmates, db) {
		this.db = db;

		this.createSession()
			.then(session => {
				inmates.forEach((inmate) => {
					if (!inmate.image) return;

					imageDownloader
						.image({
							url: inmate.image,
							dest: __dirname + '/images',
						})
						.then(({filename}) => {
							Client.Upload.photo(session, filename)
								.then(upload => {
									// eslint-disable-next-line
									console.log(`${chalk.magenta('Instagram')} ✔ ${inmate.name}`);

									let postText = postBuilder.getPostText(inmate) + '\n\n';
									let hashtags = this.hashtags;

									if (profileInformation.instagramHashtags) {
										hashtags = this.hashtags.concat(profileInformation.instagramHashtags);
									}

									hashtags.forEach(hashtag => {
										postText += `#${hashtag} `;
									});

									return Client.Media.configurePhoto(session, upload.params.uploadId, postText);
								})
								.then(() => {
									this.markPublished(inmate);
								})
								.catch(error => {
									// eslint-disable-next-line
									console.log(`There was an error posting to Instagram ${inmate.name}`);

									if (argv.debug === true) {
										// eslint-disable-next-line
										console.log(error);
									}
								});
						})
						.catch(error => {
							// eslint-disable-next-line
							console.log('Error downloading inmate image');

							if (argv.debug === true) {
								// eslint-disable-next-line
								console.log(error);
							}
						});
				});
			});
	},

	/**
	 * createSession
	 *
	 * @returns {Promise}
	 */
	createSession: function() {
		if (this.session !== null) return Promise.resolve(this.session);

		return Client.Session
			.create(device, storage, profileInformation.instagramUsername, profileInformation.instagramPassword)
			.then(session => Promise.resolve(session));
	},

	/**
	 * markPublished
	 *
	 * @param {obj} inmate
	 * @returns {void}
	 */
	markPublished: function(inmate) {
		this.db.collection(profileInformation.databaseCollection)
			.findAndModify({id: inmate.id}, [['_id', 'asc']],
				{
					$set: {
						publishedToInstagram: true,
						publishedToInstagramDatetime: new Date().toISOString(),
					},
				},
				error => {
					if (error) {
						throw error;
					}
				}
			);
	},
};
