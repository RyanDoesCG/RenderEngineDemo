class PhysicsEngine 
{
    constructor(engine)
    {
        this.engine = engine
        this.collisions = new Map()
        this.frametime = new RunningAverage()
    }

    alreadyColliding  (a, b) { return  (this.collisions.get(a.id + " " + b.id) === 1) }
    startColliding    (a, b) { this.collisions.set(a.id + " " + b.id, 1) }
    stopColliding     (a, b) { this.collisions.set(a.id + " " + b.id, 0) } 

    update()
    {
        let start = Date.now()

        this.engine.scene.pairs((a, b) => 
        {
            var collision = test(a, b)
            if (collision.hit)
            {
                if (!this.alreadyColliding(a, b)) 
                {
                    this.startColliding(a, b)

                    if (a.physicsComponent) a.physicsComponent.bounce(collision.normal)
                    if (b.physicsComponent) b.physicsComponent.bounce(collision.normal)
                }
            }
            else
            {
                if (this.alreadyColliding(a, b))
                {
                    this.stopColliding(a, b)   
                }
            }
        })

        this.engine.scene.traverse((object) => 
        {
            if (object.physicsComponent)
            {
                object.physicsComponent.update(this.engine.input.d)
            }
        })

        this.frametime.add(Date.now() - start)
    }
}