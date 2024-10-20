const axios = require('axios');

const token = "4d321318-cfa4-4a4d-b467-dbea0d0258ac";
const secret = "91b27aa8d936a488a816fe783987e96c";
const carApiJWT = {
    authToken: null,
    timeToLive: null
}
const initCarApi = async () => {
    try {
        const payload = {
            "api_token": token,
            "api_secret": secret
        }
        const resp = await axios.post('https://carapi.app/api/auth/login', payload);
        if (resp.data) {
            carApiJWT['authToken'] = resp.data;
            let today = new Date();
            today.setDate(today.getDate() + 1);
            carApiJWT['timeToLive'] = today;
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}
const checkAuth = async () => {
    try {
        let now = new Date();
        if (!carApiJWT.timeToLive && now > carApiJWT.timeToLive) {
            await initCarApi();
        } else {
            console.log("auth for carApi is not over yet.");
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.getManufacturers = async (queryObj) => {
    try {
        await checkAuth();
        const options = {
            method: 'GET',
            url: 'https://carapi.app/api/makes',
            params: { ...queryObj },
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${carApiJWT.authToken}`,
            },
        };
        const manufacturers = await axios.request(options)
        // console.log(manufacturers)
        return manufacturers.data.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.getModels = async (queryObj) => {
    try {
        await checkAuth();
        const options = {
            method: 'GET',
            url: 'https://carapi.app/api/models',
            params: { ...queryObj },
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${carApiJWT.authToken}`,
            },
        };
        const models = await axios.request(options)
        return models.data.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.getEngines = async (queryObj) => {
    try {
        await checkAuth();
        const options = {
            method: 'GET',
            url: 'https://carapi.app/api/engines',
            params: { ...queryObj },
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${carApiJWT.authToken}`,
            },
        };
        const engines = await axios.request(options)
        return engines.data.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}