function CountdownTimer(timeMs_, callback_) {
    this.timeMs = timeMs_;
    this.callback = callback_;
    this.timeoutID = setTimeout(this._alarm, this.timeMs, this);
    //this.repeat = false;
}

/*CountdownTimer.prototype.willRepeat = function(repeat_) {
    this.repeat = repeat_;
    return this;
};*/

CountdownTimer.prototype.resetCounter = function() {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(this._alarm, this.timeMs, this);
};

CountdownTimer.prototype._alarm = function(that) {
    that.callback();
    
    //if(this.repeat())
    //    this.timeoutID = setTimeout(this._alarm, timeMs);
};