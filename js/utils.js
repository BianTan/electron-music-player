const $ = name => {
  return document.querySelector(name)
}

const filterTime = time => {
  let minutes = Math.floor(time / 60)
  let second = Math.floor(time - minutes * 60)
  if (minutes <= 9) minutes = `0${minutes}`
  if (second <= 9) second = `0${second}`
  return `${minutes}:${second}`
}

module.exports = {
  $, filterTime
}