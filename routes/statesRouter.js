const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');
const verifyStates = require('../middleware/verifyStates');

router.route('/')
    .get((req, res) => statesController.getStates(req, res));

router.route('/:state')
    .all(verifyStates)
    .get((req, res) => statesController.getState(req, res));

router.route('/:state/funfact')
    .all(verifyStates)
    .get((req, res) => statesController.getFunFact(req, res))
    .post((req, res) => statesController.createFunFact(req, res))
    .patch((req, res) => statesController.updateFunFact(req, res))
    .delete((req, res) => statesController.deleteFunFact(req, res));

router.route('/:state/capital')
    .all(verifyStates)
    .get((req, res) => statesController.getStateCapital(req, res));

router.route('/:state/nickname')
    .all(verifyStates)
    .get((req, res) => statesController.getStateNickname(req, res));

router.route('/:state/population')
    .all(verifyStates)
    .get((req, res) => statesController.getStatePopulation(req, res));

router.route('/:state/admission')
    .all(verifyStates)
    .get((req, res) => statesController.getStateAdmission(req, res));

module.exports = router;
