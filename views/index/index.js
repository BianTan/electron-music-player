const { ipcRenderer } = require('electron')
const { $, filterTime } = require('../../js/utils.js')
let musicAduio = new Audio()
let allTracks
let currentTrack
let duration
let currentIndex
let musicIdList

window.addEventListener('DOMContentLoaded', () => { // 页面加载完成 
  listenList()  // 注册监听事件
})

function listenList() {
  // js 原生事件
  $('.open-window-click').addEventListener('click', () => {
    ipcRenderer.send('handleOpenWindowClick')
  })
  $('#music-list').addEventListener('click', e => {
    e.preventDefault()
    musicListClick(e)
  })
  // 总播放按钮点击
  $('.play-button .play-status .fa').addEventListener('click', e => {
    const paused = musicAduio.paused
    if (currentTrack) {
      const classList = $(`.fa[data-id='${currentTrack.id}']`).classList
      switch (paused) {
        case true:
          play(classList)
          break
        case false:
          pause(classList)
          break
      }
    } else {
      if (!allTracks || allTracks.length === 0) return
      setPlayData(allTracks[0].id)
      const classList = $(`.fa[data-id='${currentTrack.id}']`).classList
      play(classList)
    }
  })
  // 上一首
  $('.play-button .before').addEventListener('click', () => {
    switchMusic('before')
  })
  // 下一首
  $('.play-button .after').addEventListener('click', () => {
    switchMusic('after')
  })

  // 监听音乐播放
  musicAduio.addEventListener('loadedmetadata', () => { // 音乐数据加载
    $('.duration').innerText = filterTime(musicAduio.duration)
    duration = musicAduio.duration
  })
  musicAduio.addEventListener('timeupdate', () => { // 音乐事件变化
    const currentTime = musicAduio.currentTime
    updateMusciInfo(currentTime, duration)
  })

  // 监听 main 发来的更新DOM事件
  ipcRenderer.on('updateTracksDOM', (e, res) => {
    const { data, type } = res
    if (res && data.length !== 0) {
      allTracks = data
      musicIdList = allTracks.map(item => {
        return item.id
      })
      const listDOM = createMusicListDOM(data)
      $('#music-list').innerHTML = listDOM
      if (!musicAduio.paused) { // 如果有音乐正在播放
        $(`.fa[data-id='${currentTrack.id}']`).classList.replace('fa-play', 'fa-pause')  // 设置按钮为暂停按钮
      }
    } else if (res && type == 'del' && data.length === 0) {
      allTracks = null
      $('#music-list').innerHTML = '<b>暂时还没有添加音乐文件</b>'
    }
  })
}

// 切换音乐
function switchMusic(type) {
  if (!currentTrack) return
  let index
  switch(type) {
    case 'before':
      index = currentIndex - 1
      if (index < 0) {
        index = musicIdList.length - 1
      }
      break
    case 'after':
      index = currentIndex + 1
      if (index > musicIdList.length - 1) {
        index = 0
      }
      break
  }
  $(`.fa[data-id='${musicIdList[currentIndex]}']`).classList.replace('fa-pause', 'fa-play') // 设置正在播放的音乐按钮为 播放按钮
  const classList = $(`.fa[data-id='${musicIdList[index]}']`).classList // 获取将要播放音乐的 classlist
  setPlayData(musicIdList[index])
  play(classList)
}
// 更新音乐信息数据
function updateMusciInfo(currentTime, duration) {
  progress = Math.floor(currentTime / duration * 100)
  $('.progress-bar').style.width = `${progress}%`
  $('.currentTime').innerText = filterTime(currentTime)
}
// 创建音乐列表DOM
function createMusicListDOM(data) {
  return data.reduce((html, item) => {
    return html += `
      <li class="d-flex list-group-item align-items-center">
        <div class="col-10">
          <i class="fa fa-music text-muted mr-3"></i>
          <b>${item.fileName}</b>
        </div>
        <div class="col-2">
          <i class="fa fa-play fa-fw mr-4" data-id="${item.id}"></i>
          <i class="fa fa-trash fa-fw" data-id="${item.id}"></i>
        </div>
      </li>`
  }, '')
}
// 音乐列表点击事件
function musicListClick(e) {
  let { dataset , classList } = e.target
  const id = dataset && dataset.id
  if (id && classList.value.includes('fa-play')) {  // 点击播放按钮 🎵
    if (currentTrack && currentTrack.id === id) { // 有播放数据并且播放和上次一样（继续播放）
      play(classList)
      return
    } else if (currentTrack && currentTrack.id !== id) {  // 这次播放和上次不一样（切换播放）
      $(`.fa[data-id='${currentTrack.id}']`).classList.replace('fa-pause', 'fa-play')  // 切换上次播放音乐的暂停按钮为播放按钮
    }
    setPlayData(id)
    play(classList)
  } else if (id && classList.value.includes('fa-pause')) {  // 点击暂停按钮 ⏸️
    pause(classList)
  } else if (id && classList.value.includes('fa-trash')) {  // 点击删除按钮
    if (currentTrack && currentTrack.id === id) { // 如果正在播放的音乐ID为删除的音乐ID
      musicAduio.pause()  // 暂停
      $('.play-button .play-status .fa').classList.replace('fa-pause-circle-o', 'fa-play-circle-o')
      currentTrack = null
    }
    ipcRenderer.send('handleDelMusic', id)  // 提交删除音乐的ID
  }
}

function setPlayData(id) {
  currentTrack = allTracks.find(item => { // 找到播放数据
    return item.id === id
  })
  musicAduio.src = currentTrack.path  // 设置播放地址
  currentIndex = musicIdList.findIndex(res => { return res === id })
}
function play(classList) {
  musicAduio.play() // 播放
  classList.replace('fa-play', 'fa-pause')  // 替换播放按钮为暂停按钮
  $('.play-button .play-status .fa').classList.replace('fa-play-circle-o', 'fa-pause-circle-o')
}
function pause(classList) {
  musicAduio.pause()  // 暂停
  classList.replace('fa-pause', 'fa-play')  // 替换暂停按钮为播放按钮
  $('.play-button .play-status .fa').classList.replace('fa-pause-circle-o', 'fa-play-circle-o')
}
