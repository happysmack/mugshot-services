let argv = require('minimist')(process.argv.slice(2));

const profileInformation = {
	mpAccountId: argv.mpAccountId || '',
	mpContentType: argv.mpContentType || 'DETENTION_CENTER', // DETENTION_CENTER, VINE
	mpUsername: argv.mpUsername || 'MOBILEPATROL_ANDROID_5308',
	mpPassword: argv.mpPassword || '-99-28438760-113-99[544cbc72c712ae2f',
	fbAppId: argv.fbAppId || '',
	fbAppSecret: argv.fbAppSecret || '',
	fbPageId: argv.fbPageId || '',
	instagramUsername: '',
	instagramPassword: '',
	instagramHashtags: [],
	detailedInformationParser: argv.detailedInformationParser || 'mobile-patrol',
	databaseCollection: argv.databaseCollection || 'database-name',
	postToFacebook: true,
	postToInstagram: false,
	useImgur: false,
	mongoUrl: 'mongodb://path.to.mongodb',
	cronDelay: argv.cronDelay || 20,
};

module.exports = profileInformation;
