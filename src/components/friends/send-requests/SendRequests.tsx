'use client'

import {useEffect, useState} from "react";
import {FriendRequest} from "@/models/friend/FriendRequest";
import {friendsApi} from "@/lib/friendsApi";
import {FriendRequestStatus} from "@/models/friend/FriendRequestStatus";
import {useAuth} from "@/context/AuthProvider";

export default function SendRequests() {
    const {user} = useAuth();
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        friendsApi.getSentFriendRequests(FriendRequestStatus.PENDING)
            .then(response => setFriendRequests(response.data))
            .catch(error => console.error("Error while getting friends:", error))
            .finally(() => setLoading(false));
    }, [user])
    if (loading) {
        return <p>Loading ...</p>
    }
    return (
        <div>
            <h2>Sent Requests</h2>
            <ul>
                {friendRequests.length > 0 ? (
                    friendRequests.map(friend => (
                        <li key={"receiverId"}>{friend.receiverId}</li>
                    ))
                ) : (
                    <p>You dont have sent friend requests.</p>
                )}
            </ul>
        </div>
    )
}