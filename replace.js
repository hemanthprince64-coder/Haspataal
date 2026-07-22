const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && !file.startsWith('.')) {
                replaceInDir(fullPath);
            }
        } else if (file === 'package.json') {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('workspace:*')) {
                const newContent = content.replace(/workspace:\*/g, '*');
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Updated ' + fullPath);
            }
        }
    }
}

replaceInDir(__dirname);
