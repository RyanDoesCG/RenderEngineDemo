toggleIDs = new Map()
sliderIDs = new Map()

class RenderSettings
{
    constructor(engine)
    {
        this.engine = engine
        this.generateHTML()
        this.attachHandlers()

        this.engine.rendering.settings = this
    }

    generateHTML()
    {
        var HTML = ""
        
        //HTML += "<div class=\"tabHeader\"><img src=\"images\\icons\\rs.png\" alt=\"\"><h2>Render Settings</h2></div>"
        HTML += "<div class=\"tabHeader\"><h2>Render Settings</h2></div>"
    
        for (var i = 0; i < this.engine.rendering.passes.length; ++i)
        {
            var pass = this.engine.rendering.passes[i]
    
            var toggleFromCookie = readValueFromCookie(pass.constructor.name + "Toggle")
            if (toggleFromCookie == "none")
            {
                writeValueToCookie(pass.constructor.name + "Toggle", "checked")
                toggleFromCookie = "checked"
            }

            HTML += "<div class=\"pass\">"
            HTML += "    <h3>" + (pass.constructor.name) +  " <input type=\"checkbox\" id=\"" + pass.constructor.name + "Toggle\" " + toggleFromCookie + "></h3>"
            for (const [name, uniform] of pass.uniforms.entries())
            {
                if (uniform.exposed)
                {
                    HTML += "<section>"
                    if (uniform.type == "float")
                    {
                        var valueFromCookie = readValueFromCookie(pass.constructor.name + name + "Slider")
                        if (valueFromCookie != "none")
                        {
                            uniform.value = parseFloat(valueFromCookie)
                        }            
    
                        HTML += "<input id=\"" + pass.constructor.name + name + "Slider\" type=range min=" + uniform.min + " max=" + uniform.max + " step=" + uniform.step + " value=" + uniform.value + ">"
                    }
                    HTML += "<p class=\"name\">" + (name) + "</p>"
                    HTML += "<p class=\"value\" id=\"" + pass.constructor.name + name + "Value\">" + uniform.value + "</p>"
                    HTML += "</section>"
                }
            }
            HTML += "</div>"
        }
        document.getElementById("controls").innerHTML = HTML
    }

    attachHandlers()
    {
        for (var i = 0; i < this.engine.rendering.passes.length; ++i)
        {
            var pass = this.engine.rendering.passes[i]
            const toggleID = pass.constructor.name + "Toggle"
            const toggle = document.getElementById(toggleID)
            toggleIDs.set(toggleID, pass)
            toggle.addEventListener('change', function(e) {
                const pass = toggleIDs.get(e.target.id)
                pass.toggle()

                log (pass.constructor.name + " " + ((pass.active() ? "activated" : "deactivated")))

                writeValueToCookie(toggleID, pass.active() ? "checked" : "unchecked")
            })

            for (const [name, uniform] of pass.uniforms.entries())
            {
                if (uniform.exposed)
                {
                    const sliderID = pass.constructor.name + name + "Slider"
                    const labelID = pass.constructor.name + name + "Value"
                    const slider = document.getElementById(sliderID)
                    const label = document.getElementById(labelID)
                    sliderIDs.set(sliderID, [ uniform, label ])
                    slider.addEventListener('input', function (e) {  
                        sliderIDs.get(e.target.id)[1].innerHTML = e.target.value
                        sliderIDs.get(e.target.id)[0].value = e.target.value
                        document.cookie = sliderID+"="+e.target.value
                    })
                    slider.addEventListener('change', function (e) {  
                        log ((e.target.id) + " set to " + e.target.value)
                    })
                }
            }
        }
    }

    update ()
    {
        
    }
}