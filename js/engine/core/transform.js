class Transform 
{
    constructor (scaling, position, rotation)
    {
        this.scale    = scaling
        this.position = position
        this.rotation = rotation
    }

    matrix ()
    {
        var matrix = identity()
        matrix = multiplym(scale(this.scale[0], this.scale[1], this.scale[2]), matrix)
        matrix = multiplym(rotate(this.rotation[0], this.rotation[1], this.rotation[2]), matrix)
        matrix = multiplym(translate(this.position[0], this.position[1], this.position[2]), matrix)
        return matrix
    }

    inverse ()
    {
        var inv = identity()
        inv = multiplym(translate(-this.position[0], -this.position[1], -this.position[2]), inv)
        inv = multiplym(rotateRev(-this.rotation[0], -this.rotation[1], -this.rotation[2]), inv)
        inv = multiplym(scale(-this.scale[0], -this.scale[1], -this.scale[2]), inv)
        return matrix
    }

    toString()
    {
        return "<p>Position</p>" + "<textarea class=\"vectorComponent\">" + this.position[0].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.position[1].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.position[2].toFixed(2) + "</textarea></br>" +
               "<p>Rotation</p>" + "<textarea class=\"vectorComponent\">" + this.rotation[0].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.rotation[1].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.rotation[2].toFixed(2) + "</textarea></br>" +
               "<p>Scale</p>" + "<textarea class=\"vectorComponent\">" + this.scale[0].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.scale[1].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.scale[2].toFixed(2) + "</textarea></br>"
    }
}

function Scale       (x, y, z) { return [x, y, z] }
function Translation (x, y, z) { return [x, y, z] }
function Rotation    (x, y, z) { return [x*3.14195, y*3.14195, z*3.14195] }