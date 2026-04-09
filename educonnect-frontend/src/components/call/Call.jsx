import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

const Call = ({ user, targetUser, type = "video", onClose }) => {
  const [callState, setCallState] = useState("idle"); 
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === "video");
  // idle | calling | incoming | connected

  const localVideo = useRef();
  const remoteVideo = useRef();

  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // 🎥 START CALL
  const startCall = async () => {
    const constraints =
      type === "video"
        ? { audio: true, video: true }
        : { audio: true };

    localStream.current =
      await navigator.mediaDevices.getUserMedia(constraints);

    if (localVideo.current) {
      localVideo.current.srcObject = localStream.current;
    }

    peerConnection.current = new RTCPeerConnection(configuration);

    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: targetUser.uid,
        });
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("call-user", {
      offer,
      to: targetUser.uid,
      from: user.uid,
      type,
    });

    setCallState("calling");
  };

  // 📞 RECEIVE CALL
  useEffect(() => {
    socket.on("incoming-call", async ({ offer, from, type }) => {
      setCallState("incoming");

      const constraints =
        type === "video"
          ? { audio: true, video: true }
          : { audio: true };

      localStream.current =
        await navigator.mediaDevices.getUserMedia(constraints);

      peerConnection.current = new RTCPeerConnection(configuration);

      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });

      peerConnection.current.ontrack = (event) => {
        remoteVideo.current.srcObject = event.streams[0];
      };

      await peerConnection.current.setRemoteDescription(offer);

      // STORE CALLER
      peerConnection.current.from = from;
    });

    socket.on("call-accepted", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(answer);
      setCallState("connected");
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      await peerConnection.current.addIceCandidate(candidate);
    });

  }, []);

  // ✅ ACCEPT CALL
  const acceptCall = async () => {
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer-call", {
      answer,
      to: peerConnection.current.from,
    });

    setCallState("connected");
  };

  // ❌ END CALL
  const endCall = () => {
    peerConnection.current?.close();
    localStream.current?.getTracks().forEach((t) => t.stop());
    setIsMicMuted(false);
    setIsVideoEnabled(type === "video");
    setCallState("idle");
    onClose();
  };

  const toggleMic = () => {
    if (!localStream.current) return;

    const nextMuted = !isMicMuted;
    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMicMuted(nextMuted);
  };

  const toggleVideo = () => {
    if (!localStream.current || type !== "video") return;

    const nextEnabled = !isVideoEnabled;
    localStream.current.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsVideoEnabled(nextEnabled);
  };

  return (
    <div className="call-container">

      {/* CALL BUTTONS */}
      {callState === "idle" && (
        <>
          <button onClick={startCall}>Start {type} Call</button>
        </>
      )}

      {callState === "calling" && <h3>Calling...</h3>}

      {callState === "incoming" && (
        <>
          <h3>Incoming Call</h3>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={endCall}>Reject</button>
        </>
      )}

      {callState === "connected" && (
        <div className="video-area">

          {/* LOCAL */}
          <video
            ref={localVideo}
            autoPlay
            muted
            className="local-video"
          />

          {/* REMOTE */}
          <video
            ref={remoteVideo}
            autoPlay
            className="remote-video"
          />

          <button onClick={toggleMic}>
            {isMicMuted ? "Unmute" : "Mute"}
          </button>

          {type === "video" ? (
            <button onClick={toggleVideo}>
              {isVideoEnabled ? "Disable Video" : "Enable Video"}
            </button>
          ) : null}

          <button onClick={endCall}>End Call</button>

        </div>
      )}

    </div>
  );
};

export default Call;