import React, { useState, useMemo } from "react";
import Post from "./Post";
import { dateFormat } from "../lib/utils";
import { Droppable } from "react-beautiful-dnd";
import { format } from "date-fns";
import { isEmpty } from "lodash";

export default function PostList({ renderPosts, className, date }) {
	const [hovered, setHovered] = useState(false);

	const droppableId =
		date === false ? "unscheduled" : format(date, dateFormat.date);

	const posts = () => {
		if (isEmpty(renderPosts)) {
			return null;
		}

		return renderPosts.map((post, index) => (
			<Post
				post={post}
				key={post.id}
				index={index}
				unscheduled={droppableId === "unscheduled" ? true : false}
			/>
		));
	};

	const renderPostList = useMemo(posts, [renderPosts, droppableId]);

	return (
		<Droppable droppableId={droppableId}>
			{({ innerRef, droppableProps, placeholder }, snapshot) => (
				<ul
					ref={innerRef}
					{...droppableProps}
					className={`postList ${className} ${
						snapshot.isDraggingOver ? "draggingOver" : "idle"
					}`}
					onMouseEnter={() => setHovered(true)}
					onMouseLeave={() => setHovered(false)}
					style={hovered ? { marginBottom: 0 } : null}
				>
					{renderPostList}
					{date !== false ? (
						<span style={{ disable: "none" }}>{placeholder}</span>
					) : (
						placeholder
					)}
				</ul>
			)}
		</Droppable>
	);
}
