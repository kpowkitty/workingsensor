namespace sensor {
    //% block
    export function sendBuffer(buffer: Buffer) {
        radio.sendBuffer(buffer);
    }

    //% block
    export function bufferToString(buffer: Buffer): string {
        if (buffer.length == 0) {
            return null
        }

        let str: string

        for (let i = 9; i < buffer.length; i++) {
            str += buffer[i]
        }
        return str
    }

    //% block
    export function receiveABuffer(handler: (message: Buffer) => void): void {
        radio.onReceivedBuffer(function (receivedBuffer) {
            handler(receivedBuffer);
        });
    }

    //% block
    export function receiveBytes(): Buffer | null {
        let buffer: Buffer = radio.readRawPacket();
        return buffer ? buffer.slice(0, buffer.length - 4) : null;
    }

    //% block
    export function stringToBuffer(str: string): Buffer {
        return Buffer.fromUTF8(str);
    }

    //% block
    export function sendLight(light: number): void {
        let encoded_light = "light" + light.toString();
        let buffer_light: Buffer = sensor.stringToBuffer(encoded_light)
        radio.sendBuffer(buffer_light)
    }

    //% block
    export function sendTemp(temp: number): void {
        let encoded_temp = "temp " + temp.toString();
        let buffer_temp: Buffer = sensor.stringToBuffer(encoded_temp)
        radio.sendBuffer(buffer_temp)
    }

    //% block
    export function sendData(temp: number, light: number): void {
        sendTemp(temp)
        sendLight(light)
    }

    //% block
    export function concatenateBuffers(buf1: Buffer, buf2: Buffer): Buffer {
        return Buffer.concat([buf1, buf2]);
    }

    //% block
    export function compareBuffers(buf1: Buffer, buf2: Buffer): boolean {
        if (buf1.length != buf2.length) {
            return false;
        }

        for (let i = 0; i < buf1.length; i++) {
            if (buf1.getUint8(i) != buf2.getUint8(i)) {
                return false;
            }
        }
        return true;
    }

    //% block
    export function none(): null {
        return null
    }
}