const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const scale = window.devicePixelRatio || 5; // 依裝置調整解析度倍率，通常 2 以上
    const cssWidth = window.innerWidth * 0.9;
    const cssHeight = window.innerHeight * 0.6;

    // 設定 canvas 實際像素大小（解析度）
    canvas.width = cssWidth * scale;
    canvas.height = cssHeight * scale;

    // CSS 顯示尺寸（不改變畫面大小）
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';

    // 將繪圖座標縮放（讓繪圖不會變形）
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
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
    tempCanvas.width = 1080//canvas.width;
    tempCanvas.height = 1920//canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    const mode = parseInt(localStorage.getItem('words250718')) || 1;

    const bgMap = {
        1: {
            file: '1.png',
            lines: [
                '逡巡 (qūn xún)',
                'To hesitate or linger –',
                'unwilling to move forward.'
            ]
        },
        2: {
            file: '2.png',
            lines: [
                '氤氳 (yīn yūn)',
                'Thick vapor or haze –',
                'like mist, smoke, or clouds.'
            ]
        },
        3: {
            file: '3.png',
            lines: [
                '熹微 (xī wéi)',
                'Faint morning light –',
                'the soft, pale light just before or at dawn.'
            ]
        }
    };

    const bgInfo = bgMap[mode] || bgMap[1];

    const bg = new Image();
    bg.src = 'background.png';

    bg.onload = async () => {
        // 背景圖
        tempCtx.drawImage(bg, 0, 0, tempCanvas.width, tempCanvas.height);

        // 等待字體載入（必要）
        await document.fonts.ready;

        // 左上角文字
        tempCtx.font = '4rem "Cactus Classical Serif", serif';
        tempCtx.fillStyle = '#666666';
        tempCtx.textBaseline = 'top';
        const lineHeight = 100;
        bgInfo.lines.forEach((line, i) => {
            tempCtx.fillText(line, 40, 80 + i * lineHeight);
        });

        // 縮放筆跡
        const scaleX = tempCanvas.width / canvas.width;
        const scaleY = tempCanvas.height / canvas.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const offsetX = (tempCanvas.width - scaledWidth) / 2;
        const offsetY = (tempCanvas.height - scaledHeight) / 2;

        tempCtx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);


        // 預覽
        const dataURL = tempCanvas.toDataURL('image/png');
        document.getElementById('previewImage').src = dataURL;
        document.getElementById('previewModal').style.display = 'flex';

        document.getElementById('confirmDownload').onclick = () => {
            const link = document.createElement('a');
            link.download = 'words.png';
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

document.getElementById('btn1').addEventListener('click', () => {
    localStorage.setItem('words250718', '1');
    location.reload();
});
document.getElementById('btn2').addEventListener('click', () => {
    localStorage.setItem('words250718', '2');
    location.reload();
});
document.getElementById('btn3').addEventListener('click', () => {
    localStorage.setItem('words250718', '3');
    location.reload();
});

const wordMap = {
    '1': { imgs: ['1-1.gif', '1-2.gif'], text: '逡巡' },
    '2': { imgs: ['2-1.gif', '2-2.gif'], text: '氤氳' },
    '3': { imgs: ['3-1.gif', '3-2.gif'], text: '熹微' }
};

// 取得 localStorage 的值（預設為 '1'）
const canvasImg = document.getElementById('drawCanvas');
const wordId = localStorage.getItem('words250718') || '1';
const selected = wordMap[wordId];

// 設定圖片來源
document.getElementById('write1').src = selected.imgs[0];
document.getElementById('write2').src = selected.imgs[1];
document.getElementById('copy').innerText = 'COPY ' + selected.text

// 複製對應中文
document.getElementById('copy').addEventListener('click', () => {
    navigator.clipboard.writeText(selected.text)
        .then(() => alert(`已複製：「${selected.text}」`))
        .catch(err => alert('複製失敗'));
});

canvasImg.style.backgroundImage = `url('${wordId}.png')`;