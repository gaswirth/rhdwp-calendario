import React, { useContext } from "react";
import Post from "./Post";
import { isToday, isPast } from "date-fns";

import PostsContext from "../PostsContext";
import DragContext from "../DragContext";

export default function PostList({ posts, className, date }) {
	const { postsDispatch } = useContext(PostsContext);
	const { draggedPost, dragDispatch } = useContext(DragContext);

	const handleDragOver = (e) => {
		e.preventDefault();

		if (e.currentTarget.classList.contains("unscheduled-drafts")) {
			let draggedTo = e.target.dataset.index
				? Number(e.target.dataset.index)
				: false;

			dragDispatch({
				type: "DRAGGING_OVER_UNSCHEDULED",
				draggedTo: draggedTo,
			});
		}
	};

	const handleDrop = (e) => {
		if (date === false) {
			// unscheduled
			postsDispatch({
				type: "UNSCHEDULE",
				post: draggedPost.post,
				posts: draggedPost.updatedUnscheduledOrder,
			});
		} else {
			// calendar
			postsDispatch({
				type: "CALENDAR",
				post: draggedPost.post,
				newDate: date,
			});
		}

		dragDispatch({
			type: "END",
		});
	};

	const renderPost = (post, index) => {
		return <Post post={post} key={post.id} index={index} />;
	};

	let listProps = {
		className: `post-list ${className}`,
		onDragOver: handleDragOver,
	};

	if (!isToday(date) && !isPast(date)) {
		listProps.onDrop = handleDrop;
	} else {
		listProps.className += " drop-disabled";
	}

	return (
		<ul {...listProps}>{posts.map((post, i) => renderPost(post, i))}</ul>
	);
}