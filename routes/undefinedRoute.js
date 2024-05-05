const path = require("path");

function undefinedRoute(req, res, responseBody) {
    res.status(404);

    const accept = req.get('Accept');
    switch (accept) {
        case 'application/json':
            res.json({ message: responseBody });
            break;
        case 'text/html':
            const localPath = path.join(__dirname, 'views', '404.html');
            res.sendFile(localPath);
            break;
        default:
            res.type('text/plain').send(responseBody);
    }
}

function undefinedRouteDefault(req, res, next) {
    const responseBody = '404 Not Found';
    return undefinedRoute(req, res, responseBody);
}

function undefinedRouteState(req, res, next) {
    const responseBody = 'Invalid state abbreviation parameter';
    return undefinedRoute(req, res, responseBody);
}

module.exports = { undefinedRouteDefault, undefinedRouteState };
