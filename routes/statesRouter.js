const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');
const verifyStates = require('../middleware/verifyStates');

async function attemptRequest(req, res, method) {
    try {
        await statesController[method](req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

router.route('/')
    .get((req, res) => attemptRequest(req, res, 'getStates'));

router.route('/:state')
    .all(verifyStates)
    .get((req, res) => attemptRequest(req, res, 'getState'));

router.route('/:state/funfact')
    .all(verifyStates)
    .get((req, res) => attemptRequest(req, res, 'getFunFact'))
    .post((req, res) => attemptRequest(req, res, 'createFunFact'))
    .patch((req, res) => attemptRequest(req, res, 'updateFunFact'))
    .delete((req, res) => attemptRequest(req, res, 'deleteFunFact'));

router.route('/:state/capital')
    .all(verifyStates)
    .get((req, res) => attemptRequest(req, res, 'getStateCapital'));

router.route('/:state/nickname')
    .all(verifyStates)
    .get((req, res) => attemptRequest(req, res, 'getStateNickname'));

router.route('/:state/population')
    .all(verifyStates)
    .get((req, res) => attemptRequest(req, res, 'getStatePopulation'));

router.route('/:state/admission')
    .all(verifyStates)
    .get((req, res) => attemptRequest(req, res, 'getStateAdmission'));

module.exports = router;
