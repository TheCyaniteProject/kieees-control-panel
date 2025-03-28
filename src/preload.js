const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

    minimize: () => ipcRenderer.send('minimize'),
    close: () => ipcRenderer.send('close'),
    openDevTools: () => ipcRenderer.send('open-devtools'),


    // Send a message to the main process
    sendCommand: (command) => ipcRenderer.send('parse-command', command),

    // Listen for the reply from the main process
    
});

ipcRenderer.on('command-response', (event, response) => {
    // Dispatch a custom event with the response data.
    const customEvent = new CustomEvent('command-response', { detail: response });
    window.dispatchEvent(customEvent);
});