const { dialog, app, ipcMain, BrowserWindow } = require('electron');
// include the Node.js 'path' module at the top of your file
const path = require('node:path');
const child_process = require('child_process');
// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).


let terminal = undefined; // is set to .spawn("cmd.exe"); in app.whenReady()

async function run_script(command, args) {
    terminal.stdin.write(command + "\n")
}

let mainWindow = undefined;

// modify your existing createWindow() function
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 800,
        //resizable: false,
        transparent: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    ipcMain.on('minimize', () => {
        mainWindow.minimize();
    });
    ipcMain.on('close', () => {
        mainWindow.close();
    });
    ipcMain.on('open-devtools', () => {
        mainWindow.webContents.openDevTools();
    });
}

ipcMain.on('parse-command', (event, command) => {
    run_script(command, null);
});

app.whenReady().then(() => {
    createWindow();

    startTerminal();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})


async function startTerminal() {
    terminal = child_process.spawn("cmd.exe");

    setTimeout(() => {

        terminal.stdout.setEncoding('utf8');
        terminal.on('error', (error) => {
            mainWindow.webContents.send('command-response', "An error occured: " + error);
            console.log(data);
        });
        terminal.stdout.on('data', (data) => {
            //Here is the output
            data = data.toString();
            console.log(data);
            mainWindow.webContents.send('command-response', data);
        });
        terminal.stderr.on('data', (data) => {
            //Here is the output
            data = data.toString();
            console.log(data);
            mainWindow.webContents.send('command-response', data);
        });
    }, 1000);
}