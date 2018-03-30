const FB = require('fb');
const argv = require('minimist')(process.argv.slice(2));
const profileInformation = require(`../../profiles/${argv.profile}`);
const fbUserSecret = require('./config').userSecret;
const chalk = require('chalk');
const postBuilder = require('../postBuilder');

module.exports = {
	/**
	 * postInmates
	 *
	 * @param {array} newInmates
	 * @param {object} db
	 * @returns {void}
	 */
	postInmates: function(newInmates, db) {
		this.db = db;

		FB.options({
			version: 'v2.12',
			appId: profileInformation.fbAppId,
			appSecret: profileInformation.fbAppSecret,
			scope: 'manage_pages, publish_pages, publish_actions, publish_stream',
		});

		FB.api(`/oauth/access_token?client_id=${profileInformation.fbAppId}&client_secret=${profileInformation.fbAppSecret}&grant_type=fb_exchange_token&fb_exchange_token=${fbUserSecret}&redirect_uri=&scope=email,manage_pages`, (response) => {
			FB.api(`/me/accounts?access_token=${response.access_token}`, (response) => {
				if (response.data !== undefined) {
					let pageInfo = response.data.filter((data) => {
						return parseInt(data.id) === parseInt(profileInformation.fbPageId);
					});

					FB.setAccessToken(pageInfo[0].access_token);
				}

				newInmates.forEach((inmate) => {
					this.publish(inmate);
				});
			});
		});
	},

	/**
	 * publish
	 *
	 * @param {obj} inmate
	 * @returns {void}
	 */
	publish: function(inmate) {
		if (inmate.image === null) {
			this.publishText(inmate);
		}
		else {
			this.publishPhoto(inmate);
		}
	},

	/**
	 * publishPhoto
	 *
	 * @param {string} inmate
	 * @returns {void}
	 */
	publishPhoto: function(inmate) {
		this.publishPost({
			url: `/${profileInformation.fbPageId}/photos`,
			data: {
				caption: postBuilder.getPostText(inmate),
				url: inmate.image,
			},
		}, inmate);
	},

	/**
	 * publishText
	 *
	 * @param {string} inmate
	 * @returns {void}
	 */
	publishText: function(inmate) {
		this.publishPost({
			url: `/${profileInformation.fbPageId}/feed`,
			data: {
				'message': postBuilder.getPostText(inmate),
			},
		}, inmate);
	},

	/**
	 * publishPost
	 *
	 * @param {obj} postData
	 * @param {string} inmate
	 * @returns {void}
	 */
	publishPost: function(postData, inmate) {
		FB.api(postData.url, 'post', postData.data, (response) => {
			if (response.error) {
				// eslint-disable-next-line
				console.log('Posting error', response.error.message);
				return;
			}

			// eslint-disable-next-line
			console.log(`${chalk.blue('Facebook')} ✔ ${inmate.name}`);

			this.markPublished(inmate);
		});
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
						publishedToFacebook: true,
						publishedToFacebookDatetime: new Date().toISOString(),
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
