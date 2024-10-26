import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

const GLBModel = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url)

  return (
    <Canvas style={{ height: '400px', width: '100%' }}>
      <ambientLight intensity={1.0} /> {/* 環境光の強度を設定 */}
      <pointLight position={[10, 10, 10]} intensity={2} /> {/* ポイント光の強度を設定 */}
      <primitive object={scene} scale={1.5} /> {/* モデルのスケールを設定 */}
      <OrbitControls />
    </Canvas>
  )
}

export default GLBModel
