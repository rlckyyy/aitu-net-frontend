import {useEffect, useRef, useState} from "react";
import {Client} from "@stomp/stompjs";

export default function AudioCall({localUserId, remoteUserId, stompClient}: {
    stompClient: Client,
    localUserId: string,
    remoteUserId: string
}) {
    const [calling, setCalling] = useState<boolean>(false);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        console.log('use effect')
        const peer = new RTCPeerConnection({
            iceServers: [{urls: "stun:stun.l.google.com:19302"}],
        });
        peerConnectionRef.current = peer;

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                const body = {
                    type: "ICE_CANDIDATE",
                    companionId: remoteUserId,
                    candidate: event.candidate,
                };
                console.log('sending: ', body)
                stompClient.publish({
                    destination: `/app/signaling/${remoteUserId}`,
                    body: JSON.stringify(body)
                })
            }
        };

        peer.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        stompClient.subscribe(`/user/${localUserId}/queue/signaling`, async m => {
            console.log('received audio call message', JSON.parse(m.body))
            const message = JSON.parse(m.body);

            if (message.type === "CALL_OFFER") {
                await peer.setRemoteDescription(new RTCSessionDescription(message.sdp));
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                localStreamRef.current = stream;
                stream.getTracks().forEach((track) => peer.addTrack(track, stream));

                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                stompClient.publish({
                    destination: `/app/signaling/${remoteUserId}`,
                    body: JSON.stringify({
                        type: "CALL_ANSWER",
                        companionId: message.senderId,
                        sdp: answer,
                    })
                })
            }

            if (message.type === "CALL_ANSWER") {
                await peer.setRemoteDescription(new RTCSessionDescription(message.sdp));
            }

            if (message.type === "ICE_CANDIDATE") {
                await peer.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
        })
    }, []);

    const initiateCall = async () => {
        if (peerConnectionRef.current) {

            console.log('initiate call')
            setCalling(true)
            const peer = peerConnectionRef.current;
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            localStreamRef.current = stream;
            stream.getTracks().forEach((track) => peer.addTrack(track, stream));

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            stompClient.publish({
                destination: `/app/signaling/${remoteUserId}`,
                body: JSON.stringify({
                    type: "CALL_OFFER",
                    companionId: remoteUserId,
                    senderId: localUserId,
                    sdp: offer,
                })
            })
        }
    };

    function closeCall() {
        console.log('stopping call')

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop())
            localStreamRef.current = null
        }

        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null
        }

        setCalling(false)

        stompClient.publish({
            destination: `/app/signaling/${remoteUserId}`,
            body: JSON.stringify({
                type: 'CALL_HANGUP',
                companionId: remoteUserId,
                senderId: localUserId
            })
        })
    }

    return (
        <div className="p-4">
            <button onClick={initiateCall} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                Start Call
            </button>
            {calling && (
                <button onClick={closeCall}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >Stop calling</button>
            )}
            <audio ref={remoteAudioRef} autoPlay className="mt-4"/>
        </div>
    );
}
