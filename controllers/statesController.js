const State = require('../models/State');

class StatesController {
    constructor() {
        this.states = require('../models/statesData.json');
        this.noncontigCodes = ['AK', 'HI'];

        this.state = null;
        this.funFact = null;
        this.body = null;
        this.stateCode = null;
    }

    async setStates() {
        const statesMongo = await State.find({}).sort({ stateCode: 1 });
        this.states.forEach((stateLocal) => {
            const mongoMatch = statesMongo.find(stateMongo => stateLocal.code === stateMongo.stateCode);
            stateLocal.funfacts = mongoMatch ? mongoMatch.funfacts : [];
        });
    }

    async setState() {
        this.state = this.states.find((state) => state.code === this.stateCode);
        const stateMongo = await State.findOne({ stateCode: this.stateCode }).exec();
        console.log(`The State document for ${this.state.state}: `, stateMongo);
        if (stateMongo !== null) this.state.funfacts = stateMongo.funfacts;
    }

    async setReqProperties(req) {
        this.body = req.body;
        this.stateCode = req.code;
        await this.setState();
    }

    async getStates(req, res) {
        await this.setStates();
        switch (req.query.contig) {
            case 'true':
                this.getContigStates(req, res);
                break;
            case 'false':
                this.getNoncontigStates(req, res);
                break;
            default:
                res.status(200).json(this.states);
        }
    }

    getContigStates(req, res) {
        const states = this.states.filter((state) => !this.noncontigCodes.includes(state.code));
        res.status(200).json(states);
    }

    getNoncontigStates(req, res) {
        const states = this.states.filter((state) => this.noncontigCodes.includes(state.code));
        res.status(200).json(states);
    }

    async getState(req, res) {
        await this.setReqProperties(req);
        console.log(`The response body for the GET request: `, this.state);
        res.status(200).json(this.state);
    }

    async getFunFact(req, res) {
        await this.setReqProperties(req);
        this.setFunFact();
        res.status(200).json(this.funFact);
    }

    async getStateCapital(req, res) {
        await this.setReqProperties(req);
        this.setStateSubset('capital_city', 'capital');
        res.status(200).json(this.state);
    }

    async getStateNickname(req, res) {
        await this.setReqProperties(req);
        this.setStateSubset('nickname');
        res.status(200).json(this.state);
    }

    async getStatePopulation(req, res) {
        await this.setReqProperties(req);
        this.setStateSubset('population');
        res.status(200).json(this.state);
    }

    async getStateAdmission(req, res) {
        await this.setReqProperties(req);
        this.setStateSubset('admission_date', 'admitted');
        res.status(200).json(this.state);
    }

    setStateSubset(propKey, propName) {
        if (typeof propName === 'undefined') propName = propKey;
        let propVal = this.state[propKey];
        if (typeof propVal === 'number') propVal = propVal.toLocaleString(undefined, { useGrouping: true });
        this.state = { state: this.state.state };
        this.state[propName] = propVal;
        console.log(`The response body for the subset GET request: `, this.state);
    }

    setFunFact() {
        const funFacts = this.state.funfacts;
        if (funFacts) {
            const funfact = funFacts[Math.floor(Math.random() * funFacts.length)];
            this.funFact = { funfact };
        } else {
            this.funFact = { message: `No Fun Facts found for ${this.state.state}` };
        }
        console.log(`The response body for the funfact GET request: `, this.funFact);
    }

    async createFunFact(req, res) {
        await this.setReqProperties(req);
        const properties = ['funfacts'];
        if (!this.verifyBody(properties)) {
            return this.sentBadRequest(res, 'Valid funfacts required');
        }

        console.log(`Creating funfacts for ${this.state.state}`);
        const isCreate = !this.state.hasOwnProperty('funfacts');
        if (isCreate) {
            await this.createState(res);
        } else {
            this.state.funfacts = this.state.funfacts.concat(this.body.funfacts);
            await this.updateState(res);
        }
    }

    async updateFunFact(req, res) {
        await this.setReqProperties(req);
        const properties = ['funfact', 'index'];
        if (!this.verifyBody(properties)) {
            return this.sentBadRequest(res, 'Valid funfact and index required');
        }

        console.log(`Updating funfact for ${this.state.state} at index ${this.body.index-1}`);
        this.state.funfacts.splice(this.body.index-1, 1, this.body.funfact);
        await this.updateState(res);
    }

    async deleteFunFact(req, res) {
        await this.setReqProperties(req);
        const properties = ['index'];
        if (!this.verifyBody(properties)) {
            return this.sentBadRequest(res, 'Valid index required');
        }

        console.log(`Deleting funfact for ${this.state.state} at index ${this.body.index-1}`);
        this.state.funfacts.splice(this.body.index-1, 1);
        await this.updateState(res);
    }

    async createState(res) {
        try {
            console.log(`Creating new State entity for ${this.state.state}: `, this.body.funfacts);
            const result = await State.create({
                stateCode: this.stateCode,
                funfacts: this.body.funfacts
            });
            console.log(`Result of creating new State entity for ${this.state.state}: `, result);
            res.status(201).json(result);
        } catch (e) {
            console.error(e);
        }
    }

    async updateState(res){
        try {
            console.log(`Updating State entity for ${this.state.state}: `, this.state.funfacts);
            const result = await State.updateOne(
                { stateCode: this.stateCode },
                { funfacts: this.state.funfacts }
            );
            console.log(`Result of updating State entity for ${this.state.state}: `, result);
            res.status(200).json(result);
        } catch (e) {
            console.error(e);
        }
    }

    sentBadRequest(res, message) {
        res.status(400).json({ message });
    }
    
    verifyBody(properties){
        for (const property of properties) {
            if (!this.body.hasOwnProperty(property)) {
                return property;
            }
        }
        if (this.body?.index > this.state?.funfacts?.length) {
            return false;
        }
        return true;
    }
}

module.exports = new StatesController();
