class DemoCamera extends Camera
{
    constructor(params)
    {
        super (params)

        this.velocity        = vec4(0.0, 0.0, 0.0, 0.0)
        this.acceleration    = vec4(0.0, 0.0, 0.0, 0.0)
        this.angularVelocity = vec3(0.0, 0.0, 0.0)

        this.moveSpeed = 0.01
        this.lookSpeed = 0.001
    }

    update()
    {
        const view = new View(this.root.transform.position, this.root.transform.rotation)
        const forward = [
            view.forward[0],
            0.0,
            view.forward[2],
            0.0 ]

        if (!this.engine.input.CmdPressed)
        {
            if (this.engine.input.DPressed) this.velocity = addv(this.velocity, multiplys(view.right,  this.moveSpeed))
            if (this.engine.input.APressed) this.velocity = addv(this.velocity, multiplys(view.right, -this.moveSpeed))
            if (this.engine.input.WPressed) this.velocity = addv(this.velocity, multiplys(forward,  this.moveSpeed))
            if (this.engine.input.SPressed) this.velocity = addv(this.velocity, multiplys(forward, -this.moveSpeed))
            if (this.engine.input.QPressed) this.velocity[1] -= this.moveSpeed
            if (this.engine.input.EPressed) this.velocity[1] += this.moveSpeed
    
            if (this.engine.input.LeftArrowPressed)  this.angularVelocity[1] -= this.lookSpeed;
            if (this.engine.input.RightArrowPressed) this.angularVelocity[1] += this.lookSpeed;
            if (this.engine.input.UpArrowPressed)    this.angularVelocity[0] -= this.lookSpeed;
            if (this.engine.input.DownArrowPressed)  this.angularVelocity[0] += this.lookSpeed;
        }

        this.root.transform.position = addv(this.root.transform.position, this.velocity)
        this.velocity     = addv(this.velocity, this.acceleration)
        this.velocity     = multiplys(this.velocity, 0.9)
        this.acceleration = multiplys(this.acceleration, 0.9)

        this.root.transform.rotation = addv(this.root.transform.rotation, this.angularVelocity)
        this.angularVelocity = multiplys(this.angularVelocity, 0.9)
    }
}