module.exports = {
	/**
	 * getPostText
	 *
	 * @param {object} inmate
	 * @returns {string}
	 */
	getPostText: function(inmate) {
		let inmateWeight = (inmate.person.weight) ? `${inmate.person.weight} lbs` : 'Unknown';
		let inmateHeight = 'Unknown';

		if (inmate.person.height !== undefined) {
			let heightString = inmate.person.height.toString();
			inmateHeight = `${heightString[0]}'${heightString[1]}${heightString[2]}"`;
		}

		let postText = `${inmate.name}\n${this.getCharges(inmate)}\n\nIntake: ${inmate.datetimeIn}\n`;
		postText = postText + `\nAge: ${inmate.person.age}`;
		postText = postText + `\nGender: ${(inmate.person.gender === 'M') ? 'Male' : (inmate.person.gender === 'F') ? 'Female' : 'Unknown'}`;
		postText = postText + `\nHeight: ${inmateHeight}`;
		postText = postText + `\nWeight: ${inmateWeight}`;

		return postText;
	},

	/**
	 * getCharges
	 *
	 * @param {object} inmate
	 * @returns {string}
	 */
	getCharges: function(inmate) {
		let charges = '';

		if (!inmate.charges) return charges;

		charges = '\n\n';

		inmate.charges.forEach((charge) => {
			charges += 'Charge: ';
			if (charge.severity !== undefined && charge.severity !== 'NOMAP') {
				charges += `(${charge.severity}) `;
			}

			charges += charge.description;
			charges += (charge.bondAmount === undefined || parseInt(charge.bondAmount) === 0) ? '\n' : ` (Bond: $${charge.bondAmount})\n`;
		});

		return charges;
	},
};
