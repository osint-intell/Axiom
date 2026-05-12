import { PlusCircle, RefreshCcw } from 'lucide-react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge
} from 'reactflow'
import CustomNode from './CustomNode'

const nodeTypes = {
  custom: CustomNode
}

function GraphCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onNodeDragStop,
  onAddNode,
  onReset
}) {
  return (
    <div className="glass-panel h-[720px] overflow-hidden rounded-3xl">
      <ReactFlow
        nodes={nodes}
        edges={edges.map((edge) => ({
          ...edge,
          animated: edge.animated ?? true,
          labelStyle: { fill: '#e5e7eb', fontSize: 12 },
          style: { stroke: '#22D3EE', strokeWidth: 2, ...(edge.style || {}) }
        }))}
        nodeTypes={nodeTypes}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onConnect={(connection) => {
          if (onConnect) {
            onConnect(connection)
          } else {
            addEdge({ ...connection, animated: true }, edges)
          }
        }}
      >
        <Panel position="top-left">
          <div className="glass-panel flex items-center gap-2 rounded-2xl px-3 py-2 text-xs uppercase tracking-[0.25em] text-muted">
            <button type="button" onClick={onAddNode} className="inline-flex items-center gap-2 rounded-full bg-accent-cyan px-3 py-1.5 font-semibold text-background">
              <PlusCircle className="h-3.5 w-3.5" />
              Add Node
            </button>
            <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-primary">
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset View
            </button>
          </div>
        </Panel>
        <MiniMap nodeColor={(node) => node.data?.miniMapColor || '#22D3EE'} />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
      </ReactFlow>
    </div>
  )
}

export default function GraphPanel(props) {
  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  )
}
