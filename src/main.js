const { dialog, app, ipcMain, BrowserWindow } = require('electron');
// include the Node.js 'path' module at the top of your file
const path = require('node:path');
const child_process = require('child_process');
// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).
async function run_script(command, args) {
    var child = child_process.spawn(command, args, {
        encoding: 'utf8',
        shell: true
    });
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
        mainWindow.webContents.send('command-response', "An error occured: " + error);
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
        //Here is the output
        data = data.toString();
        console.log(data);
        mainWindow.webContents.send('command-response', data);
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
        // Return some data to the renderer process with the mainprocess-response ID
        mainWindow.webContents.send('command-response', data);
        //Here is the output from the command
        console.log(data);
    });
}

let mainWindow = undefined;

// modify your existing createWindow() function
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 800,
        resizable: false,
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

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})