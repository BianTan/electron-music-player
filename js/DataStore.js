const Store = require('electron-store')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

class DataStore extends Store {
  constructor(setting) {
    super(setting)
    this.tracks = this.get('tracks') || []
  }
  setTracks() {
    this.set('tracks', this.tracks)
    return this
  }
  getTracks() {
    return this.get('tracks') || []
  }
  addTracks(tracks) {
    const saveTracksData = tracks.map(track => {  // 设定数据结构
      return {
        id: uuidv4(),
        fileName: path.basename(track),
        path: track
      }
    }).filter(res => {  // 过滤
      const oldDataFileName = this.getTracks().map(track => track.path )  // 获取旧数据里面是否存在相同路径文件
      return oldDataFileName.indexOf(res.path) < 0  // 返回旧数据里不存在的文件路径
    })
    this.tracks = [ ...this.tracks, ...saveTracksData ]
    return this.setTracks()
  }
  delTrack(trackId) {
    this.tracks = this.tracks.filter(item => {
      return item.id !== trackId
    })
    return  this.setTracks()
  }
}

module.exports = DataStore