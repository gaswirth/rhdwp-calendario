import React from "react";
import MainHeader from "./MainHeader";
import { useFetchPostStatuses } from "../lib/hooks";
import { wp } from "../lib/utils";

export default function Header({ handleTodayClick }) {
	useFetchPostStatuses();

	const { postsUrl, pluginUrl } = wp;

	return (
		<header className="calendario__header">
			<div className="calendario__header__content">
				<div className="calendarHeader">
					<MainHeader handleTodayClick={handleTodayClick} />
				</div>
				<div className="title">
					<button
						className="icon closeCalendario"
						onClick={() => (window.location.href = postsUrl)}
						title="Close"
					>
						close
					</button>
					<h1 className="calendario__title">
						<img
							src={`${pluginUrl}cal-logo-long.png`}
							alt="editorial calendar.io logo"
						/>
					</h1>
				</div>
			</div>
		</header>
	);
}
