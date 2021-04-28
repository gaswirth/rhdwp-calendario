import React, { useContext, useEffect } from "react";
import PostList from "./PostList";
import AdminLinks from "./AdminLinks";
import NewPostButton from "./common/NewPostButton";
import { useFetchUnscheduledPosts } from "../lib/hooks";

import PostsContext from "../PostsContext";

export default function UnscheduledDrafts() {
	const {
		posts: { unscheduled },
		postsDispatch,
	} = useContext(PostsContext);

	useEffect(() => {
		postsDispatch({
			type: "REFETCH",
		});
	}, [postsDispatch]);

	const isLoading = useFetchUnscheduledPosts();

	return (
		<>
			<PostList
				className="unscheduledDrafts"
				date={false}
				renderPosts={unscheduled}
				allowDrag={true}
				allowDrop={true}
				loadingState={isLoading}
			/>
			<NewPostButton unscheduled={true} />
			<AdminLinks />
		</>
	);
}
