
let canvas = document.getElementById('visualiser')
let canvasCtx = canvas.getContext('2d')
let log = document.getElementById('log')
console.log(canvas)
var analyser
let started = false



// general flow: sound desk >> computer (web audio >> OBS >> resolume) >> arduino >> LED panel

let macMode = function() {
    navigator.mediaDevices.getUserMedia({audio: true})
    .then(function(stream) {
        initiateNode(stream)
    })
}

let initiateNode = function (stream) {
    let source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)
    console.log(stream)
    visualise() 
}

// create media stream from mic input
canvas.onclick = function() {
    if (started) {
        return
    }
    started = true
    let audioCtx = new AudioContext()
    analyser = audioCtx.createAnalyser()
if (navigator.mediaDevices) {
    navigator.mediaDevices.getDisplayMedia ({audio: true, video: true})
    .then(function(stream) {
        initiateNode(stream)
    })
    .catch(function(err) {
        console.log('getUserMedia error' + err)
    })
    // analyser.connect(audioCtx.destination)
}
}


// todo: create media stream from browser output

// canvas

canvas.setAttribute('width', window.innerWidth)
canvas.setAttribute('height', document.querySelector('body').clientHeight)

// draw

let colorOffset = 360

let visualise = function(detail = 256) {
    // detail = 32768
    analyser.fftSize = detail // determines detail
    var bufferLength = analyser.fftSize
    var dataArray = new Uint8Array(bufferLength)
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
    let draw = function(colorOffset) {
        drawVisual = requestAnimationFrame(draw)
        analyser.getByteTimeDomainData(dataArray)
        let max = [...dataArray].sort()[dataArray.length - 1]
        // console.log(dataArray)
        canvasCtx.fillStyle = 'rgb(255,255,255)'
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
        canvasCtx.lineWidth = 5
        // let hi = dataArray.sort()[dataArray.length - 1]
        // max = 0
        // canvasCtx.strokeStyle = 'rgb(' + max + ',0,0)'
        let hue = ~~ (360 * max / 255)
        // console.log(hue)
        // canvasCtx.strokeStyle = 'hsl(' + hue + '100%, 50%)'
        canvasCtx.strokeStyle = 'hsl(' + Math.abs(colorOffset - hue) + ', 100%, 50%)'
        // console.log(canvasCtx.strokeStyle)
        canvasCtx.beginPath()
        canvasCtx.lineCap = 'round'

        let sliceWidth = canvas.width * 1.0 / bufferLength
        let x = 0
        // console.log(max)
        
        for (let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0
            // v = dataArray.sort()[dataArray.length - 1]  / 128.0
            let y = v * canvas.height / 2
            if (i === 0) {
                canvasCtx.moveTo(x, y)
            } else {
                canvasCtx.lineTo(x, y)
            }
            x += sliceWidth
        }


        canvasCtx.lineTo(canvas.width, canvas.height / 2)
        canvasCtx.stroke()
    }
    draw()

}

// change parameters
let parameterChange = false
let clientX
let clientY

canvas.addEventListener('mousedown', function(e) {
    console.log('mousedown started')
    parameterChange = true
    clientX = e.offsetX
    clientY = e.offsetY
})

canvas.addEventListener('mouseup', function() {
    console.log('mousedown finished')
    if (parameterChange) {
        parameterChange = false
    }
})

canvas.addEventListener('mousemove', function(e) {
    if (parameterChange) {
        let old = colorOffset
        // console.log('off: ' + colorOffset)
        y = e.offsetY
        colorOffset += (10 * (y - clientY))
        // console.log('new: ' +  colorOffset)
        log.innerText = 'off: ' + old + '&nbsp;' + 'new: ' + colorOffset
    }
})