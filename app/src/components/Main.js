import React, { forwardRef, useContext } from "react";
import Calendar from "./Calendar";
import List from "./List";
import EditPost from "./EditPost";
import { useFetchTaxonomyTerms } from "../lib/hooks";

import ViewContext from "../ViewContext";
import PostsContext from "../PostsContext";

const Main = forwardRef(({ todayRef }, ref) => {
	const {
		viewOptions: { viewMode },
	} = useContext(ViewContext);

	useFetchTaxonomyTerms(PostsContext, "category");
	useFetchTaxonomyTerms(PostsContext, "post_tag");

	return (
		<main className="calendario__main">
			<div className="view" ref={ref}>
				{viewMode === "calendar" ? (
					<Calendar className="view__calendar" todayRef={todayRef} />
				) : (
					<List className="view__list" todayRef={todayRef} />
				)}
			</div>
			<EditPost />
		</main>
	);
});
export default Main;
