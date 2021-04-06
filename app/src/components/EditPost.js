// TODO CodeScene bumpy road cleanup
import React, {
	useContext,
	useRef,
	useEffect,
	useState,
	useReducer,
	useCallback,
} from "react";
import FieldGroup from "./common/FieldGroup";
import { updateReducer, initialUpdateState } from "../lib/updatePost";
import { useClickOutside } from "../lib/hooks";
import {
	dateFormat,
	filterStatusList,
	wp,
	filterUnchangedParams,
	DEBUG_MODE,
} from "../lib/utils";
import DatePicker from "react-datepicker";
import { format, isFuture, isPast, isToday } from "date-fns";
import { isEmpty } from "lodash";
import { decode } from "html-entities";

import PostsContext from "../PostsContext";
import ViewContext from "../ViewContext";
import DragContext from "../DragContext";

const initialEditPost = {
	post: {},
	editMode: false,
};

function editPostReducer(state, action) {
	switch (action.type) {
		case "SET":
			return {
				post: action.post,
				editMode: true,
			};

		case "EDIT":
			const { field } = action;
			var { value } = action;

			if (field === "post_date") {
				value = new Date(value);
			}

			return {
				...state,
				post: {
					...state.post,
					[field]: value,
				},
			};

		case "TOGGLE_TAXONOMY":
			const term_id = parseInt(action.term_id);
			const index = state.post.taxonomies.hasOwnProperty(action.taxonomy)
				? state.post.taxonomies[action.taxonomy].indexOf(term_id)
				: false;
			let termList =
				index === -1
					? [...state.post.taxonomies[action.taxonomy], term_id]
					: index === false
					? [term_id]
					: [
							...state.post.taxonomies[action.taxonomy].slice(
								0,
								index
							),
							...state.post.taxonomies[action.taxonomy].slice(
								index + 1
							),
					  ];

			return {
				...state,
				post: {
					...state.post,
					taxonomies: {
						...state.post.taxonomies,
						[action.taxonomy]: termList,
					},
				},
			};

		case "CLEAR":
			return initialEditPost;

		default:
			return { state };
	}
}

