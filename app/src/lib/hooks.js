import { useState, useEffect, useContext } from "react";
import { nonce, routeBase, dateFormat } from "../lib/utils";
import { format, isSameDay } from "date-fns";
import { isEmpty } from "lodash";

import PostsContext from "../PostsContext";

// TODO: DEV MODE
import { DEBUG_MODE } from "../lib/utils";
var headers = {};
if (DEBUG_MODE !== true) {
	headers["X-WP-Nonce"] = nonce;
}
// ODOT

export const useStickyState = (defaultValue, key) => {
	const [value, setValue] = useState(() => {
		const stickyValue = window.localStorage.getItem(key);
		return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
	});

	useEffect(() => {
		window.localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);
	return [value, setValue];
};

export const useDayPosts = (posts, date) => {
	let dayPosts = [];
	if (posts) {
		posts.forEach((post) => {
			if (isSameDay(date, new Date(post.post_date))) {
				dayPosts.push(post);
			}
		});
	}

	return dayPosts;
};

export const useFetchScheduledPosts = (start, end) => {
	const {
		posts: { refetch },
		postsDispatch,
	} = useContext(PostsContext);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (start !== null && end !== null) {
			let startDate = format(start, dateFormat.date);
			let endDate = format(end, dateFormat.date);
			let url = `${routeBase}/scheduled/${startDate}/${endDate}`;

			const fetchData = async () => {
				setIsLoading(true);

				try {
					const res = await fetch(url, {
						headers,
					});
					const data = await res.json();

					postsDispatch({
						type: "SET_SCHEDULED",
						posts: data.posts,
						start: data.dateRange.start,
						end: data.dateRange.end,
					});

					setIsLoading(false);
				} catch (error) {
					console.log("REST error", error.message);
					setIsLoading(false);
				}
			};

			fetchData();

			return () => {
				setIsLoading(false);
			};
		}
	}, [start, end, refetch, postsDispatch]);

	return isLoading;
};

export const useFetchUnscheduledPosts = () => {
	const {
		posts: { refetch },
		postsDispatch,
	} = useContext(PostsContext);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let url = `${routeBase}/unscheduled`;

		const fetchData = async () => {
			setIsLoading(true);

			try {
				const res = await fetch(url, {
					headers,
				});
				const data = await res.json();

				postsDispatch({
					type: "SET_UNSCHEDULED",
					posts: data.posts,
					unscheduled: true,
				});

				setIsLoading(false);
			} catch (error) {
				console.log("REST error", error.message);
				setIsLoading(false);
			}
		};

		fetchData();

		return () => {
			setIsLoading(false);
		};
	}, [postsDispatch, refetch]);

	return isLoading;
};

export const useFetchTrashedPosts = () => {
	const {
		posts: { refetch },
		postsDispatch,
	} = useContext(PostsContext);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let url = `${routeBase}/trashed`;

		const fetchData = async () => {
			setIsLoading(true);

			try {
				const res = await fetch(url, {
					headers,
				});
				const data = await res.json();

				postsDispatch({
					type: "SET_TRASHED",
					posts: data.posts,
				});

				setIsLoading(false);
			} catch (error) {
				console.log("REST error", error.message);
				setIsLoading(false);
			}
		};

		fetchData();

		return () => {
			setIsLoading(false);
		};
	}, [postsDispatch, refetch]);

	return isLoading;
};

/**
 *
 * @param {string} name The taxonomy name (slug) to fetch
 * @returns
 */
export const useFetchTaxonomyTerms = (name) => {
	const {
		posts: { taxonomies },
		postsDispatch,
	} = useContext(PostsContext);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Only fetch categories if not already set
		if (isEmpty(taxonomies[name])) {
			let url = `${routeBase}/tax/${name}`;

			const fetchData = async () => {
				setIsLoading(true);

				try {
					const res = await fetch(url, {
						headers,
					});
					const data = await res.json();

					postsDispatch({
						type: "SET_TAXONOMY_TERMS",
						name,
						taxonomy: data.taxonomy,
						terms: data.terms,
					});

					setIsLoading(false);
				} catch (error) {
					console.log("REST error", error.message);
					setIsLoading(false);
				}
			};

			fetchData();

			return () => {
				setIsLoading(false);
			};
		}
	}, [name, taxonomies, postsDispatch]);

	return isLoading;
};
