# Graph Components

Interactive dependency graph visualization for codebase structure.

## Planned Components

| Component            | Description                              |
|----------------------|------------------------------------------|
| `DependencyGraph`    | Main graph canvas (React Flow or D3)     |
| `GraphNode`          | Custom node renderer (File, Class, Fn)  |
| `GraphEdge`          | Custom edge renderer with relationship type |
| `GraphControls`      | Zoom, pan, layout algorithm selector     |
| `GraphLegend`        | Node/edge type legend                    |
| `NodeDetailPanel`    | Side panel showing selected node info    |
| `GraphSearch`        | Find and highlight nodes by name         |

## Visualization Library

**React Flow** recommended for:
- Pan/zoom performance
- Custom node types
- Layout integration (dagre, elkjs)

## Node Types

| Type       | Color   | Icon        |
|------------|---------|-------------|
| File       | Blue    | File icon   |
| Class      | Purple  | Box icon    |
| Function   | Green   | Fn icon     |
| Module     | Orange  | Package icon|

## Data Source

Graph data fetched from `/api/v1/graph` endpoints via React Query.
