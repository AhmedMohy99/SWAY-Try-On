'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { useState } from 'react'

function AvatarModel() {
  const { scene } = useGLTF('/avatar.glb')
  return <primitive object={scene} scale={2} position={[0, -2, 0]} />
}

function ShirtModel({ transform }) {
  const { scene } = useGLTF('/maverick-phoenix-white.glb')
  
  return (
    <primitive 
      object={scene} 
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
    />
  )
}

function ControlPanel({ transform, setTransform }) {
  const updateValue = (category, axis, value) => {
    setTransform(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [axis]: parseFloat(value)
      }
    }))
  }

  const copyToClipboard = () => {
    const output = JSON.stringify(transform, null, 2)
    console.log('='.repeat(60))
    console.log('FINAL TRANSFORM VALUES:')
    console.log('='.repeat(60))
    console.log(output)
    console.log('='.repeat(60))
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(output)
      alert('✅ Transform values copied to clipboard!')
    }
  }

  const resetAll = () => {
    setTransform({
      position: { x: 0, y: -1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2, y: 2, z: 2 }
    })
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.95)',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      width: '320px',
      maxHeight: '90vh',
      overflowY: 'auto',
      backdropFilter: 'blur(20px)'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        color: '#22d3ee', 
        fontWeight: 'bold',
        fontSize: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Shirt Transform Controls
      </h2>

      {/* Position Controls */}
      <Section title="Position">
        <Slider 
          label="X" 
          value={transform.position.x} 
          onChange={(v) => updateValue('position', 'x', v)}
          min={-5} max={5} step={0.01}
        />
        <Slider 
          label="Y" 
          value={transform.position.y} 
          onChange={(v) => updateValue('position', 'y', v)}
          min={-5} max={5} step={0.01}
        />
        <Slider 
          label="Z" 
          value={transform.position.z} 
          onChange={(v) => updateValue('position', 'z', v)}
          min={-5} max={5} step={0.01}
        />
      </Section>

      {/* Rotation Controls */}
      <Section title="Rotation (radians)">
        <Slider 
          label="X" 
          value={transform.rotation.x} 
          onChange={(v) => updateValue('rotation', 'x', v)}
          min={-Math.PI} max={Math.PI} step={0.01}
        />
        <Slider 
          label="Y" 
          value={transform.rotation.y} 
          onChange={(v) => updateValue('rotation', 'y', v)}
          min={-Math.PI} max={Math.PI} step={0.01}
        />
        <Slider 
          label="Z" 
          value={transform.rotation.z} 
          onChange={(v) => updateValue('rotation', 'z', v)}
          min={-Math.PI} max={Math.PI} step={0.01}
        />
      </Section>

      {/* Scale Controls */}
      <Section title="Scale">
        <Slider 
          label="X" 
          value={transform.scale.x} 
          onChange={(v) => updateValue('scale', 'x', v)}
          min={0.1} max={10} step={0.01}
        />
        <Slider 
          label="Y" 
          value={transform.scale.y} 
          onChange={(v) => updateValue('scale', 'y', v)}
          min={0.1} max={10} step={0.01}
        />
        <Slider 
          label="Z" 
          value={transform.scale.z} 
          onChange={(v) => updateValue('scale', 'z', v)}
          min={0.1} max={10} step={0.01}
        />
      </Section>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button onClick={copyToClipboard} style={{
          flex: 1,
          padding: '12px',
          backgroundColor: '#22d3ee',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '12px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          📋 Copy Values
        </button>
        <button onClick={resetAll} style={{
          flex: 1,
          padding: '12px',
          backgroundColor: '#3f3f46',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '12px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          🔄 Reset
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '11px', 
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#a1a1aa'
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Slider({ label, value, onChange, min, max, step }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '6px',
        alignItems: 'center'
      }}>
        <label style={{ fontSize: '12px', color: '#d4d4d8' }}>{label}</label>
        <input 
          type="number"
          value={value.toFixed(2)}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          style={{
            width: '70px',
            padding: '4px 8px',
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            color: '#22d3ee',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: '#3f3f46',
          outline: 'none',
          accentColor: '#22d3ee'
        }}
      />
    </div>
  )
}

export default function FittingRoomNative() {
  const [transform, setTransform] = useState({
    position: { x: 0, y: -1, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 2, y: 2, z: 2 }
  })

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#18181b',
      position: 'relative'
    }}>
      <ControlPanel transform={transform} setTransform={setTransform} />
      
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <group>
          <AvatarModel />
          <ShirtModel transform={{
            position: [transform.position.x, transform.position.y, transform.position.z],
            rotation: [transform.rotation.x, transform.rotation.y, transform.rotation.z],
            scale: [transform.scale.x, transform.scale.y, transform.scale.z]
          }} />
        </group>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          minDistance={2}
          maxDistance={15}
        />
        <Environment preset="city" />
        <gridHelper args={[10, 10]} position={[0, -2, 0]} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/avatar.glb')
useGLTF.preload('/maverick-phoenix-white.glb')
