// TODO key these by ID? Necessary?
export const samplePosts = {
	scheduled: [
		{
			id: 1,
			post_title: "Test Post 1",
			post_status: "draft",
			post_date: "02-5-2021", // will be more accurate and have post time, as well
		},
		{
			id: 2,
			post_title: "Test Post 2",
			post_status: "future",
			post_date: "02-13-2021", // will be more accurate and have post time, as well
		},
		{
			id: 6,
			post_title: "Test Post 6",
			post_status: "future",
			post_date: "02-14-2021", // will be more accurate and have post time, as well
		},
	],
	unscheduled: [
		{
			id: 3,
			post_title: "Test Post 3",
			post_status: "draft",
			post_date: "02-16-2021", // will be more accurate and have post time, as well
		},
		{
			id: 4,
			post_title: "Test Post 4",
			post_status: "pending",
			post_date: "02-22-2021", // will be more accurate and have post time, as well
		},
		{
			id: 5,
			post_title: "Test Post 5",
			post_status: "pending",
			post_date: "02-22-2021", // will be more accurate and have post time, as well
		},
	],
};

export const postStatuses = {
	publish: {
		name: "Publish",
		backgroundColor: "cornflowerblue",
		color: "white",
	},
	draft: {
		name: "Draft",
		backgroundColor: "silver",
		color: "white",
	},
	future: {
		name: "Future",
		backgroundColor: "lightseagreen",
		color: "white",
	},
	pending: {
		name: "Pending",
		backgroundColor: "lightcoral",
		color: "white",
	},
	private: {
		name: "Private",
		backgroundColor: "maroon",
		color: "white",
	},
};

export const dateFormat = {
	day: "d",
	date: "MM-dd-yyyy",
	header: "MMMM yyyy",
	dayName: "EEEE",
};

/**
 * Tests if a post contains ANY empty data (is incomplete/empty post)
 *
 * @param {object} post
 */
export function isEmptyPost(post) {
	// TODO Debug/error checks here?
	return Object.values(post).some(
		(prop) => prop !== null && prop !== "" && prop !== undefined
	);
}
