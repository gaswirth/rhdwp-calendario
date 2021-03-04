export const initialUpdateState = {
	updateNow: false,
	trash: false,
	params: {},
	unscheduled: false,
};

export function updateReducer(state, action) {
	switch (action.type) {
		case "UPDATE":
			return {
				updateNow: true,
				params: action.params,
				unscheduled: action.unscheduled,
			};

		case "UPDATING":
			return {
				...state,
				updateNow: false,
			};

		case "TRASH":
			return {
				trash: true,
				updateNow: true,
				params: action.params,
			};

		case "COMPLETE":
			return initialUpdateState;

		default:
			return state;
	}
}
