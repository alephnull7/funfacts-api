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
            if (mongoMatch !== undefined) stateLocal.funfacts = mongoMatch.funfacts;
        });
    }

    async setState() {
        this.state = this.states.find((state) => state.code === this.stateCode);
        const stateMongo = await State.findOne({ stateCode: this.stateCode }).exec();
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
    }

    setFunFact() {
        const funFacts = this.state.funfacts;
        if (funFacts !== undefined) {
            const funfact = funFacts[Math.floor(Math.random() * funFacts.length)];
            this.funFact = { funfact };
        } else {
            this.funFact = { message: `No Fun Facts found for ${this.state.state}` };
        }
    }

    async createFunFact(req, res) {
        await this.setReqProperties(req);
        const message = this.verifyCreateBody();
        if (message !== null) return this.sentBadRequest(res, message);

        if (this.state.funfacts === undefined) {
            this.state.funfacts = this.body.funfacts;
            await this.createState(res);
        } else {
            this.state.funfacts = this.state.funfacts.concat(this.body.funfacts);
            await this.updateState(res);
        }
    }

    async updateFunFact(req, res) {
        await this.setReqProperties(req);
        const message = this.verifyUpdateBody();
        if (message !== null) return this.sentBadRequest(res, message);

        console.log(`Updating funfact for ${this.state.state} at index ${this.body.index-1}`);
        this.state.funfacts.splice(this.body.index-1, 1, this.body.funfact);
        await this.updateState(res);
    }

    async deleteFunFact(req, res) {
        await this.setReqProperties(req);
        const message = this.verifyDeleteBody();
        if (message !== null) return this.sentBadRequest(res, message);

        console.log(`Deleting funfact for ${this.state.state} at index ${this.body.index-1}`);
        this.state.funfacts.splice(this.body.index-1, 1);
        await this.updateState(res);
    }

    async createState(res) {
        try {
            console.log(`Creating new State entity for ${this.state.state}: `, this.body.funfacts);
            const result = await State.create({
                stateCode: this.stateCode,
                funfacts: this.state.funfacts
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
            const stateMongo = await State.findOne({ stateCode: this.stateCode }).exec();
            stateMongo.funfacts = this.state.funfacts;
            const result = await stateMongo.save();
            console.log(`Result of updating State entity for ${this.state.state}: `, result);
            res.status(200).json(result);
        } catch (e) {
            console.error(e);
        }
    }

    sentBadRequest(res, message) {
        res.status(400).json({ message });
    }
    
    verifyCreateBody(){
        const funfacts = this.body.funfacts;

        if (funfacts === undefined) {
            return 'State fun facts value required';
        } else if (!Array.isArray(funfacts)) {
            return 'State fun facts value must be an array';
        }
        return null;
    }

    verifyUpdateBody(){
        const index = this.body.index;
        if (index === undefined) {
            return 'State fun fact index value required';
        }

        const funfact = this.body.funfact;
        if (typeof funfact !== 'string') {
            return 'State fun fact value required';
        }

        const funfacts = this.state.funfacts;
        const state = this.state.state;
        if (funfacts === undefined) {
            return `No Fun Facts found for ${state}`;
        }

        if (index > funfacts.length) {
            return `No Fun Fact found at that index for ${state}`;
        }

        return null;
    }

    verifyDeleteBody(){
        const index = this.body.index;
        if (index === undefined) {
            return 'State fun fact index value required';
        }

        const funfacts = this.state.funfacts;
        const state = this.state.state;
        if (funfacts === undefined) {
            return `No Fun Facts found for ${state}`;
        }

        if (index > funfacts.length) {
            return `No Fun Fact found at that index for ${state}`;
        }

        return null;
    }
}

module.exports = new StatesController();
