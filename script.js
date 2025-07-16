/*const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let drawing = false;
let lastX = 0, lastY = 0;

//觸控事件
canvas.addEventListener('touchstart', (e) => {
    drawing = true;
    const touch = e.touches[0];
    lastX = touch.clientX;
    lastY = touch.clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (!drawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    drawLine(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchend', () => {
    drawing = false;
});

//滑鼠事件
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    drawLine(e.offsetX, e.offsetY);
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

canvas.addEventListener('mouseleave', () => {
    drawing = false;
});

//通用畫線函數
function drawLine(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    lastX = x;
    lastY = y;
}

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    const bg = new Image();
    bg.src = 'background.png';
    bg.onload = () => {
        //畫上背景圖
        tempCtx.drawImage(bg, 0, 0, tempCanvas.width, tempCanvas.height);
        //設定縮放比例
        const scale = 0.7; // 想要多小就調整這個，例如 0.5 是 50%
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        //將筆跡放到右下角
        const offsetX = canvas.width - scaledWidth;
        const offsetY = canvas.height - scaledHeight;

        //疊加縮放後的筆跡
        tempCtx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);

        const dataURL = tempCanvas.toDataURL('image/png');
        document.getElementById('previewImage').src = dataURL;
        document.getElementById('previewModal').style.display = 'flex';

        document.getElementById('confirmDownload').onclick = () => {
            const link = document.createElement('a');
            link.download = 'my_drawing.png';
            link.href = dataURL;
            link.click();
            document.getElementById('previewModal').style.display = 'none';
        };
    };
});

document.getElementById('cancelPreview').addEventListener('click', () => {
    document.getElementById('previewModal').style.display = 'none';
});
*/
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 修正畫筆定位
function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    return { x, y };
}

let drawing = false;
let lastX = 0, lastY = 0;

// 觸控事件
canvas.addEventListener('touchstart', (e) => {
    const { x, y } = getCanvasCoords(e);
    lastX = x;
    lastY = y;
    drawing = true;
});

canvas.addEventListener('touchmove', (e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    drawLine(x, y);
});

canvas.addEventListener('touchend', () => drawing = false);

// 滑鼠事件
canvas.addEventListener('mousedown', (e) => {
    const { x, y } = getCanvasCoords(e);
    lastX = x;
    lastY = y;
    drawing = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const { x, y } = getCanvasCoords(e);
    drawLine(x, y);
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

// 畫線
function drawLine(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    lastX = x;
    lastY = y;
}

// 清除畫布
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 合成圖片並預覽下載
document.getElementById('saveBtn').addEventListener('click', async () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    const mode = parseInt(localStorage.getItem('words250718')) || 1;

    const bgMap = {
        1: {
            file: 'bg1.gif',
            lines: [
                '逡巡 (qūn xún)',
                'To hesitate or linger –',
                'unwilling to move forward.'
            ]
        },
        2: {
            file: 'bg2.gif',
            lines: [
                '氤氳 (yīn yūn)',
                'Thick vapor or haze –',
                'like mist, smoke, or clouds.'
            ]
        }
    };

    const bgInfo = bgMap[mode] || bgMap[1];

    const bg = new Image();
    bg.src = bgInfo.file;

    bg.onload = async () => {
        // 背景圖
        tempCtx.drawImage(bg, 0, 0, tempCanvas.width, tempCanvas.height);

        // 等待字體載入（必要）
        await document.fonts.ready;

        // 左上角文字
        tempCtx.font = '20px "Noto Sans TC", sans-serif';
        tempCtx.fillStyle = 'black';
        tempCtx.textBaseline = 'top';
        const lineHeight = 26;
        bgInfo.lines.forEach((line, i) => {
            tempCtx.fillText(line, 20, 20 + i * lineHeight);
        });

        // 縮放筆跡
        const scale = 0.7;
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;
        const offsetX = canvas.width - scaledWidth;
        const offsetY = canvas.height - scaledHeight;
        tempCtx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);

        // 預覽
        const dataURL = tempCanvas.toDataURL('image/png');
        document.getElementById('previewImage').src = dataURL;
        document.getElementById('previewModal').style.display = 'flex';

        document.getElementById('confirmDownload').onclick = () => {
            const link = document.createElement('a');
            link.download = 'my_drawing.png';
            link.href = dataURL;
            link.click();
            document.getElementById('previewModal').style.display = 'none';
        };
    };
});

// 取消預覽
document.getElementById('cancelPreview').addEventListener('click', () => {
    document.getElementById('previewModal').style.display = 'none';
});
