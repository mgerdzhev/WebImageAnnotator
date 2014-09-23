Function.prototype.extend = function(parentClass) {
    for (var f in parentClass.prototype)
        this.prototype[f] = parentClass.prototype[f];
    this.prototype.constructor = this;
    this.prototype.parent = parentClass.prototype;

    return this;
};

Math.roundPrecise = function(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
};
