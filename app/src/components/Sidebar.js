import React from "react";
import UnscheduledDrafts from "./UnscheduledDrafts";
import { renderWidget } from "../lib/utils";

export default function Sidebar() {
	return (
		<aside className="calendario__sidebar">
			{renderWidget(
				"Unscheduled Drafts",
				"unscheduledDrafts",
				<UnscheduledDrafts />
			)}

			{renderWidget(
				"bugs + todo",
				"dev",
				<div>
					<p>
						<a
							href="https://github.com/gaswirth/rhdwp-calendario/issues"
							target="_blank"
							rel="noreferrer"
						>
							Report issue/bug
						</a>
					</p>
					<p>
						GitHub:{" "}
						<a
							href="https://github.com/gaswirth/rhdwp-calendario"
							target="_blank"
							rel="noreferrer"
						>
							gaswirth/rhdwp-calendario
						</a>
					</p>
				</div>
			)}
		</aside>
	);
}
