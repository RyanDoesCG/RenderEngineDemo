class SphereCollisionComponent extends Component
{
    constructor (radius)
    {
        super()
        this.radius = radius
    }
}

class BoxCollisionComponent extends Component
{
    constructor (x, y, z)
    {
        super()
        this.extents = [x, y, z]
    }
}

function isBox(collider)
{
    return collider && collider.extents != null
}

function collisionTestSphereSphere(a, b)
{
    let mindist = a.radius + b.radius
    let dist = len(subv(a.transform.position, b.transform.position))
    return (dist < mindist)
}

function collisionTestBoxSphere(a, b)
{
    var boxMin = addv(a.transform.position, multiplys(a.extents, -1.0))
    var boxMax = addv(a.transform.position, a.extents)
    var r = b.radius * b.radius
    var d = 0.0

    var between = subv(a.transform.position, b.transform.position)
    var s = dividev(vec3(1.0, 1.0, 1.0), a.transform.scale)
    // BUG: multiplyv here with 2 3D vectors returns a 4D vector...
   // log("transform: " + a.transform.scale.length)
   // log("between: " + between.length)
   // log("scale: " + s.length)
    between = multiplyv3D(between, s)
   // log(between.length)
   // log("-----")
    between = normalize(between)
    var normal = dominantAxis(between)

    for (var i = 0; i < 3; ++i)
    {
        if (b.transform.position[i] < boxMin[i])
            d += Math.pow(b.transform.position[i] - boxMin[i], 2.0)
        else 
        if (b.transform.position[i] > boxMax[i])
            d += Math.pow(b.transform.position[i] - boxMax[i], 2.0)
    }
    return { hit: d <= r, normal: normal}
}

function collisionTestBoxBox(a, b)
{
    return a.transform.position[0] <  b.transform.position[0]       + (b.extents [0]*2.0)  &&
           a.transform.position[0] + (a.extents [0]*2.0)  >  b.transform.position[0]       &&
           a.transform.position[1] <  b.transform.position[1]       + (b.extents [1]*2.0)  &&
           a.transform.position[1] + (a.extents [1]*2.0)  >  b.transform.position[1]       &&
           a.transform.position[2] <  b.transform.position[2]       + (b.extents [2]*2.0)  &&
           a.transform.position[2] + (a.extents [2]*2.0)  >  b.transform.position[2];
}

function test(a, b)
{
    var hit = false;

    if (a.collisionComponent instanceof SphereCollisionComponent &&
        b.collisionComponent instanceof SphereCollisionComponent)
    {
        return { 
            hit: collisionTestSphereSphere(a.collisionComponent, b.collisionComponent),
            normal: normalize(subv(a.collisionComponent.transform.position, b.collisionComponent.transform.position))}
    }

    if (a.collisionComponent instanceof SphereCollisionComponent &&
        b.collisionComponent instanceof BoxCollisionComponent)
    {
        const collis = collisionTestBoxSphere(b.collisionComponent, a.collisionComponent)
        return {
            hit: collis.hit,
            normal: collis.normal

        }
    }

    if (a.collisionComponent instanceof BoxCollisionComponent &&
        b.collisionComponent instanceof SphereCollisionComponent)
    {
        const collis = collisionTestBoxSphere(a.collisionComponent, b.collisionComponent)
        return {
            hit: collis.hit,
            normal: collis.normal
        }
    }

//    hit |= isSphere(a.collisionComponent) && isSphere(b.collisionComponent) && collisionTestSphereSphere(a.collisionComponent, b.collisionComponent)
//    hit |= isBox(a.collisionComponent)    && isBox(b.collisionComponent)    && collisionTestBoxBox(a.collisionComponent, b.collisionComponent)
//    hit |= isBox(a.collisionComponent)    && isSphere(b.collisionComponent) && collisionTestBoxSphere(a.collisionComponent, b.collisionComponent)
//    hit |= isBox(b.collisionComponent)    && isSphere(a.collisionComponent) && collisionTestBoxSphere(b.collisionComponent, a.collisionComponent)
    return { hit: hit, normal: vec3(0.0, 0.0, 0.0) }
}