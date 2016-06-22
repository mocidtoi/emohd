sendPermitJoin = function (validSec) {
    var buffer = new Buffer(8);
    buffer[0] = 0x44;
    buffer[1] = 0x31;
    buffer[2] = 0x32;
    buffer[3] = parseInt(validSec, 10);
    serialPort.write(buffer);
    return "Ok";
}
