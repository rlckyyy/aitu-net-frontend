import {useEffect, useRef, useState} from "react";
import {Client} from "@stomp/stompjs";

type Signal =
    | { type: "CALL_OFFER"; sdp: RTCSessionDescriptionInit; senderId: string }
    | { type: "CALL_ANSWER"; sdp: RTCSessionDescriptionInit }
    | { type: "ICE_CANDIDATE"; candidate: RTCIceCandidateInit }
    | { type: "CALL_HANGUP" };

export default function AudioCall({
                                      localUserId,
                                      remoteUserId,
                                      stompClient,
                                  }: {
    stompClient: Client;
    localUserId: string;
    remoteUserId: string;
}) {
    const [calling, setCalling] = useState(false);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

    const constraints: MediaStreamConstraints = {
        audio: {
            echoCancellation: false,          // enables echo cancellation
            noiseSuppression: true,          // reduces background noise
            autoGainControl: false,          // disables automatic volume control
            channelCount: 2,                 // stereo audio
            sampleRate: 48000,               // HD audio
            sampleSize: 16                   // CD-quality (24 is often ignored)
        }
    };

    useEffect(() => {
        preparePeer();

        return cleanup;
    }, []);

    function preparePeer() {
        stompClient.subscribe(
            `/user/${localUserId}/queue/signaling`,
            async (message) => {
                const signal: Signal = JSON.parse(message.body);
                const peer = getOrCreatePeerConnection();

                handleSignal(signal, peer)
                    .catch(reason => console.log(reason)) // ignorit ete bereik
            }
        );
    }

    async function handleSignal(signal: Signal, peer: RTCPeerConnection) {
        switch (signal.type) {
            case "CALL_OFFER": {
                if (peer.signalingState !== "stable") {
                    console.warn("Skipping CALL_OFFER, bad state:", peer.signalingState);
                    return;
                }

                await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));

                const localStream = await navigator.mediaDevices.getUserMedia(constraints);
                localStreamRef.current = localStream;
                localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                for (const candidate of pendingCandidates.current) {
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingCandidates.current = [];

                stompClient.publish({
                    destination: `/app/signaling/${signal.senderId}`,
                    body: JSON.stringify({
                        type: "CALL_ANSWER",
                        sdp: answer,
                    }),
                });
                break;
            }

            case "CALL_ANSWER": {
                if (
                    peer.signalingState === "have-local-offer" &&
                    !peer.currentRemoteDescription
                ) {
                    await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                } else {
                    console.warn("Skipping CALL_ANSWER, bad state:", peer.signalingState);
                }
                break;
            }

            case "ICE_CANDIDATE": {
                if (peer.remoteDescription && peer.remoteDescription.type) {
                    await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
                } else {
                    pendingCandidates.current.push(signal.candidate);
                }
                break;
            }

            case "CALL_HANGUP": {
                cleanup();
                break;
            }
        }
    }

    function getOrCreatePeerConnection(): RTCPeerConnection {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        const peer = new RTCPeerConnection({
            iceServers: [{urls: "stun:stun.l.google.com:19302"}],
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                stompClient.publish({
                    destination: `/app/signaling/${remoteUserId}`,
                    body: JSON.stringify({
                        type: "ICE_CANDIDATE",
                        candidate: event.candidate,
                    }),
                });
            }
        };

        peer.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        peerConnectionRef.current = peer;
        return peer;
    }

    const initiateCall = async () => {
        const peer = getOrCreatePeerConnection();

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        peer.getTransceivers().forEach(transceiver => {
            const sender = transceiver.sender
            const params = sender.getParameters()

            if (!params.encodings) {
                params.encodings = [{}]
            }

            params.encodings[0].maxBitrate = 128000
            sender.setParameters(params)
        })

        stompClient.publish({
            destination: `/app/signaling/${remoteUserId}`,
            body: JSON.stringify({
                type: "CALL_OFFER",
                senderId: localUserId,
                sdp: offer,
            }),
        });

        setCalling(true);
    };

    const cleanup = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
        pendingCandidates.current = [];
        setCalling(false);
    };

    const hangupCall = () => {
        stompClient.publish({
            destination: `/app/signaling/${remoteUserId}`,
            body: JSON.stringify({type: "CALL_HANGUP"}),
        });
        cleanup();
    };

    return (
        <div className="p-4">
            <button
                onClick={initiateCall}
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                Start Call
            </button>
            {calling && (
                <button
                    onClick={hangupCall}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded"
                >
                    Hang Up
                </button>
            )}
            <audio ref={remoteAudioRef} autoPlay className="mt-4"/>
        </div>
    );
}
