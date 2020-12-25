const { ipcRenderer, app } = require('electron')
const { $ } = require('../../js/utils.js')
const path = require('path')

let musicNameList = []

window.addEventListener('DOMContentLoaded', () => { // 页面加载完成
  listenList()
})

function listenList() {
  // js 原生事件
  $('.open-music-file').addEventListener('click', () => {
    ipcRenderer.send('handleSelectMusicClick')
  })
  $('.add-music-file').addEventListener('click', () => {
    ipcRenderer.send('handleAddMusciClick', musicNameList)
  })

  // 监听 main 发来的确认事件
  ipcRenderer.on('confirmOpenFile', (e, musicList) => {
    if (Array.isArray(musicList) && musicList.length !== 0) {
      createListDOM(musicList)
    }
  })
}

// 创建列表DOM
function createListDOM(musicList) {
  let html = ''
  musicList.forEach((item, index) => {
    if (musicNameList.indexOf(item) === -1) {
      musicNameList.push(item)
    }
  })
  musicNameList.forEach((item, index) => {
    html += `<li class="list-group-item">${path.basename(item)}</li>`
  })
  $('#music-list').innerHTML = html
}
