"use client";

import {CheckCircle, UserPlus, Users} from "lucide-react";
import {ReactElement, useState} from "react";
import ListFriends from "@/components/friends/list/ListFriends";
import ReceivedRequests from "@/components/friends/respond-requests/ReceivedRequests";
import SendRequests from "@/components/friends/send-requests/SendRequests";

const defaultIconClassName = "text-indigo-500";
const defaultIconSize = 20;

type tabTypes = "list" | "received" | "sent";

const tabs = [
    {
        tab: "list",
        label: "Friends list",
        icon: <Users size={defaultIconSize} className={defaultIconClassName}/>
    },
    {
        tab: "received",
        label: "Received friend requests",
        icon: <UserPlus size={defaultIconSize} className={defaultIconClassName}/>
    },
    {
        tab: "sent",
        label: "Sent friend requests",
        icon: <CheckCircle size={defaultIconSize} className={defaultIconClassName}/>
    },
]

export default function FriendLayout() {

    const [selectedTab, setSelectedTab] = useState<tabTypes>("list");
    const baseClasses = "px-4 py-2 text-sm font-medium text-gray-900bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"

    function displayWindow(): ReactElement {
        switch (selectedTab) {
            case "list":
                return <ListFriends/>
            case "received":
                return <ReceivedRequests/>
            case "sent":
                return <SendRequests/>
            default:
                return <div>Default</div>
        }
    }

    return (
        <div>
            <div className={"flex justify-center rounded-md shadow-xs"} role={"group"}>
                {
                    tabs.map((tab, index) => {
                        // Динамични бордер мен раундтар
                        const isFirst: boolean = index === 0;
                        const isLast: boolean = index === tabs.length - 1;

                        const borderClassNames = isFirst || isLast
                            ? "border"
                            : "border-t border-b"

                        const roundedClassNames = isFirst
                            ? "rounded-s-lg border" // kruglota and separating linedar
                            : isLast
                                ? "rounded-e-lg" // kruglota
                                : "border border-l" // separating linedargo caroch

                        return (
                            <button
                                onClick={() => setSelectedTab(tab.tab as tabTypes)}
                                type={"button"}
                                className={`flex items-center gap-2 ${baseClasses} ${borderClassNames} ${roundedClassNames}`}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        )
                    })
                }
            </div>
            <div className={"mt-4"}>
                {displayWindow()}
            </div>
        </div>
    );
}
