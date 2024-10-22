const fs = require('fs');
const path = require('path');

// 移動するファイルのリスト
const filesToMove = [
    { src: 'app/notes/weightRecord.tsx', dest: 'app/notes/weightRecord.tsx' },
    { src: 'app/page.tsx', dest: 'app/page.tsx' },
    // 他のファイルもここに追加
];

// ディレクトリを作成する関数
const createDirIfNotExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// ファイルを移動する関数
const moveFiles = () => {
    filesToMove.forEach(file => {
        const srcPath = path.join(__dirname, file.src);
        const destPath = path.join(__dirname, file.dest);
        createDirIfNotExists(path.dirname(destPath));
        fs.renameSync(srcPath, destPath);
        console.log(`Moved: ${srcPath} to ${destPath}`);
    });
};

// メイン関数
const main = () => {
    moveFiles();
    console.log('ファイルの整理が完了しました。');
};

// 実行
main();