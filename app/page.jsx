'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { useControls, button, folder } from 'leva'
import { useState } from 'react'

function AvatarModel() {
  const { scene } = useGLTF('/avatar.glb')
  return <primitive object={scene} scale={2} position={[0, -2, 0]} />
}

function ShirtModel() {
  const { scene } = useGLTF('/maverick-phoenix-white.glb')
  
  // Leva controls for real-time adjustment
  const shirtTransform = useControls('Shirt Transform', {
    'Position': folder({
      posX: { value: 0, min: -5, max: 5, step: 0.01, label: 'X' },
      posY: { value: -1, min: -5, max: 5, step: 0.01, label: 'Y' },
      posZ: { value: 0, min: -5, max: 5, step: 0.01, label: 'Z' },
    }),
    'Rotation (radians)': folder({
      rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'X' },
      rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Y' },
      rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Z' },
    }),
    'Scale': folder({
      scaleX: { value: 2, min: 0.1, max: 10, step: 0.01, label: 'X' },
      scaleY: { value: 2, min: 0.1, max: 10, step: 0.01, label: 'Y' },
      scaleZ: { value: 2, min: 0.1, max: 10, step: 0.01, label: 'Z' },
      uniformScale: { value: 2, min: 0.1, max: 10, step: 0.01, label: 'Uniform' },
    }),
    '---': folder({
      'Copy Values': button(() => {
        const values = {
          position: [shirtTransform.posX, shirtTransform.posY, shirtTransform.posZ],
          rotation: [shirtTransform.rotX, shirtTransform.rotY, shirtTransform.rotZ],
          scale: [shirtTransform.scaleX, shirtTransform.scaleY, shirtTransform.scaleZ],
        }
        console.log('='.repeat(60))
        console.log('COPY THESE VALUES TO YOUR CODE:')
        console.log('='.repeat(60))
        console.log(JSON.stringify(values, null, 2))
        console.log('='.repeat(60))
        
        // Also copy to clipboard if available
        if (navigator.clipboard) {
          navigator.clipboard.writeText(JSON.stringify(values, null, 2))
          alert('✅ Values copied to clipboard!')
        }
      }),
      'Reset All': button(() => {
        // This will reset to default values
        window.location.reload()
      }),
    }),
  })

  return (
    <primitive 
      object={scene} 
      position={[shirtTransform.posX, shirtTransform.posY, shirtTransform.posZ]}
      rotation={[shirtTransform.rotX, shirtTransform.rotY, shirtTransform.rotZ]}
      scale={[
        shirtTransform.scaleX, 
        shirtTransform.scaleY, 
        shirtTransform.scaleZ
      ]}
    />
  )
}

function Scene() {
  const [showAvatar, setShowAvatar] = useState(true)
  const [showShirt, setShowShirt] = useState(true)

  // Camera and lighting controls
  const { ambientIntensity, directionalIntensity, envPreset } = useControls('Lighting', {
    ambientIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
    directionalIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
    envPreset: {
      value: 'city',
      options: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby']
    }
  })

  useControls('Visibility', {
    showAvatar: {
      value: true,
      onChange: (v) => setShowAvatar(v)
    },
    showShirt: {
      value: true,
      onChange: (v) => setShowShirt(v)
    }
  })

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 10]} intensity={directionalIntensity} />
      
      <group>
        {showAvatar && <AvatarModel />}
        {showShirt && <ShirtModel />}
      </group>
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={true}
        minDistance={2}
        maxDistance={15}
      />
      <Environment preset={envPreset} />
      
      {/* Grid helper for reference */}
      <gridHelper args={[10, 10]} position={[0, -2, 0]} />
    </>
  )
}

export default function FittingRoom() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#18181b',
      position: 'relative'
    }}>
      {/* Instructions Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '15px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(34, 211, 238, 0.3)',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '300px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#22d3ee', fontWeight: 'bold' }}>
          🎮 Controls
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Use <strong>Leva panel</strong> (top right) to adjust shirt</li>
          <li><strong>Click "Copy Values"</strong> when done</li>
          <li><strong>Mouse drag</strong> to rotate view</li>
          <li><strong>Scroll</strong> to zoom in/out</li>
          <li><strong>Right-click drag</strong> to pan</li>
        </ul>
      </div>

      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/avatar.glb')
useGLTF.preload('/maverick-phoenix-white.glb')
