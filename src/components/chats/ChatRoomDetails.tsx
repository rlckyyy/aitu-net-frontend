"use client";

import React, {useEffect, useRef} from "react";
import {ChatRoom} from "@/models/chat/chatRoom";
import Link from "next/link";
import {defaultPfp} from "../../../public/modules/defaultPfp";

interface ChatRoomDetailsProps {
    chatRoom: ChatRoom;

    setIsChatDetailsOpen(isOpen: boolean): void;
}

export const ChatRoomDetails: React.FC<ChatRoomDetailsProps> = ({chatRoom, setIsChatDetailsOpen}) => {

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current?.contains(e.target as Node)) {
                setIsChatDetailsOpen(false)
            }
        }

        document.addEventListener('mouseup', handleClickOutside)

        return () => {
            document.removeEventListener('mouseup', handleClickOutside)
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div ref={ref}
                 className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transition-transform duration-300 scale-100 animate-fade-in">

                {/*Header*/}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{chatRoom.title}</h2>
                    <button
                        onClick={() => setIsChatDetailsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/*Participants*/}
                <div className={"mb-6"}>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Participants</h3>
                    <ul className="space-y-2">
                        {chatRoom.participants.map(participant => (
                            <li className="flex items-center space-x-3" key={participant.id}>
                                <Link className="flex items-center space-x-3"
                                      href={`/users/profile/another?userId=${participant.id}`} passHref
                                >
                                    <img className="w-8 h-8 rounded-full object-cover"
                                         src={participant.avatar?.location || defaultPfp}
                                         alt="Avatar"/>
                                    <span className="text-gray-800 dark:text-white">{participant.username}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}