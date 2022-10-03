import {
  ONE_PIXEL_ON_DEGREES_X,
  ONE_PIXEL_ON_DEGREES_Y,
  UPPER_UKR_POINT,
  WESTERN_UKR_POINT
} from '../constants/constants.js'


//////// DOM helpers //////////////
export function createNode(element) {
  return document.createElement(element)
}

export function createDivisionTimeLine(onClickHandler, date) {
  const division = createNode('div')
  division.style.width = '8px'
  division.style.height = '60px'
  division.classList.add('division-block')
  division.dataset.date = date
  division.addEventListener('click', onClickHandler)
  return division
}

export function append(parent, el) {
  return parent.appendChild(el)
}

export function getElemBySelector(selector) {
  return document.querySelector(selector)
}

export function addClass(elem, className) {
  return elem.classList.add(className)
}

export function removeClass(elem, className) {
  return elem.classList.remove(className)
}

export function addText(elem, text) {
  return elem.innerText = text
}

export function toggleClass(elem, className) {
  return elem.classList.toggle(className)
}

///////////////////Maps position //////////////

export function getPositionX(lon) {
  const deffLon = lon - WESTERN_UKR_POINT  // 8.386578
  const positionX = deffLon / ONE_PIXEL_ON_DEGREES_X
  return positionX
}

export function getPositionY(lat) {
  const deffLat = UPPER_UKR_POINT - lat  // 6.068033
  const positionY = deffLat / ONE_PIXEL_ON_DEGREES_Y
  return positionY
}

////////////////////// canvas ////////////////////////////

const  canvas = getElemBySelector('#map').getContext('2d');
let alpha = 0
canvas.globalAlpha = alpha;

export function createArc(ctx, posX, posY) {
  function draw() {
    ctx.beginPath()
    ctx.arc(posX, posY, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = '#C00000'
    alpha += .001;
    ctx.globalAlpha = alpha
    ctx.fill()
  }
  if(alpha < 1) {
    setTimeout(draw,1000/60);
  } else {
    draw()   // imprecise wording - If you click on one of the columns, the map should display all cases from the beginning of the war to this day. (the appearance of points on the map is animated from: no point to showing all points)
  }
}

export function createRect(ctx, x, y, width, height) {
  ctx.fillStyle = '#292929'
  ctx.fillRect(x, y, width, height)
}

////////////////  data ///////////////


const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function getDateForTooltip(dateStr) {   // "2022-02-25"
  console.log()
  const result = `${dateStr.slice(8, 10)}  ${month[dateStr.slice(5, 7) - 1]},  ${dateStr.slice(0, 4)}`
  return result
}



