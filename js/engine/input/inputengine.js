class InputEngine
{
    constructor(engine)
    {
        this.engine = engine

        this.canvas = document.getElementById('viewport')

        this.APressed = false;
        this.DPressed = false;
        this.WPressed = false;
        this.SPressed = false;
        this.QPressed = false;
        this.EPressed = false;
        this.FPressed = false;
        this.UPressed = false;
        this.LeftArrowPressed = false;
        this.RightArrowPressed = false;
        this.UpArrowPressed = false;
        this.DownArrowPressed = false;
        this.ShiftPressed = false;
        this.SpacePressed = false;
        this.CmdPressed   = false;

        this.mouseClicked = 0
        this.mouseHeld = 0
        this.mouseX = 0
        this.mouseY = 0

        this.time = 0.0
        this.d = 0.0

        document.addEventListener('keyup',   this.keyUp.bind(this), true)
        document.addEventListener('keydown', this.keyDown.bind(this), true)

        this.canvas.addEventListener('mousemove', this.mouse.bind(this), true)
        this.canvas.addEventListener('mousedown', this.clickDown.bind(this), true)
        this.canvas.addEventListener('mouseup', this.clickUp.bind(this), true)
    }

    mouse (event)
    {
        var bounds = event.target.getBoundingClientRect();
        this.mouseX = ((event.clientX - bounds.left) / this.canvas.clientWidth ) * this.canvas.width;
        this.mouseY = ((1.0 - (event.clientY - bounds.top)  / this.canvas.clientHeight)) * this.canvas.height;

        if (this.mouseHeld)
        {
            log("Mouse X : " + this.mouseX)
            log("Mouse Y : " + this.mouseY)
        }
    }

    clickDown (event)
    {
        this.mouseClicked = true
    }

    clickUp (event)
    {
        this.mouseHeld = false
    }

    keyDown (event)
    {
        event.preventDefault()

        if (!event.repeat)
        {
            if      (event.key == 'a') this.APressed = true
            else if (event.key == 'd') this.DPressed = true
            else if (event.key == 's') { this.SPressed = true; if (event.metaKey) event.preventDefault()}
            else if (event.key == 'w') this.WPressed = true
            else if (event.key == 'f') this.FPressed = true
            else if (event.key == 'ArrowLeft')  { this.LeftArrowPressed  = true; event.preventDefault();}
            else if (event.key == 'ArrowRight') { this.RightArrowPressed = true; event.preventDefault();}
            else if (event.key == 'ArrowUp')    { this.UpArrowPressed    = true; event.preventDefault();} 
            else if (event.key == 'ArrowDown')  { this.DownArrowPressed  = true; event.preventDefault();}
            else if (event.key == 'Shift') this.ShiftPressed = true
            else if (event.key == ' ') this.SpacePressed = true
            else if (event.key == 'e') this.EPressed = true
            else if (event.key == 'q') this.QPressed = true
            else if (event.key == 'u') this.UPressed = true
            
            if (event.metaKey) this.CmdPressed = true
        }
    }

    keyUp (event)
    {
        event.preventDefault()
        
        if (!event.repeat)
        {
            if      (event.key == 'a') this.APressed = false
            else if (event.key == 'd') this.DPressed = false
            else if (event.key == 's') this.SPressed = false
            else if (event.key == 'w') this.WPressed = false
            else if (event.key == 'f') this.FPressed = false
            else if (event.key == 'ArrowLeft')  this.LeftArrowPressed  = false
            else if (event.key == 'ArrowRight') this.RightArrowPressed = false
            else if (event.key == 'ArrowUp')    this.UpArrowPressed    = false
            else if (event.key == 'ArrowDown')  this.DownArrowPressed  = false
            else if (event.key == 'Shift') this.ShiftPressed = false
            else if (event.key == ' ') this.SpacePressed = false
            else if (event.key == 'e') this.EPressed = false
            else if (event.key == 'q') this.QPressed = false
            else if (event.key == 'u') this.UPressed = false
            
            if (event.metaKey) this.CmdPressed = false
        }
    }

    update()
    {
        this.engine.events.remove(EVENT_TYPE_MOUSE_CLICK)
        if (this.mouseClicked)
        {
            this.engine.events.addUnique(new Event(-1, EVENT_TYPE_MOUSE_CLICK))
            this.mouseClicked = false
            this.mouseHeld = true
        }

        const t = Date.now()
        this.d = (this.time == 0) ? 0.0 : t - this.time
        this.time = t

        if (this.d > 40)
            this.d = 0
    }
}