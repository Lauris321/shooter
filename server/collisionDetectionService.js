var RectDotColliding = (x, y, rect) => {
    if (x > rect.x && x < (rect.x + rect.w) &&
        y > rect.y && y < (rect.y + rect.h)) {
        return true;
    }
    return false;
}

var RectCircleColliding = (cx, cy, r, rect) => {
    var distX = Math.abs(cx - rect.x - rect.w / 2);
    var distY = Math.abs(cy - rect.y - rect.h / 2);

    if (distX > (rect.w / 2 + r)) {
        return false;
    }
    if (distY > (rect.h / 2 + r)) {
        return false;
    }

    if (distX <= (rect.w / 2)) {
        return true;
    }
    if (distY <= (rect.h / 2)) {
        return true;
    }

    var dx = distX - rect.w / 2;
    var dy = distY - rect.h / 2;
    return (dx * dx + dy * dy <= (r * r));
}

var CircleDotColliding = (cx, cy, dx, dy, r) => {
    var dx = cx - dx;
    var dy = cy - dy;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < r) {
        return true;
    }
    return false;
}

var CircleCircleColliding = (c1x, c1y, c2x, c2y, r1, r2) => {
    var dx = c1x - c2x;
    var dy = c1y - c2y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < r1 + r2) {
        return true;
    }
    return false;
}

module.exports = {
    RectDotColliding,
    RectCircleColliding,
    CircleDotColliding,
    CircleCircleColliding,
};