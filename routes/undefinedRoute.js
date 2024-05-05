const path = require("path");

function undefinedRoute(req, res) {
    res.status(404)
    const responseBody = '404 Not Found';

    const accept = req.get('Accept');
    switch(accept) {
        case 'application/json':
            res.json({error: responseBody});
            break;
        case 'text/html':
            const localPath = path.join(__dirname, 'views', '404.html');
            res.sendFile(localPath);
            break;
        default:
            res.type('text/plain').send(responseBody);
    }
}

module.exports = undefinedRoute;
