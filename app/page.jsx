'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { useControls, button, folder } from 'leva'
import { useState, useEffect } from 'react'

// كومبوننت المانيكان
function AvatarModel() {
  const { scene } = useGLTF('/avatar.glb')
  return <primitive object={scene} scale={2} position={[0, -2, 0]} />
}

// كومبوننت التيشيرت مع حل المشكلة
function ShirtModel({ currentTransform }) {
  const { scene } = useGLTF('/maverick-phoenix-white.glb')

  // --- الحـل السحري لمشكلة الـ Clipping (التداخل) ---
  useEffect(() => {
    // بنلف على كل أجزاء التيشيرت
    scene.traverse((object) => {
      if (object.isMesh) {
        // بنقول للمادة (Material) بتاعة التيشيرت إنها تترسم *فوق* أي حاجة تانية
        // حتى لو رياضياً هما في نفس المكان، عشان التيشيرت يكسب الـ "خناقة" دي
        if (object.material) {
          object.material.depthWrite = true;
          object.material.depthTest = true;
          object.material.polygonOffset = true;
          object.material.polygonOffsetFactor = -2; // ادفع التيشيرت لقدام
          object.material.polygonOffsetUnits = -2;
          object.material.needsUpdate = true; // حدث المواد
        }
      }
    });
  }, [scene]); // بتشتغل مرة واحدة لما الملف يتحمل
  // -----------------------------------------------

  return (
    <primitive 
      object={scene} 
      position={currentTransform.position}
      rotation={currentTransform.rotation}
      scale={currentTransform.scale}
    />
  )
}

function Controls({ onTransformChange }) {
  // Leva controls with states to pass values down
  const [pos, setPos] = useState({ posX: 0, posY: -1, posZ: 0 });
  const [rot, setRot] = useState({ rotX: 0, rotY: 0, rotZ: 0 });
  const [sca, setSca] = useState({ scaleX: 2.1, scaleY: 2.1, scaleZ: 2.1 });

  const values = useControls('Shirt Transform', {
    'Position': folder({
      posX: { value: pos.posX, min: -5, max: 5, step: 0.001, onChange: (v) => setPos(p => ({...p, posX: v}))},
      posY: { value: pos.posY, min: -5, max: 5, step: 0.001, onChange: (v) => setPos(p => ({...p, posY: v}))},
      posZ: { value: pos.posZ, min: -5, max: 5, step: 0.001, onChange: (v) => setPos(p => ({...p, posZ: v}))},
    }),
    'Rotation (radians)': folder({
      rotX: { value: rot.rotX, min: -Math.PI, max: Math.PI, step: 0.001, onChange: (v) => setRot(p => ({...p, rotX: v}))},
      rotY: { value: rot.rotY, min: -Math.PI, max: Math.PI, step: 0.001, onChange: (v) => setRot(p => ({...p, rotY: v}))},
      rotZ: { value: rot.rotZ, min: -Math.PI, max: Math.PI, step: 0.001, onChange: (v) => setRot(p => ({...p, rotZ: v}))},
    }),
    'Scale': folder({
      scaleX: { value: sca.scaleX, min: 0.1, max: 10, step: 0.001, onChange: (v) => setSca(p => ({...p, scaleX: v}))},
      scaleY: { value: sca.scaleY, min: 0.1, max: 10, step: 0.001, onChange: (v) => setSca(p => ({...p, scaleY: v}))},
      scaleZ: { value: sca.scaleZ, min: 0.1, max: 10, step: 0.001, onChange: (v) => setSca(p => ({...p, scaleZ: v}))},
    }),
    '---': folder({
      'Copy Values': button(() => {
        const finalValues = {
          position: [pos.posX, pos.posY, pos.posZ],
          rotation: [rot.rotX, rot.rotY, rot.rotZ],
          scale: [sca.scaleX, sca.scaleY, sca.scaleZ],
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(JSON.stringify(finalValues, null, 2))
          alert('✅ Values copied! Paste them into production.jsx later.')
        }
      }),
    }),
  });

  // Pass actual values up to parent
  useEffect(() => {
    onTransformChange({
      position: [pos.posX, pos.posY, pos.posZ],
      rotation: [rot.rotX, rot.rotY, rot.rotZ],
      scale: [sca.scaleX, sca.scaleY, sca.scaleZ],
    });
  }, [pos, rot, sca, onTransformChange]);

  return null;
}

export default function FittingRoomLevaFixed() {
  // Shared state to sync Leva and Canvas
  const [transform, setTransform] = useState({
    position: [0, -1, 0],
    rotation: [0, 0, 0],
    scale: [2.1, 2.1, 2.1], // Start a bit bigger
  });

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#18181b', position: 'relative' }}>
      {/* Leva Controls Component */}
      <Controls onTransformChange={setTransform} />

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows gl={{ preserveDrawingBuffer: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <group>
          <AvatarModel />
          {/* ShirtModel uses the synced transform */}
          <ShirtModel currentTransform={transform} />
        </group>
        
        <OrbitControls enableZoom={true} />
        <Environment preset="city" />
        <gridHelper args={[10, 10]} position={[0, -2, 0]} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/avatar.glb')
useGLTF.preload('/maverick-phoenix-white.glb')
