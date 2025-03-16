// 初始化玩家数据
function initializePlayer() {
    const savedName = localStorage.getItem('playerName');
    const savedAnswers = localStorage.getItem('bingoAnswers');
    const savedTasks = localStorage.getItem('bingoTasks');

    if (savedName) {
        document.getElementById('player-name-input').value = savedName;
        document.getElementById('player-name').textContent = savedName;
        document.getElementById('player-info').classList.remove('hidden');
        document.querySelector('.player-input-section').classList.add('hidden');
    }

    if (!savedAnswers) {
        localStorage.setItem('bingoAnswers', JSON.stringify({
            1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: ''
        }));
    } else {
        // 恢复已保存的答案
        const answers = JSON.parse(savedAnswers);
        Object.entries(answers).forEach(([taskId, answer]) => {
            const input = document.querySelector(`.answer-input[data-task="${taskId}"]`);
            if (input) input.value = answer;
        });
    }

    if (!savedTasks) {
        localStorage.setItem('bingoTasks', JSON.stringify({
            1: false, 2: false, 3: false,
            4: false, 5: false, 6: false,
            7: false, 8: false, 9: false
        }));
    }
    
    loadTaskStatus();
    setupAnswerInputs();
}

// 保存玩家名字
function saveName() {
    const nameInput = document.getElementById('player-name-input');
    const name = nameInput.value.trim();
    
    if (name) {
        localStorage.setItem('playerName', name);
        document.getElementById('player-name').textContent = name;
        document.getElementById('player-info').classList.remove('hidden');
        document.querySelector('.player-input-section').classList.add('hidden');
    }
}

// 设置答案输入框的事件监听
function setupAnswerInputs() {
    const inputs = document.querySelectorAll('.answer-input');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const taskId = input.getAttribute('data-task');
            const answers = JSON.parse(localStorage.getItem('bingoAnswers'));
            answers[taskId] = input.value.trim();
            localStorage.setItem('bingoAnswers', JSON.stringify(answers));
        });
    });
}

// 加载任务状态并更新UI
function loadTaskStatus() {
    const tasks = JSON.parse(localStorage.getItem('bingoTasks'));
    Object.entries(tasks).forEach(([taskId, completed]) => {
        const cell = document.querySelector(`.bingo-cell[data-task="${taskId}"]`);
        if (cell) {
            const stamp = cell.querySelector('.stamp');
            if (stamp) {
                if (completed) {
                    stamp.classList.remove('hidden');
                } else {
                    stamp.classList.add('hidden');
                }
            }
        }
    });
}

// 初始化 HTML5 QR Code Scanner
let html5QrcodeScanner;

// 处理扫描结果
function onScanSuccess(decodedText) {
    try {
        console.log('Scanned QR Code:', decodedText); // 添加调试日志
        
        // 尝试从QR码内容中提取任务ID
        let taskId;
        if (decodedText.includes('TASK_')) {
            // 如果QR码格式是 "TASK_X"
            taskId = parseInt(decodedText.split('_')[1]);
        } else if (decodedText.includes('task')) {
            // 如果QR码格式是 "taskX"
            taskId = parseInt(decodedText.replace('task', ''));
        } else {
            // 直接尝试解析数字
            taskId = parseInt(decodedText);
        }

        console.log('Extracted Task ID:', taskId); // 添加调试日志

        if (taskId && taskId >= 1 && taskId <= 9) {
            const cell = document.querySelector(`.bingo-cell[data-task="${taskId}"]`);
            if (cell) {
                const stamp = cell.querySelector('.stamp');
                if (stamp) {
                    stamp.classList.remove('hidden');
                }
                // 更新任务状态
                const tasks = JSON.parse(localStorage.getItem('bingoTasks'));
                tasks[taskId] = true;
                localStorage.setItem('bingoTasks', JSON.stringify(tasks));
                
                cell.setAttribute('data-completed', 'true');
                checkBingo();
                
                // 添加成功提示
                alert('任務完成！Task completed!');
                
                // 自动关闭扫描器
                if (html5QrcodeScanner) {
                    html5QrcodeScanner.clear();
                    html5QrcodeScanner = null;
                    document.getElementById('qr-reader').classList.add('hidden');
                }
            }
        } else {
            console.log('Invalid task ID:', taskId); // 添加调试日志
            alert('無效的QR碼，請重試。Invalid QR code, please try again.');
        }
    } catch (error) {
        console.error('QR Code scanning error:', error); // 添加详细错误日志
        alert('掃描出錯，請重試。Scanning error, please try again.');
    }
}

// 检查是否达成 BINGO
function checkBingo() {
    const cells = document.querySelectorAll('.bingo-cell');
    const completedStates = Array.from(cells).map(cell => cell.hasAttribute('data-completed'));
    
    // 检查行
    for (let i = 0; i < 3; i++) {
        if (completedStates[i*3] && completedStates[i*3+1] && completedStates[i*3+2]) {
            showBingoModal();
            return;
        }
    }
    
    // 检查列
    for (let i = 0; i < 3; i++) {
        if (completedStates[i] && completedStates[i+3] && completedStates[i+6]) {
            showBingoModal();
            return;
        }
    }
    
    // 检查对角线
    if ((completedStates[0] && completedStates[4] && completedStates[8]) ||
        (completedStates[2] && completedStates[4] && completedStates[6])) {
        showBingoModal();
        return;
    }
}

// 显示 BINGO 弹窗
function showBingoModal() {
    document.getElementById('bingo-modal').classList.remove('hidden');
}

// 初始化扫描器
document.getElementById('start-scanner').addEventListener('click', function() {
    const reader = document.getElementById('qr-reader');
    reader.classList.toggle('hidden');
    
    if (!reader.classList.contains('hidden')) {
        if (!html5QrcodeScanner) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: {width: 250, height: 250} },
                false
            );
            html5QrcodeScanner.render(onScanSuccess);
        }
    } else {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        }
    }
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePlayer();
    
    // 中间格子自动完成
    const centerCell = document.querySelector('.bingo-cell.auto-complete');
    if (centerCell) {
        centerCell.setAttribute('data-completed', 'true');
        const centerStamp = centerCell.querySelector('.stamp');
        if (centerStamp) {
            centerStamp.classList.remove('hidden');
        }
        const tasks = JSON.parse(localStorage.getItem('bingoTasks'));
        tasks[5] = true; // 中间格子的 taskId 是 5
        localStorage.setItem('bingoTasks', JSON.stringify(tasks));
    }
}); 