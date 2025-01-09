radio.onReceivedBuffer(function (receivedBuffer) {
    message = receivedBuffer
})
let error = ""
let full = false
let startReceived = false
let message: Buffer = null
let watchdogLimit = 600000
let lastActionTime = input.runningTime()
let _request = sensor.stringToBuffer("request")
radio.setGroup(23)
radio.setTransmitPower(7)
let _ready = sensor.stringToBuffer("ready")
let _start = sensor.stringToBuffer("start")
let _ack = sensor.stringToBuffer("ack")
let _full = sensor.stringToBuffer("full")
let _empty = sensor.stringToBuffer("empty")
let currentLightLevel: number = sensor.none()
let currentTempLevel: number = sensor.none()
message = sensor.none()
let _req = sensor.stringToBuffer("request")
let requesting = true
let sendingData = true
let awaitingAcknowledgement = true
while (true) {
    if (!(startReceived)) {
        basic.pause(100)
        if (message != sensor.none() && sensor.compareBuffers(message, _start)) {
            startReceived = true
            lastActionTime = input.runningTime()
            basic.showString("S")
            basic.clearScreen()
        } else {
            continue;
        }
    }
    currentTempLevel = input.temperature()
    currentTempLevel = currentTempLevel * 1.8 + 32
    currentLightLevel = input.lightLevel()
    if (currentTempLevel != sensor.none() && currentLightLevel != sensor.none()) {
        sensor.sendBuffer(_ready)
        lastActionTime = input.runningTime()
    }
    while (awaitingAcknowledgement) {
        basic.pause(100)
        if (message != sensor.none() && sensor.compareBuffers(message, _request)) {
            sensor.sendBuffer(_ready)
        }
        if (message != sensor.none() && sensor.compareBuffers(message, _ack)) {
            basic.showString("R")
            basic.clearScreen()
            awaitingAcknowledgement = false
            lastActionTime = input.runningTime()
        }
        if (message != sensor.none() && sensor.compareBuffers(message, _full)) {
            full = true
            awaitingAcknowledgement = false
            lastActionTime = input.runningTime()
        }
        if (input.runningTime() - lastActionTime > watchdogLimit) {
            error = "Ack Timeout"
            datalogger.log(datalogger.createCV("Error", error))
        }
        while (input.runningTime() - lastActionTime > watchdogLimit) {
            sensor.sendBuffer(_request)
            basic.pause(5000)
            if (message != sensor.none() && sensor.compareBuffers(message, _ack)) {
                lastActionTime = input.runningTime()
            }
        }
    }
    while (sendingData) {
        if (message != sensor.none() && sensor.compareBuffers(message, _ack)) {
            sensor.sendData(currentTempLevel, currentLightLevel)
            sendingData = false
            lastActionTime = input.runningTime()
            basic.showString("D")
            basic.clearScreen()
        } else if (message != sensor.none() && sensor.compareBuffers(message, _full)) {
            while (full) {
                if (message != sensor.none() && sensor.compareBuffers(message, _empty)) {
                    control.reset()
                }
            }
        }
    }
    control.waitMicros(4800000000)
    sendingData = true
    awaitingAcknowledgement = true
    requesting = true
    currentLightLevel = sensor.none()
    currentTempLevel = sensor.none()
    message = sensor.none()
    lastActionTime = input.runningTime()
}
