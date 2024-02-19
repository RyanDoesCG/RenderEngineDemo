class PhysicsComponent extends Component
{
    constructor ()
    {
        super()
        this.vel = vec3(0.0, 0.0, 0.0)
        this.acc = vec3(0.0, 0.0, 0.0) 
        this.type = "PhysicsComponent"
    }

    bounce(n)
    {
        this.vel = multiplys(reflect(normalize(this.vel), n), len(this.vel) * 0.7)
    }

    update(t)
    {
        //https://gamedev.stackexchange.com/questions/15708/how-can-i-implement-gravity
        let gravity = vec3(0.0, -0.00001, 0.0)

        this.acc = gravity
        this.transform.position = addv(this.transform.position, multiplys(this.vel, t))
        this.vel = addv(this.vel, multiplys(this.acc, t))
    }
}