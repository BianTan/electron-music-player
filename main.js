// Modules to control application life and create native browser window
const { app, ipcMain, dialog, BrowserWindow } = require('electron')
const Store = require('./js/DataStore')
const store = new Store({'name': 'Musci Data'})

let mainWindow = null
let addWindow = null

function main () {
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // 当运行第二个实例时,将会聚焦到myWindow这个窗口
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
    app.whenReady().then(() => {
      init()
    })
  }
  app.on('activate', () => {
    if (mainWindow === null) {
      init() // 初始化
    }
    if (addWindow) {
      addWindow.restore()
      if (mainWindow.isMinimized()) mainWindow.restore()
    }
  })
  
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

function init () {
  // 创建浏览器窗口
  mainWindow = new AppWindow({}, './views/index/index.html')
  // 监听窗口加载状态
  mainWindow.webContents.on('did-finish-load', () => {
    const obj = {
      data: store.getTracks(),
      type: 'add'
    }
    mainWindow.send('updateTracksDOM', obj)
  })
  mainWindow.webContents.openDevTools()
  //监听窗口关闭
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // 注册监听
  listenList()
}

function listenAddMusicWindowClick () {
  ipcMain.on('handleOpenWindowClick', e => {
    console.log('---')
    if (!addWindow) {
      addWindow = new AppWindow({
        width: 400,
        height: 520,
        parent: mainWindow
      }, './views/add/add.html')
      addWindow.on('closed', () => {
        addWindow = null
      })
    } else {
      addWindow.focus()
    }
    // addWindow.webContents.openDevTools()
  })
}
function listenSelectMusicClick () {
  ipcMain.on('handleSelectMusicClick', e => {
    dialog.showOpenDialog({
      title: '选择音乐文件',
      buttonLabel: '选择音乐',
      filters: [
        { name: 'Music', extensions: ['mp3', 'm4a', 'aac', 'flag', 'ogg', 'wav', 'wma', 'asf'] }
      ],
      properties: ['openFile', 'multiSelections']
    }).then(result => {
      addWindow.focus()
      const { canceled, filePaths } = result
      if (!canceled) {
        e.sender.send('confirmOpenFile', filePaths)
      }
    }).catch(err => {
      console.log('err', err)
    })
  })
}
function listenAddMusicClick() {
  ipcMain.on('handleAddMusciClick', (e, res) => {
    if (Array.isArray(res) && res.length !== 0) {
      const tracks = store.addTracks(res).getTracks()
      const obj = {
        data: tracks,
        type: 'add'
      }
      mainWindow.send('updateTracksDOM', obj)
      dialog.showMessageBox({
        type: 'info',
        title: '提示',
        message: '音乐文件导入成功！'
      }).then( () => {
        addWindow.focus()
      })
    } else {
      dialog.showMessageBox({
        type: 'error',
        title: '提示',
        message: '请选择音乐文件导入'
      })
    }
  })
}
function listenDelMusicClick() {
  ipcMain.on('handleDelMusic', (e, id) => {
    const tracks = store.delTrack(id).getTracks()
    const obj = {
      data: tracks,
      type: 'del'
    }
    mainWindow.send('updateTracksDOM', obj)
  })
}

// 一次性全部监听，冚家富贵。
function listenList () {
  listenAddMusicWindowClick() // 监听打开添加音乐窗口按钮点击
  listenSelectMusicClick()  // 监听选择音乐按钮点击
  listenAddMusicClick()  // 监听添加音乐按钮点击
  listenDelMusicClick() // 监听音乐删除按钮点击
}

// 窗口创建
class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 1100,
      height: 640,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    }
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

main()