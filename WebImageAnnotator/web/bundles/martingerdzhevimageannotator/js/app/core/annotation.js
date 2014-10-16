define(function()
{
    var Annotation = function()
    {
	this.color = Annotation.getRandomColor();
	this.polygon = new Array();
	this.type = null;
	this.id = null;
	this.polygonId = null;
    };

    Annotation.prototype.addPoint = function(x, y)
    {
	this.polygon.push(x);
	this.polygon.push(y);
    };

    Annotation.prototype.getPointAt = function(index)
    {
	if (this.polygon.length > 2 * index + 1)
	    return {
		x : this.polygon[2 * index],
		y : this.polygon[2 * index + 1]
	    };
    };

    Annotation.prototype.getPolygonLength = function()
    {
	return this.polygon.length / 2;
    };

    Annotation.prototype.removeLastPoint = function()
    {
	if (this.polygon.length > 0)
	    return {
		y : this.polygon.pop(),
		x : this.polygon.pop()
	    };
	else
	    return null;
    };

    Annotation.prototype.getPolygon = function()
    {
	return this.polygon;
    };

    Annotation.prototype.getPolygonId = function()
    {
	return this.polygonId;
    };

    Annotation.prototype.setPolygonId = function(id)
    {
	this.polygonId = id;
    };

    Annotation.prototype.setType = function(type)
    {
	this.type = type;
    };

    Annotation.prototype.getType = function()
    {
	return this.type;
    };

    Annotation.prototype.setId = function(id)
    {
	this.id = id;
    };

    Annotation.prototype.getId = function()
    {
	return this.id;
    };

    Annotation.getRandomColor = function()
    {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++)
	{
	    color += letters[Math.round(Math.random() * 15)];
	}

	return color;
    };

    return Annotation;
});
