'use client'

import {useAuth} from "@/context/AuthProvider";
import {useEffect, useState} from "react";
import {FriendRequest} from "@/models/friend/FriendRequest";
import {friendsApi} from "@/lib/friendsApi";
import {FriendRequestStatus} from "@/models/friend/FriendRequestStatus";
import {api} from "@/lib";
import Link from "next/link";

export default function ReceivedRequests() {
    const {user} = useAuth();
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        friendsApi.getReceivedFriendRequests(FriendRequestStatus.PENDING)
            .then(response => setFriendRequests(response.data))
            .catch(error => console.error("Error while getting friends:", error))
            .finally(() => setLoading(false));
    }, [user])
    if (loading) {
        return <p>Loading ...</p>
    }
    const handleAcceptRequest = (requestId: string) => {
        try {
            api.friends.respondRequest(requestId, FriendRequestStatus.ACCEPTED);
            setFriendRequests(prev => prev.filter(request => request.id !== requestId));
        } catch (error) {
            console.error("Ошибка при принятии запроса:", error);
        }
    }
    const handleDeclineRequest = (requestId: string) => {
        try {
            api.friends.respondRequest(requestId, FriendRequestStatus.DECLINED);
            setFriendRequests(prev => prev.filter(request => request.id !== requestId));
        } catch (error) {
            console.error("Ошибка при отклонении запроса:", error);
        }
    }
    return (
        <div>
            <h2>Received Friend Requests</h2>
            <ul style={{listStyle: "none", padding: 0}}>
                {friendRequests.length > 0 ? (
                    friendRequests.map((friendReq) => (
                        <li
                            key={friendReq.sender}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px",
                                borderBottom: "1px solid #ddd",
                            }}
                        >
                            <Link
                                href={{
                                    pathname: "/users/profile/another",
                                    query: {userId: friendReq.senderId},
                                }}
                                style={{
                                    textDecoration: "none",
                                    color: "blue",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                }}
                            >
                                <span>{friendReq.sender}</span>
                            </Link>
                            <button
                                onClick={() => handleDeclineRequest(friendReq.id)}
                                style={{
                                    backgroundColor: "red",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    transition: "0.3s",
                                }}
                                onMouseOver={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#45a049")
                                }
                                onMouseOut={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#4CAF50")
                                }
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleAcceptRequest(friendReq.id)}
                                style={{
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    transition: "0.3s",
                                }}
                                onMouseOver={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#45a049")
                                }
                                onMouseOut={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#4CAF50")
                                }
                            >
                                Accept
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No received friend requests</p>
                )}
            </ul>
        </div>
    );
}