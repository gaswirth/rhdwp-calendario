import React, { useReducer, useEffect, useContext } from "react";
import { updateReducer, initialUpdateState } from "../lib/updatePost";

import PostsContext from "../PostsContext";

import { routeBase } from "../lib/utils";
import { decode } from "html-entities";

export default function PostLinks({ post, className, unscheduled }) {
	const { id, edit_link, view_link } = post;
	const { postsDispatch } = useContext(PostsContext);
	const [updatePost, updatePostDispatch] = useReducer(
		updateReducer,
		initialUpdateState
	);

	// Update the post
	useEffect(() => {
		if (updatePost.updateNow === true && id !== "undefined") {
			updatePostDispatch({
				type: "UPDATING",
			});

			let url = `${routeBase}/`;
			if (updatePost.trash === true) {
				url += `trash/${id}`;
			} else {
				url += `update/${id}`;
			}

			let postData = {
				unscheduled: updatePost.unscheduled,
			};

			const fetchData = async () => {
				try {
					const response = await fetch(url, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(postData),
					});
					// const data = await response.json(); // If you need to catch the response...
					await response.json();

					updatePostDispatch({
						type: "COMPLETE",
					});

					postsDispatch({
						type: "REFETCH",
					});
				} catch (error) {
					console.log(error.message);
				}
			};

			fetchData();
		}
	}, [
		id,
		postsDispatch,
		updatePost.trash,
		updatePost.params,
		updatePost.updateNow,
		updatePost.unscheduled,
	]);

	const unschedulePost = (e) => {
		e.preventDefault();

		updatePostDispatch({
			type: "UPDATE",
			params: {},
			unscheduled: true,
		});
	};

	const schedulePost = (e) => {
		e.preventDefault();

		updatePostDispatch({
			type: "UPDATE",
			params: {},
			unscheduled: false,
		});
	};

	const trashPost = () => {
		updatePostDispatch({
			type: "TRASH",
			params: {
				id: id,
			},
		});
	};

	return (
		<div className={`postLinks ${className}`}>
			<a
				className="icon top left icon__view"
				href={view_link}
				target="_blank"
				rel="noreferrer"
				title="View Post"
			>
				open_in_new
			</a>
			<a
				className="icon top right icon__edit"
				href={decode(edit_link)}
				target="_blank"
				rel="noreferrer"
				title="Edit Post in a new tab"
			>
				mode_edit
			</a>
			{unscheduled ? (
				<button
					className="icon icon__schedule bottom right"
					onClick={schedulePost}
					title="Schedule this post"
				>
					event_available
				</button>
			) : (
				<button
					className="icon icon__unschedule bottom right"
					onClick={unschedulePost}
					title="Unschedule this post"
				>
					drafts
				</button>
			)}
			<button
				className="icon icon__trash bottom left"
				onClick={trashPost}
				title="Trash this post"
			>delete_forever</button>
		</div>
	);
}