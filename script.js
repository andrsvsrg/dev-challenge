import {
  addClass, addText,
  append,
  createArc,
  createNode, createDivisionTimeLine,
  getElemBySelector,
  getPositionX,
  getPositionY, createRect, getDateForTooltip, toggleClass, removeClass
} from './utils/helpers.js'

import EVENTS from "./data/events.json" assert { type: "json" }
import NAMES from "./data/names.json" assert { type: "json" }

export const sortArrByDate = sortByDate(EVENTS)
const arrLastHundredDates = createUniqDates(sortArrByDate)    // ['2022-06-21', ...] length(100)
const lastHundredDaysWithEvents = createEventsArrForTimeLine(sortArrByDate, arrLastHundredDates)  // [[{event},{event}..], ...] length(100)
const affectTypeByDate = totalDayAffectedType(lastHundredDaysWithEvents)  // [[{2: 28, 3: 38, 4: 0, 5: 0, 6: 7}], ...] length(100)
const indexOfFirstTimeLine = getFirstIndexActionOnTimeLine(sortArrByDate, arrLastHundredDates)  // 15482
const eventsBeforeTimeLine = sortArrByDate.slice(0, indexOfFirstTimeLine)  // [{event}...] length 15482
const affectTypeBeforeTimeLine = affectTypeTotal(eventsBeforeTimeLine)  // {2: 3685, 3: 3667, 4: 11, 5: 1585, 6: 2185}
const affectTypeAllDays = affectTypeTotal(sortArrByDate)  // {2: 4643, 3: 5743, 4: 13, 5: 1985, 6: 2540}
const totalDayAffectedNumbers = getValueForDivision(affectTypeByDate)  //  [73, 44, 26..]
const timeLineHeightOnPixel = getAllHeightDivision(totalDayAffectedNumbers) // [1,3,4,5 ...] length100, value 0-60 (px)
const timeLineFullInfo = createTimeLineArr()
let intervalIdThumb


////////canvas map///////////////////////////////
const canvas = getElemBySelector('#map')
const ctx = canvas.getContext('2d')
canvas.width = 687
canvas.height = 457

function createPointOnMap(events) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  events.map((point) => {
    createArc(ctx, getPositionX(point.lon), getPositionY(point.lat))
  })
}

//default All Point on map
createPointOnMap(sortArrByDate)

///////// left sidebar ////////////////////////////

function getUserLanguage() {
  const userLanguage = window.navigator.language
  if (NAMES[userLanguage]) {
    return userLanguage
  }
  return 'en'
}

const page_language = getUserLanguage()

function updateInfoEvents(affectTypeAllDays) {
  const leftContainer = getElemBySelector('.sidebar-container')
  addText(leftContainer, '')
  const affTypeObj = NAMES[page_language].affected_type
  for( let key in affTypeObj ) {
    const div = createNode('div')
        const h3 = createNode('h3')
        addText(h3, affectTypeAllDays[key])
        addClass(h3, 'header-sidebar')
        const span = createNode('span')
        addClass(span, 'subheader-sidebar')
        addText(span, affTypeObj[key] )
        append(leftContainer, div)
        append(div, h3)
        append(div, span)
  }
}

// default info all days
updateInfoEvents(affectTypeAllDays)

////////////////////// canvas Line //////////////////////
const canvasTimeLine = getElemBySelector('#time-line-canvas')
const ctxTimeLine = canvasTimeLine.getContext('2d')
canvasTimeLine.width = 1200
canvasTimeLine.height = 62
ctxTimeLine.fillStyle = '#292929'
ctxTimeLine.fillRect(0, 60, 1040, 2)  // create line

// canvas Divisions
function createTimeLineCanvas(ctx, values) {
  let positionX = 21
  let positionY = 0
  values.forEach((height) => {
    positionY = 60 - height
    createRect(ctxTimeLine, positionX, positionY, 8, height)
    positionX += 10
  })

}

//create default Timeline Canvas
createTimeLineCanvas(ctx, timeLineHeightOnPixel)

//////////  create Div Division ///////////

function createDivisions(fullInfoDay) {
  const timeLineDivisions = getElemBySelector('.time-line-divisions')
  addText(timeLineDivisions, '')
  fullInfoDay.forEach((day) => {
    const division = createDivisionTimeLine(onDivisionClick, day.date)
    append(timeLineDivisions, division)
  })
}

function drawThumb(fullInfoDay) {
  let prevThumb = getElemBySelector('.thumb')
  if (prevThumb) {
    const parent = prevThumb.parentElement
    addText(parent, '')
  }
  const activeIndex = fullInfoDay.indexOf(fullInfoDay.find((day) => day.isActive))
  const day = fullInfoDay[activeIndex]
  const allDivisionBlocks = document.querySelectorAll('.division-block')
  const parent = allDivisionBlocks[activeIndex]
  const thumb = createNode('div')
  const tooltipSpan = createNode('span')
  addText(tooltipSpan, getDateForTooltip(day.date))
  addClass(tooltipSpan, 'tooltip-text')
  thumb.dataset.date = day.date
  addClass(thumb, 'thumb')
  addClass(thumb, 'tooltip')
  append(parent, thumb)
  append(thumb, tooltipSpan)
}

//default division and thumb creation
createDivisions(timeLineFullInfo)
drawThumb(timeLineFullInfo)

////////////////////// HANDLERS ////////////////////////

