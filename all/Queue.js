Queue = function(n) {
    this._array = new Array(n);
    this._head = 0;
    this._tail = 0;
}

Queue.prototype.queue = function(object) {
    this._array[this._head % this._array.length] = object;
    this._head++;
}

Queue.prototype.dequeue = function() {
    if(this._tail == this._head) return null;
    var toReturn = this._array[this._tail % this._array.length];
    this._tail++;
    return toReturn;
}

Queue.prototype.length = function() {
    return (this._head - this._tail) % this._array.length;
}

Queue.prototype.countNew = function() {
    var count = 0;
    var fresh = 0;
    for (var i = this._head - 1; i >= this._tail && count < this._array.length; i--, count++)
        if(this._array[i % this._array.length].isNew) fresh++;
    return fresh;
}

Queue.prototype.items = function() {
    var toRet = new Array();
    var i = this._tail;
    while(i != this._head) {
        toRet.push(this._array[i % this._array.length]);
        i++;
    }
    return toRet;
}

Queue.prototype.items_reverse = function() {
    var toRet = new Array();
    var count = 0;
    for (var i = this._head - 1; i >= this._tail && count < this._array.length; i--, count++)
        toRet.push(this._array[i % this._array.length]);
    return toRet;
}
Queue.prototype.flush = function() {
    var toRet = new Array();
    var item = this.dequeue();
    while(item) {
        toRet.push(item);
        item = this.dequeue();
    }
    return toRet;
}
/*
var queue = new Queue(10);

for (var i = 0; i < 100; i++) {
    queue.queue(i);
    if (Math.random() < 0.5) {
        console.log(queue.dequeue());
    }
}

console.log("- " + queue.length());
var item = queue.dequeue();
while(item) {
    console.log(item);
    item = queue.dequeue();
}
*/