export default function EditPost() {
	const { routeBase, user, nonce } = wp;
	const {
		viewOptions: { postStatuses },
	} = useContext(ViewContext);
	const {
		posts: { currentPost, taxonomies },
		postsDispatch,
	} = useContext(PostsContext);
	const { draggedPostDispatch } = useContext(DragContext);
	const [editPost, editPostDispatch] = useReducer(
		editPostReducer,
		initialEditPost
	);
	const [updatePost, updatePostDispatch] = useReducer(
		updateReducer,
		initialUpdateState
	);
	const node = useRef();
	const [date, setDate] = useState(new Date());
	const [allowedStatuses, setAllowedStatuses] = useState({});
	const [datePickerDisabled, setDatePickerDisabled] = useState(false);
	const [trashPostClicked, setTrashPostClicked] = useState(false);

	const { post, editMode } = editPost;

	useEffect(() => {
		if (post.post_date && post.post_date !== "undefined") {
			setDate(new Date(post.post_date));
		}

		return () => {
			setDate(new Date());
		};
	}, [post.post_date]);

	useEffect(() => {
		let exclude = [];

		if (post.unscheduled === true) {
			exclude.push("publish", "future", "pending");
		} else if (isFuture(date)) {
			exclude.push("publish");
		} else if (isPast(date)) {
			exclude.push("future");
		}

		const statusList = filterStatusList(postStatuses, exclude);

		setAllowedStatuses(statusList);

		return () => {
			setAllowedStatuses({});
		};
	}, [date, post.unscheduled, postStatuses]);

	useEffect(() => {
		setDatePickerDisabled(
			currentPost.post_date &&
				(isToday(currentPost.post_date) ||
					isPast(currentPost.post_date)) &&
				currentPost.post_status === "publish"
				? true
				: false
		);

		return () => {
			setDatePickerDisabled(false);
		};
	}, [currentPost.post_date, currentPost.post_status]);

	// Update the post
	useEffect(() => {
		if (updatePost.updateNow === true && currentPost.id !== "undefined") {
			updatePostDispatch({
				type: "UPDATING",
			});

			// Check if this is a new post and set the proper URL
			let url = `${routeBase}/posts/`;
			if (updatePost.trash === true) {
				url += `trash/${currentPost.id}/${user}`;
			} else {
				if (currentPost.id === 0) {
					url += `new/${user}`;
				} else {
					url += `update/${currentPost.id}/${user}`;
				}
			}

			let headers = {
				"Content-Type": "application/json",
			};
			if (DEBUG_MODE !== true) {
				headers["X-WP-Nonce"] = nonce;
			}

			let postData = {
				params: filterUnchangedParams(updatePost.params, currentPost),
				unscheduled: updatePost.unscheduled,
			};

			const fetchData = async () => {
				try {
					const response = await fetch(url, {
						method: "POST",
						headers,
						body: JSON.stringify(postData),
					});
					// const data = await response.json(); // If you need to catch the response...
					await response.json();

					draggedPostDispatch({
						type: "END",
					});

					updatePostDispatch({
						type: "COMPLETE",
					});

					postsDispatch({
						type: "SET_CURRENTPOST",
						post: post,
						unscheduled: post.unscheduled,
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
		currentPost,
		routeBase,
		post,
		user,
		nonce,
		draggedPostDispatch,
		postsDispatch,
		updatePost.trash,
		updatePost.params,
		updatePost.updateNow,
		updatePost.unscheduled,
	]);

	useEffect(() => {
		if (currentPost.id > 0 || currentPost.id === 0) {
			editPostDispatch({
				type: "SET",
				post: currentPost,
			});
		}

		return () => {
			editPostDispatch({
				type: "CLEAR",
			});
		};
	}, [currentPost.id, currentPost]);

	const closeModal = useCallback(() => {
		editPostDispatch({
			type: "CLEAR",
		});

		postsDispatch({
			type: "UNSET_CURRENTPOST",
		});
	}, [editPostDispatch, postsDispatch]);

	const handleSubmit = (e) => {
		e.preventDefault();

		updatePostDispatch({
			type: "UPDATE",
			params: {
				post_title: post.post_title,
				post_date: format(
					new Date(post.post_date),
					dateFormat.dateTime
				),
				post_status: post.post_status,
				post_excerpt: post.post_excerpt,
				taxonomies: post.taxonomies,
			},
			unscheduled: post.unscheduled,
		});

		editPostDispatch({
			type: "CLEAR",
		});
	};

	const trashHandler = () => {
		updatePostDispatch({
			type: "TRASH",
			params: {
				id: post.id,
			},
		});

		editPostDispatch({
			type: "CLEAR",
		});

		setTrashPostClicked(false);
	};

	const cancelHandler = () => {
		editPostDispatch({ type: "CLEAR" });
		postsDispatch({
			type: "UNSET_CURRENTPOST",
		});
	};

	const handleInputChange = (e) => {
		editPostDispatch({
			type: "EDIT",
			field: e.target.name,
			value: e.target.value,
		});
	};

	const handleCheckboxToggle = (e) => {
		editPostDispatch({
			type: "EDIT",
			field: e.target.name,
			value: !post[e.target.name],
		});
	};

	const handleTermCheckboxChange = (e) => {
		editPostDispatch({
			type: "TOGGLE_TAXONOMY",
			taxonomy: e.target.name,
			term_id: e.target.value,
		});
	};

	const handleInputDateChange = (date) => {
		if (date === null) {
			date = new Date();
		}

		editPostDispatch({
			type: "EDIT",
			field: "post_date",
			value: date,
		});
	};

	const renderStatusOptions = (statusList) => {
		return Object.keys(statusList).map((status) => (
			<option key={status} value={status}>
				{statusList[status].name}
			</option>
		));
	};

	useClickOutside(node, closeModal);

	return (
		<div className={`editPost ${editMode ? "active" : "inactive"}`}>
			<div className="editPost__container">
				{editMode ? (
					<div ref={node} className="editPost__editor">
						<button className="close icon" onClick={closeModal}>
							highlight_off
						</button>
						<h3 className="title">
							{post.id === 0 ? "New" : "Edit"} Post
						</h3>
						<form
							className="editPost__editor__form"
							onSubmit={handleSubmit}
						>
							<FieldGroup name="post_title" label="Title">
								<input
									name="post_title"
									value={decode(post.post_title, {
										scope: "strict",
									})}
									onChange={handleInputChange}
								/>
							</FieldGroup>

							<FieldGroup name="date_status">
								<div className="fieldGroup__date">
									<div
										className={`post_date ${
											post.unscheduled === true
												? "inactive"
												: "active"
										}`}
									>
										<label htmlFor="post_date">
											Post Date
										</label>
										<DatePicker
											closeOnScroll={(e) =>
												e.target === document
											}
											selected={date}
											timeInputLabel="Time:"
											showTimeInput
											dateFormat={dateFormat.dateTime}
											onChange={handleInputDateChange}
											disabled={datePickerDisabled}
										/>
									</div>
									<div className="unscheduled">
										<input
											type="checkbox"
											name="unscheduled"
											checked={post.unscheduled}
											onChange={handleCheckboxToggle}
										/>
										<label htmlFor="unscheduled">
											Unscheduled
										</label>
									</div>
								</div>
								<div className="fieldGroup__status">
									<label htmlFor="post_status">
										Post Status
									</label>
									<select
										name="post_status"
										onChange={handleInputChange}
										value={post.post_status}
									>
										{renderStatusOptions(allowedStatuses)}
									</select>
								</div>
							</FieldGroup>

							<FieldGroup name="taxonomies">
								<label htmlFor="category">
									Categories
									<fieldset name="category">
										{taxonomies.category.terms.map(
											(term, index) => (
												<label key={index}>
													<input
														type="checkbox"
														name="category"
														value={term.term_id}
														onChange={
															handleTermCheckboxChange
														}
														checked={
															!isEmpty(
																post.taxonomies
															) &&
															!isEmpty(
																post.taxonomies
																	.category
															) &&
															post.taxonomies.category.includes(
																term.term_id
															)
														}
													/>
													{decode(term.name, {
														scope: "strict",
													})}
												</label>
											)
										)}
									</fieldset>
								</label>

								<label htmlFor="post_tag">
									Tags
									<fieldset name="post_tag">
										{taxonomies.post_tag.terms.map(
											(term, index) => (
												<label key={index}>
													<input
														type="checkbox"
														name="post_tag"
														value={term.term_id}
														onChange={
															handleTermCheckboxChange
														}
														checked={
															!isEmpty(
																post.taxonomies
															) &&
															!isEmpty(
																post.taxonomies
																	.post_tag
															) &&
															post.taxonomies.post_tag.includes(
																term.term_id
															)
														}
													/>
													{decode(term.name, {
														scope: "strict",
													})}
												</label>
											)
										)}
									</fieldset>
								</label>
							</FieldGroup>

							<FieldGroup name="post_excerpt" label="Excerpt">
								<textarea
									name="post_excerpt"
									onChange={handleInputChange}
									rows={4}
									value={decode(post.post_excerpt, {
										scope: "strict",
									})}
								/>
							</FieldGroup>

							<div className="post_thumb">
								{post.image ? (
									<div>
										<span>Featured Image</span>
										<a
											href={decode(post.edit_link)}
											target="_blank"
											rel="noreferrer"
										>
											<img
												src={post.image}
												alt={`${post.post_title}`}
											/>
										</a>
									</div>
								) : null}
							</div>

							<div className="editPost__buttons">
								{trashPostClicked === true ? (
									<div className="editPost__buttons__trash confirm">
										<p style={{ fontWeight: "bold" }}>
											Are you sure you want to Trash this
											post?
										</p>
										<input
											type="button"
											onClick={trashHandler}
											value="Yes"
											autoFocus={true}
										/>
										{/* TODO bind ESC to cancel */}
										<input
											type="button"
											onClick={() =>
												setTrashPostClicked(false)
											}
											value="No"
										/>
									</div>
								) : (
									<>
										<input
											type="submit"
											className="editPost__buttons__save"
											value={
												post.id === 0
													? "Save"
													: "Update"
											}
										/>
										<input
											type="button"
											className="editPost__buttons__cancel"
											onClick={cancelHandler}
											value="Cancel"
										/>
										<input
											type="button"
											className="editPost__buttons__trash"
											onClick={() =>
												setTrashPostClicked(true)
											}
											value="Delete"
										/>
									</>
								)}
							</div>
						</form>
					</div>
				) : null}
			</div>
		</div>
	);
}
