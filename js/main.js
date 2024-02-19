(function () 
{
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    ////    Engine Setup
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    class Engine
    {
        constructor ()
        {
            this.rendering = new RenderingEngine (this)
            this.physics   = new PhysicsEngine   (this)
            this.input     = new InputEngine     (this)
            this.events    = new EventQueue      (this)
            this.scene     = new DemoScene       (this)
            this.update    = () => 
            {
                if (ImagesLoaded.every(v => v) && !this.paused)
                {
                    this.input     . update()
                    this.scene     . update()
                    this.physics   . update()
                    this.rendering . update()
                }
            }

            this.paused = false
            document.body.addEventListener('mouseleave', (e) => { this.paused = true })
            document.body.addEventListener('mouseenter', (e) => { this.paused = false })
        }
    };

    const engine = new Engine();

    function loop ()
    {
        engine.update()
        requestAnimationFrame(loop)
    }

    loop()

}())