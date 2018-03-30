const argv = require('minimist')(process.argv.slice(2));
const profileInformation = require(`../profiles/${argv.profile}`);
const detailedInformation = require(`./information-parsers/${profileInformation.detailedInformationParser}`);
const inmateInformation = require('./inmateInformation');
const chalk = require('chalk');
const CronJob = require('cron').CronJob;
const imgurUpload = require('./imgurUpload');
const facebook = require('./facebook');
const instagram = require('./instagram');
const MongoClient = require('mongodb').MongoClient;

let db;

MongoClient.connect(profileInformation.mongoUrl, (error, client) => {
	if (error) {
		// eslint-disable-next-line
		return console.log(error);
	}

	db = client.db('inmates');
});

let cronWait = (argv.dev === true) ? 1 : (profileInformation.cronDelay) ? profileInformation.cronDelay : 60;

new CronJob(`*/${cronWait} * * * *`, function() {
	let time = new Date();

	// eslint-disable-next-line
	console.log(`[${time.getHours()}:${(time.getMinutes() < 10 ? '0' : '') + time.getMinutes()}] Checking for new information...`);

	inmateInformation.getInmates(db)
		.then(newInmates => detailedInformation.getInfo(newInmates))
		.then(inmates => {
			if (profileInformation.useImgur === false) return inmates;

			return imgurUpload.processInmatePhotos(inmates);
		})
		.then(inmates => {
			inmates.forEach(inmate => {
				if (inmate.image === undefined) return;

				// store current datetime with document
				inmate.storedDatetime = new Date().toISOString();
				inmate.publishedToFacebook = false;
				inmate.publishedToInstagram = false;

				db.collection(profileInformation.databaseCollection).save(inmate, error => {
					if (error) {
						throw error;
					}

					// eslint-disable-next-line
					console.log(`${chalk.yellow('Datebase')} ✔ ${inmate.name}`);
				});
			});

			return inmates;
		})
		.then(inmates => {
			// Facebook
			if (profileInformation.postToFacebook === true) {
				facebook.postInmates(inmates, db);
			}

			// Instagram
			if (profileInformation.postToInstagram === true) {
				instagram.postInmates(inmates, db);
			}
		})
		.catch(error => {
			// eslint-disable-next-line
			console.log('There was an error');

			if (argv.debug === true) {
				// eslint-disable-next-line
				console.log(error);
			}
		});
}, null, true, 'America/New_York');
