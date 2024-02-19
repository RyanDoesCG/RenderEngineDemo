class Editor
{
    constructor(engine)
    {
        this.engine = engine
        this.scene = engine.scene

        this.objectInspector = new ObjectInspector(engine, this.scene)
        this.renderSettings  = new RenderSettings(engine)
        this.sceneOutliner   = new SceneOutliner(engine, this.scene)
        this.stats           = new Stats(engine)

        this.statsShowing    = true
        this.editorShowing   = true

        this.ArrowGeometry  = engine.rendering.createGeometry(ArrowMesh)
        this.RedMaterial    = engine.rendering.createMaterial([1.0, 0.125, 0.125], 0.0, 0.0)
        this.GreenMaterial  = engine.rendering.createMaterial([0.125, 1.0, 0.125], 0.0, 0.0)
        this.BlueMaterial   = engine.rendering.createMaterial([0.125, 0.125, 1.0], 0.0, 0.0)

        this.transformArrows = [
            new SceneObject({
                    name : "ArrowX",
               transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(0.0, 0.0, 0.0), Rotation(0.0, 0.0, -0.5)),
                  render : new RenderComponent(this.ArrowGeometry, this.RedMaterial, false),
                  editor : true }),
            new SceneObject({
                    name : "ArrowY",
               transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(0.0, 0.0, 0.0), Rotation(0.0, 0.0, 0.0)),
                  render : new RenderComponent(this.ArrowGeometry, this.GreenMaterial, false),
                  editor : true }),
            new SceneObject({
                    name : "ArrowZ",
               transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(0.0, 0.0, 0.0), Rotation(0.5, 0.0, 0.0)),
                  render : new RenderComponent(this.ArrowGeometry, this.BlueMaterial, false),
                  editor : true })]

        this.transformArrows[0].onClickStart = () => { log ("start x drag") }
        this.transformArrows[1].onClickStart = () => { log ("start y drag") }
        this.transformArrows[2].onClickStart = () => { log ("start z drag") }

        for (var i = 0; i < this.transformArrows.length; ++i)
        {
            this.scene.add(this.transformArrows[i])
        }

        this.selected = null

        this.showEditor()
    }

    update()
    {
        if (this.engine.input.FPressed)
        {
            if (this.editorShowing)
            {
                this.hideEditor()
            }
            else
            {
                this.showEditor()
            }

            this.engine.input.FPressed = false
        }

        if (this.engine.input.UPressed)
        {
            if (this.statsShowing)
            {
                this.hideStats()
            }
            else
            {
                this.showStats()
            }
            
            this.engine.input.UPressed = false
        }

        if (this.editorShowing)
        {
            this.objectInspector .update()
            this.renderSettings  .update()
            this.sceneOutliner   .update()
        }

        if (this.statsShowing)
        {
            this.stats           .update()
        }

        const lastSelectionEvent = this.engine.events.findType(EVENT_TYPE_OBJECT_SELECTION)
        if (lastSelectionEvent != null)
        {
            const object = this.scene.get(lastSelectionEvent.objectID)
            if (object != this.selected)
            {
                this.selected = object
            }
        }

        if (this.selected)
        {
            for (var i = 0; i < this.transformArrows.length; ++i)
            {
                this.transformArrows[i].root.transform.position = this.selected.root.transform.position
                this.transformArrows[i].renderComponent.visible = this.editorShowing
            }
        }
        else
        {
            for (var i = 0; i < this.transformArrows.length; ++i)
            {
                this.transformArrows[i].renderComponent.visible = false
            }
        }
    }

    hideEditor()
    {
        var editorPanes = document.getElementsByClassName("editor")
        for (var i = 0; i < editorPanes.length; ++i)
        {
            editorPanes[i].style.opacity = 0.0;
        }

        var canvas = document.getElementById("viewport")
        canvas.style.position = "fixed"
        canvas.style.left = "0"
        canvas.style.width = "100%"
        canvas.style.height = "100%"

        for (var i = 0; i < this.transformArrows.length; ++i)
        {
            this.transformArrows[i].renderComponent.visible = false
        }

        this.editorShowing = false

        this.engine.rendering.allocateRenderTargets()
    }

    showEditor()
    {
        var editorPanes = document.getElementsByClassName("editor")
        for (var i = 0; i < editorPanes.length; ++i)
        {
            editorPanes[i].style.opacity = 1.0;
        }

        var canvas = document.getElementById("viewport")
        canvas.style.position = "relative"
        canvas.style.left = "0"
        canvas.style.width = "69.5%"
        canvas.style.height = "75%"

        for (var i = 0; i < this.transformArrows.length; ++i)
        {
            this.transformArrows[i].renderComponent.visible = true
        }

        this.editorShowing = true

        this.engine.rendering.allocateRenderTargets()
    }

    hideStats()
    {
        document.getElementById("ui").style.opacity = 0.0

        this.statsShowing = false
    }

    showStats()
    {
        document.getElementById("ui").style.opacity = 1.0

        this.statsShowing = true
    }
}
