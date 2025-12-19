const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createCanvas } = require('canvas');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let canvases = {};

app.post('/api/canvas/init', (req, res) => {
    const { width, height } = req.body;
    if (!width || !height || width <= 0 || height <= 0) {
        return res.status(400).json({ error: 'Invalid dimensions' });
    }
    const id = uuidv4();
    const canvas = createCanvas(width, height);
    canvases[id] = { canvas, elements: [] };
    res.json({ id, message: 'Canvas initialized' });
});

app.post('/api/canvas/:id/add/rectangle', (req, res) => {
    const { id } = req.params;
    const { x, y, width, height, color = '#000000', isFilled = true } = req.body;
    if (!canvases[id]) return res.status(404).json({ error: 'Canvas not found' });
    const ctx = canvases[id].canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (isFilled) ctx.fillRect(x, y, width, height);
    else ctx.strokeRect(x, y, width, height);
    canvases[id].elements.push({ type: 'rectangle', x, y, width, height, color, isFilled });
    res.json({ message: 'Rectangle added' });
});

app.post('/api/canvas/:id/add/circle', (req, res) => {
    const { id } = req.params;
    const { x, y, radius, color = '#000000', isFilled = true } = req.body;
    if (!canvases[id]) return res.status(404).json({ error: 'Canvas not found' });
    const ctx = canvases[id].canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (isFilled) ctx.fill();
    else ctx.stroke();
    canvases[id].elements.push({ type: 'circle', x, y, radius, color, isFilled });
    res.json({ message: 'Circle added' });
});

app.post('/api/canvas/:id/add/text', (req, res) => {
    const { id } = req.params;
    const { text, x, y, fontSize = 12, fontFamily = 'Arial', color = '#000000', align = 'left' } = req.body;
    if (!canvases[id]) return res.status(404).json({ error: 'Canvas not found' });
    const ctx = canvases[id].canvas.getContext('2d');
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    canvases[id].elements.push({ type: 'text', text, x, y, fontSize, fontFamily, color, align });
    res.json({ message: 'Text added' });
});

app.get('/api/canvas/:id/export/pdf', (req, res) => {
    const { id } = req.params;
    if (!canvases[id]) return res.status(404).json({ error: 'Canvas not found' });
    const canvas = canvases[id].canvas;
    const buffer = canvas.toBuffer('image/png');

    const doc = new PDFDocument({ size: [canvas.width, canvas.height], compress: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=canvas.pdf');

    doc.pipe(res);
    doc.image(buffer, 0, 0, { width: canvas.width, height: canvas.height });
    doc.end();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
