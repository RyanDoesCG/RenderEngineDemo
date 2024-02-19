class ObjectInspector
{
    constructor(engine, scene)
    {
        this.engine = engine
        this.scene = scene
        
        this.generateHTML()
        this.attachHandlers()

        this.selected = null
    }

    generateHTML()
    {
        var HTML = ""

        HTML += "<div class=\"tabHeader\"><img src=\"images\\icons\\oi.png\" alt=\"\"><h2>Object Inspector</h2></div>"
    
        if (this.selected != null)
        {
            HTML += "<p>" + this.selected.name + "</p>"
            HTML += "<p>" + this.selected.root.transform.toString() + "</p>"
            
            if (this.selected.renderComponent)
                HTML += "<p>" + this.selected.renderComponent.toString() + "</p>"
        }

        document.getElementById('inspector').innerHTML = HTML
    }

    attachHandlers()
    {
        for (var i = 0; i < this.scene.objects.length; ++i)
        {
            let obj = this.scene.objects[i]
            this.scene.objects[i].onClickStart = () => 
            {
                if (this.selected == null)
                {
                    this.engine.events.add(new Event(
                        obj.id,
                        EVENT_TYPE_OBJECT_SELECTION))
                }
                else
                if (this.selected == obj)
                {
                    this.engine.events.add(new Event(
                        obj.id,
                        EVENT_TYPE_OBJECT_DESELECTION))
                }
                else
                {
                    this.engine.events.add(new Event(
                        obj.id,
                        EVENT_TYPE_OBJECT_SELECTION))
                }
            }
        }
    }

    update ()
    {
        const lastSelectionEvent = this.engine.events.findType(EVENT_TYPE_OBJECT_SELECTION)
        if (lastSelectionEvent != null)
        {
            const object = this.scene.get(lastSelectionEvent.objectID)
            if (object != this.selected)
            {
                this.selected = object
                this.generateHTML()
            }
        }
    }
}