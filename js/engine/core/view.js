class View
{
    constructor(position, rotation, width = 0, height = 0, aspect = 0, near = 0, far = 0, fov = 0, jitter = 0)
    {
        this.position    = position
        this.near        = near
        this.far         = far
        this.fov         = fov
        this.projection  = perspective(fov, near, far, width, height, aspect, jitter)
        this.worldToView = identity()
        this.worldToView = multiplym(translate (-position[0], -position[1], -position[2]), this.worldToView)
        this.worldToView = multiplym(rotate    ( rotation[0],  rotation[1],  rotation[2]), this.worldToView) 
        this.viewToWorld = identity()
        this.viewToWorld = multiplym(translate( position[0],  position[1],  position[2]), this.viewToWorld)
        this.viewToWorld = multiplym(rotateRev(-rotation[0], -rotation[1], -rotation[2]), this.viewToWorld)
        this.forward     = normalize(multiplyv(vec4(0.0, 0.0, -1.0, 0.0), this.viewToWorld))
        this.right       = normalize(multiplyv(vec4(1.0, 0.0,  0.0, 0.0), this.viewToWorld))
        this.up          = normalize(multiplyv(vec4(0.0, 1.0,  0.0, 0.0), this.viewToWorld))
    }
}