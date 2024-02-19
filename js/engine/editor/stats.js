class Stats
{
    constructor(engine)
    {
        this.engine = engine
    }

    generateHTML()
    {
        var HTML = 
        "<p>" + this.engine.rendering.view.position[0].toFixed(2) + " " + 
                this.engine.rendering.view.position[1].toFixed(2) + " " + 
                this.engine.rendering.view.position[2].toFixed(2) + "</p>" + 
        "<p>" + Math.round(this.engine.rendering.frametime.get()) + "ms rendering</p>"  + 
        "<p>" + Math.round(this.engine.physics.frametime.get()) + "ms physics</p>" 

        document.getElementById("ui").innerHTML = HTML
    }

    update ()
    {
       this.generateHTML()
    }
}