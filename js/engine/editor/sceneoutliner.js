class SceneOutliner
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

        HTML += "<div class=\"tabHeader\"><img src=\"images\\icons\\so.png\" alt=\"\"><h2>World Outliner</h2></div>"
    
        for (var i = 0; i < this.scene.objects.length; ++i)
        {
            if (this.scene.objects[i].editor)
            {
                continue
            }

            if (this.scene.objects[i] == this.selected)
                HTML += "<p id=\"" + this.scene.objects[i].id + "\" class=\"sceneEntitySelected\">"
            else
                HTML += "<p id=\"" + this.scene.objects[i].id + "\" class=\"sceneEntity\">"
            HTML += this.scene.objects[i].name
            HTML += "</p>"

            for (var j = 0; j < this.scene.objects[i].root.children.length; ++j)
            {
                HTML += "<p class=\"sceneComponent\">"
                HTML += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                HTML += this.scene.objects[i].root.children[j].type
                HTML += "</p>"
            }
        }

        document.getElementById('outliner').innerHTML = HTML

    }

    attachHandlers()
    {
        var entities = document.getElementsByClassName('sceneEntity')
        for (var i = 0; i < entities.length; ++i)
        {
            entities[i].addEventListener('click', (e) =>
            {
                this.engine.events.add(new Event(
                    e.target.id,
                    EVENT_TYPE_OBJECT_SELECTION))
            })
        }

        var entities = document.getElementsByClassName('sceneEntitySelected')
        for (var i = 0; i < entities.length; ++i)
        {
            entities[i].addEventListener('click', (e) =>
            {
                this.engine.events.add(new Event(
                    e.target.id,
                    EVENT_TYPE_OBJECT_DESELECTION))
            })
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
                this.attachHandlers()
            }
        }
    }
}