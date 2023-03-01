import mongoose from 'mongoose'

// mongodb models snatched from nasksk bot
const Submission = mongoose.model<SubmissionInterface>(
	'Submission',
	new mongoose.Schema<SubmissionInterface>({
		_id: {
			type: String,
			required: true,
			minlength: 18,
		},
		guildId: String,
		submissionType: String,
		userId: String,
		pointsTotal: Number,
		collaborators: Number,
		bonus: Number,
		edit: Boolean,
		size: Number,
		quality: Number,
		sqm: Number,
		complexity: Number,
		smallAmt: Number,
		mediumAmt: Number,
		largeAmt: Number,
		roadType: Number,
		roadKMs: Number,
		submissionTime: Number,
		reviewTime: Number,
		reviewer: String,
		feedback: { type: String, maxlength: 1700 },
	})
)

export interface SubmissionInterface {
	_id: string
	guildId: string
	userId: string
	pointsTotal?: number
	complexity?: number
	quality?: number
	submissionType?: string
	collaborators?: number
	bonus?: number
	edit?: boolean
	size?: number
	sqm?: number
	smallAmt?: number
	mediumAmt?: number
	largeAmt?: number
	roadType?: number
	roadKMs?: number
	submissionTime: number
	reviewTime: number
	reviewer: string
	feedback: string
}
const User = mongoose.model<UserInterface>(
	'User',
	new mongoose.Schema<UserInterface>({
		id: String,
		guildId: String,
		dm: Boolean,
		pointsTotal: Number,
		buildingCount: Number,
		roadKMs: Number,
		sqm: Number,
	})
)

export interface UserInterface {
	id: string
	guildId: string
	dm: boolean
	pointsTotal: number
	buildingCount: number
	roadKMs: number
	sqm: number
}

// very handy config
const config = {
	mongoURI: 'mongodb://bot:password@ipaddress:27017/nasbs',
	mergeFrom: '707747343788802078', //nw
	mergeInto: '723520440462606377', //sw
}

//------------------------------------
async function run() {
	await mongoose.connect(config.mongoURI)

	// change all old submissions into new submissons
	const submissionResult = await Submission.updateMany({ guildId: config.mergeFrom }, { guildId: config.mergeInto })
	console.log(submissionResult)

	// change all old users into new users
	const users = await User.find({ guildId: config.mergeFrom })

	users.forEach(async (user) => {
		const userInOtherGuild = await User.findOne({ guildId: config.mergeInto, id: user.id })
		if (userInOtherGuild) {
			// if user already exists in new team
			// update new user to add old points
			console.log(userInOtherGuild)

			await User.updateOne(
				{ guildId: config.mergeInto, id: user.id },
				{
					$inc: {
						pointsTotal: user.pointsTotal,
						sqm: user.sqm || 0,
						buildingCount: user.buildingCount,
					},
				}
			)

			// "remove" old user
			await User.updateOne({ guildId: config.mergeFrom, id: user.id }, { guildId: 'used to be NW' })
		}
		// otherwise, user does not exist in new yet so change their guildId to new to migrate them
		await User.updateOne({ guildId: config.mergeFrom, id: user.id }, { guildId: config.mergeInto })
	})
}

run()
