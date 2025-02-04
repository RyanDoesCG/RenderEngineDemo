class Gym extends Scene
{
    constructor(engine)
    {
        super(engine)

        this.begin (engine)
    }

    begin (engine)
    {
        if (cookieContains("scene"))
        {
            this.load()
        }
        else
        {
            this.spawn
            (`
            [
                [
                    \"DirectionalLight\",
                    {
                        \"position\":[0, 4, 0],
                        \"rotation\":[-0.7392988500000013, -0.3215203541929041, 0.31272673414491103],
                        \"scale\":[1,1,1]
                    }
                ],
                [
                    \"Sky\",
                    {
                        \"position\":[0,0,0],
                        \"rotation\":[0,0,0],
                        \"scale\":[256,256,256]
                    }
                ],
                [
                    \"Cube\",
                    {
                        \"position\":[0, -6.938893903907228e-16, 0],
                        \"rotation\":[0,0,0],
                        \"scale\":[10,1,10]
                    }
                ],
                [
                    \"Cube\",
                    {
                        \"position\":[-2,2,0],
                        \"rotation\":[0,0.32999999999999896,0],
                        \"scale\":[1,1,1]
                    }
                ],
                [
                    \"Cylinder\",
                    {
                        \"position\":[2,3,0],
                        \"rotation\":[0,0,0],
                        \"scale\":[1,1,1]
                    }
                ],
                [
                    \"Cube\",
                    {
                        \"position\":[-4.399998188018799, 2, 0.3999999761581421],
                        \"rotation\":[0, -0.039999932050704956, 0],
                        \"scale\":[1, 1, 1]
                    }
                ],
                [
                    \"Cube\",
                    {
                        \"position\":[-3.399998188018799, 4.0, -1.3411044719191523e-8],
                        \"rotation\":[0, 0.2900000810623169, 0],
                        \"scale\":[1, 1, 1]
                    }
                ]
            ]
            `)
        }
    }
}