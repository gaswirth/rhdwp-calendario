import React, { useContext } from "react";
import PostLink from "./common/PostLink";
import { getPostList, moveItem, dayKey } from "../lib/utils";
import { decode } from "html-entities";

import PostsContext from "../PostsContext";

export default function PostLinks({ post, unscheduled }) {
	const { id, edit_link, view_link } = post;
	const { posts, postsDispatch } = useContext(PostsContext);

	const unschedulePost = (e) => {
		e.preventDefault();

		const { post_date } = post;
		const sourceId = dayKey(post_date);
		const destinationId = "unscheduled";

		const result = moveItem(
			getPostList(sourceId, posts),
			getPostList(destinationId, posts),
			{ droppableId: sourceId },
			{ droppableId: destinationId }
		);

		postsDispatch({
			type: "MOVE",
			source: result[sourceId],
			destination: result[destinationId],
			sourceId,
			destinationId,
		});

		postsDispatch({
			type: "UPDATE",
			post,
			unscheduled: true,
		});
	};

	const schedulePost = (e) => {
		e.preventDefault();

		const { id, post_date } = post;
		const sourceId = "unscheduled";
		const source = getPostList(sourceId, posts);
		const destinationId = dayKey(post_date);
		const destination = getPostList(destinationId, posts);

		const result = moveItem(
			source,
			destination,
			{
				droppableId: sourceId,
				index: source.findIndex((item) => item.id === id),
			},
			{ droppableId: destinationId }
		);

		postsDispatch({
			type: "MOVE",
			source: result[sourceId],
			destination: result[destinationId],
			sourceId,
			destinationId,
		});

		postsDispatch({
			type: "UPDATE",
			post,
			unscheduled: false,
		});
	};

	const trashPost = () => {
		postsDispatch({
			type: "TRASH",
			post,
			params: {
				id: id,
			},
		});
	};

	return (
		<div className="postLinks">
			<PostLink
				icon="view"
				title="View Post"
				onClick={() => window.open(view_link, "_blank")}
				target="_blank"
			>
				open_in_new
			</PostLink>
			<PostLink
				icon="edit"
				title="Edit Post in a new tab"
				onClick={() => window.open(decode(edit_link), "_blank")}
			>
				mode_edit
			</PostLink>
			{/* <PostLink icon="view" title="View Post" onClick={() => window.open(view_link, "_blank")} target="_blank">open_in_new</PostLink>
			<PostLink icon="view" title="View Post" onClick={() => window.open(view_link, "_blank")} target="_blank">open_in_new</PostLink>
			<PostLink icon="view" title="View Post" onClick={() => window.open(view_link, "_blank")} target="_blank">open_in_new</PostLink> */}
			{unscheduled ? (
				<PostLink
					icon="schedule"
					title="Schedule this post"
					onClick={schedulePost}
				>
					event_available
				</PostLink>
			) : (
				<PostLink
					icon="unschedule"
					title="Unschedule this post"
					onClick={unschedulePost}
				>
					drafts
				</PostLink>
			)}
			<PostLink icon="trash" title="Trash this post" onClick={trashPost}>
				delete_forever
			</PostLink>
		</div>
	);
}
