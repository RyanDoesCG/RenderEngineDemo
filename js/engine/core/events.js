const EVENT_TYPE_MOUSE_HOVER = 0
const EVENT_TYPE_MOUSE_CLICK = 1

const EVENT_TYPE_OBJECT_SELECTION   = 2
const EVENT_TYPE_OBJECT_DESELECTION = 3

function getEventTypeString(e)
{
    if (e == EVENT_TYPE_MOUSE_HOVER) return "Mouse Hover"
    if (e == EVENT_TYPE_MOUSE_CLICK) return "Mouse Click"
    if (e == EVENT_TYPE_OBJECT_SELECTION) return "Object Selected"
    if (e == EVENT_TYPE_OBJECT_DESELECTION) return "Object Deselected"

    return ""
}

class Event
{
    constructor(object, type)
    {
        this.objectID = object;
        this.typeID = type;
    }
}

class EventQueue
{
    constructor(engine)
    {
        this.engine = engine
        this.events = []
    }

    add (event)
    {
        log(getEventTypeString(event.typeID) + " on object " + event.objectID)
        this.events.push(event)
    }

    addUnique (event)
    {
       // log(getEventTypeString(event.typeID) + " on object " + event.objectID)
        for (var i = 0; i < this.events.length; ++i)
        {
            if (this.events[i].typeID == event.typeID)
            {
                this.events[i] = event
                return;
            }
        }

        this.add(event)
    }

    remove (type)
    {
        for (var i = 0; i < this.events.length; ++i)
        {
            if (this.events[i].typeID == type)
            {
                this.events.splice(i, 1)
            }
        }
    }

    clear ()
    {
        this.events = []
    }

    findType (type)
    {
        for (var i = this.events.length - 1; i >= 0; --i)
        {
            if (this.events[i].typeID == type)
            {
                return this.events[i]
            }
        }
        return null
    }
}