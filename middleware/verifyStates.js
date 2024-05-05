const stateCodes = require('../models/statesData.json').map((state) => state.code);
const { undefinedRouteState } = require('../routes/undefinedRoute');

const verifyStates = (req, res, next) => {
    const stateCode = req.params.state.toUpperCase();
    if (!stateCode || !stateCodes.includes(stateCode)) {
        return undefinedRouteState(req, res, next);

    }
    req.code = stateCode;
    next();
}

module.exports = verifyStates;