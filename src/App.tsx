import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// XRセッションを管理するためのストア
const xrStore = createXRStore();

// モデルを読み込み、アニメーションを設定するコンポーネント
const Model = () => {
  const { scene, animations } = useGLTF("/giftbox.glb");
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(scene);
      const action = mixerRef.current.clipAction(animations[0]);
      action.play();
    }
  }, [scene, animations]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={scene} />;
};

// 音声を再生するコンポーネント
const Sound = () => {
  const soundRef = useRef<THREE.Audio | null>(null);
  const listenerRef = useRef(new THREE.AudioListener());

  useEffect(() => {
    const audio = new THREE.Audio(listenerRef.current);
    const loader = new THREE.AudioLoader();
    loader.load("/g_06.mp3", (buffer) => {
      audio.setBuffer(buffer);
      audio.setLoop(true);
      audio.setVolume(0.5);
      audio.play();
    });
    soundRef.current = audio;
  }, []);

  return <primitive object={listenerRef.current} />;
};

// VRセッションを開始するためのボタン
const VRButton = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);

  const startVRSession = async () => {
    if (navigator.xr) {
      try {
        const session = await navigator.xr.requestSession("immersive-vr", {
          optionalFeatures: ["local", "bounded-floor"],
        });

        setIsSessionActive(true);

        session.addEventListener("end", () => {
          setIsSessionActive(false);
        });

        // XRセッションを管理するために必要な処理を追加
        // 必要なXR関連の設定をここで行います
      } catch (err) {
        console.error("VRセッションの開始に失敗しました:", err);
      }
    } else {
      console.log("WebXRがサポートされていません。");
    }
  };

  return (
    <button
      onClick={startVRSession}
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        padding: "10px",
        backgroundColor: "#007bff",
        color: "white",
      }}
    >
      {isSessionActive ? "VRセッション中" : "VRを開始"}
    </button>
  );
};

const App = () => {
  return (
    <>
      {/* VR体験を開始するボタン */}
      <VRButton />
      <Canvas camera={{ position: [0, 1.6, 2] }}>
        <XR store={xrStore}>
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} />
          <Model />
          <Sound />
        </XR>
        <OrbitControls />
      </Canvas>
    </>
  );
};

export default App;
