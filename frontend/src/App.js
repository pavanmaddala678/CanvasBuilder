import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
  const [canvasId, setCanvasId] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const previewRef = useRef(null);

  const initCanvas = async () => {
    const res = await axios.post('http://localhost:3000/api/canvas/init', dimensions);
    setCanvasId(res.data.id);

    const ctx = previewRef.current.getContext('2d');
    previewRef.current.width = dimensions.width;
    previewRef.current.height = dimensions.height;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
  };

  const addRectangle = async () => {
    const data = { x: 50, y: 50, width: 100, height: 60, color: 'red', isFilled: true };
    await axios.post(`http://localhost:3000/api/canvas/${canvasId}/add/rectangle`, data);
    const ctx = previewRef.current.getContext('2d');
    ctx.fillStyle = data.color;
    ctx.fillRect(data.x, data.y, data.width, data.height);
  };

  const addCircle = async () => {
    const data = { x: 200, y: 200, radius: 50, color: 'blue', isFilled: true };
    await axios.post(`http://localhost:3000/api/canvas/${canvasId}/add/circle`, data);
    const ctx = previewRef.current.getContext('2d');
    ctx.beginPath();
    ctx.arc(data.x, data.y, data.radius, 0, 2 * Math.PI);
    ctx.fillStyle = data.color;
    ctx.fill();
  };

  const addText = async () => {
    const data = { text: 'Hello Canvas', x: 100, y: 300, fontSize: 20, color: 'green', align: 'left' };
    await axios.post(`http://localhost:3000/api/canvas/${canvasId}/add/text`, data);
    const ctx = previewRef.current.getContext('2d');
    ctx.font = `${data.fontSize}px Arial`;
    ctx.fillStyle = data.color;
    ctx.textAlign = data.align;
    ctx.fillText(data.text, data.x, data.y);
  };

  const exportPdf = () => {
    window.location.href = `http://localhost:3000/api/canvas/${canvasId}/export/pdf`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Canvas Builder (No Images)</h2>
      <div>
        Width: <input type="number" value={dimensions.width} onChange={e => setDimensions({ ...dimensions, width: parseInt(e.target.value) })} />
        Height: <input type="number" value={dimensions.height} onChange={e => setDimensions({ ...dimensions, height: parseInt(e.target.value) })} />
        <button onClick={initCanvas}>Initialize Canvas</button>
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={addRectangle} disabled={!canvasId}>Add Rectangle</button>
        <button onClick={addCircle} disabled={!canvasId}>Add Circle</button>
        <button onClick={addText} disabled={!canvasId}>Add Text</button>
        <button onClick={exportPdf} disabled={!canvasId}>Export PDF</button>
      </div>
      <canvas ref={previewRef} style={{ border: '1px solid black', marginTop: '20px' }}></canvas>
    </div>
  );
}

export default App;