function onDivisionClick() {
  const prevActiveIndex = timeLineFullInfo.indexOf(timeLineFullInfo.find((day) => day.isActive))
  timeLineFullInfo[prevActiveIndex].isActive = false
  const newActiveIndex = timeLineFullInfo.indexOf(timeLineFullInfo.find((day) => day.date === this.dataset.date))
  timeLineFullInfo[newActiveIndex].isActive = true
  updateInfoEvents(timeLineFullInfo[newActiveIndex].affectedTypeWithNumber)
  createPointOnMap(timeLineFullInfo[newActiveIndex].events)
  drawThumb(timeLineFullInfo)
}

function onPlayHandler() {
  const activeIndex = timeLineFullInfo.indexOf(timeLineFullInfo.find((el) => el.isActive))
  if (activeIndex === 99) {
    return
  }
  nextActiveDivision()
  toggleClass(playButton, 'hidden')
  toggleClass(pauseButton, 'hidden')

}

function onPauseHandler() {
  toggleClass(playButton, 'hidden')
  toggleClass(pauseButton, 'hidden')
  clearInterval(intervalIdThumb)
}

///////////// PLAY / PAUSE ///////////////

const playButton = getElemBySelector('.button-play')
const pauseButton = getElemBySelector('.button-pause')
playButton.addEventListener('click', onPlayHandler)
pauseButton.addEventListener('click', onPauseHandler)

function nextActiveDivision() {
  intervalIdThumb = setInterval(() => {
    const activeIndex = timeLineFullInfo.indexOf(timeLineFullInfo.find((el) => el.isActive))
    if (activeIndex === 99) {
      removeClass(playButton, 'hidden')
      addClass(pauseButton, 'hidden')
      clearInterval(intervalIdThumb)
      return
    }
    timeLineFullInfo[activeIndex].isActive = false
    timeLineFullInfo[activeIndex + 1].isActive = true
    updateInfoEvents(timeLineFullInfo[activeIndex + 1].affectedTypeWithNumber)
    createPointOnMap(timeLineFullInfo[activeIndex + 1].events)
    drawThumb(timeLineFullInfo)
  }, 600)
}


//////// function for Created constants //////////

function sortByDate(arr) {
  const result = [...arr].sort((a, b) => {
    const value1 = a.from
    const value2 = b.from
    if (value1 > value2) {
      return 1
    }
    if (value1 < value2) {
      return -1
    }

    return 0
  })
  return result
}

function createUniqDates(events) {
  const timeLineLastHundred = new Set()
  events.forEach((event) => timeLineLastHundred.add(event.from))
  return [...timeLineLastHundred].splice(-100, 100)
}

function createEventsArrForTimeLine(events, dates) {
  const result = []
  events.forEach((event) => {
    if (dates.includes(event.from)) {
      const index = dates.indexOf(event.from)
      if (result[index]) {
        result[index].push(event)
      } else {
        result[index] = []
        result[index].push(event)
      }
    }
  })
  return result
}

function totalDayAffectedType(eventsGroupByDate) {
  const result = []
  eventsGroupByDate.forEach((dayEvents) => {
    const affectTotal = {
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    }
    dayEvents.forEach((event) => {
      if (event.affected_type) {
        affectTotal[event.affected_type] += Number(event.affected_number)
      }
    })
    result.push(affectTotal)
  })

  return result
}

function getFirstIndexActionOnTimeLine(sortArr, timeLineDatesArr) {
  return sortArr.indexOf(sortArr.find((elem) => elem.from === timeLineDatesArr[0]))
}

function affectTypeTotal(events) {
  const affectTotal = {
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
  }
  events.forEach((event) => {
    if (event.affected_type) {
      affectTotal[event.affected_type] += Number(event.affected_number)
    }
  })

  return affectTotal
}


function getValueForDivision(daysTypes) {
  return daysTypes.map((types) => {
    return Object.values(types).reduce((prevValue, currValue) => prevValue += currValue, 0)
  })
}

function getAllHeightDivision(totalDayAffectNumbers) {
  const maxNumber = Math.max.apply(null, totalDayAffectNumbers)  // maxNumber - max height 60 px division
  return totalDayAffectNumbers.map((number) => {
    return Math.ceil((60 * number) / maxNumber)
  })
}



function createTimeLineArr() {
  const result = []
  for (let i = 0; i < arrLastHundredDates.length; i++) {
    const firstArrType = i === 0 ? affectTypeBeforeTimeLine : result[i - 1].affectedTypeWithNumber
    const firstArrEvents = i === 0 ? eventsBeforeTimeLine : result[i - 1].events
    const affectType = addAffectsType(firstArrType, affectTypeByDate[i])
    const eventsTotal = getTotalEvents(firstArrEvents, lastHundredDaysWithEvents[i])
    const day = {
      date: arrLastHundredDates[i],
      totalAffectedNumber: totalDayAffectedNumbers[i],
      affectedTypeWithNumber: affectType,
      events: eventsTotal,
      personalEvents: lastHundredDaysWithEvents[i],
      pixelHeight: timeLineHeightOnPixel[i],
      isActive: i === 99
    }
    result.push(day)
  }

  return result
}

function addAffectsType(prevValues, addValues) {
  const newObj = {}
  for (let key in addValues) {
    newObj[key] = addValues[key] + prevValues[key]
  }

  return newObj
}

function getTotalEvents(prevValues, addValue) {
  return [...prevValues, ...addValue]
}