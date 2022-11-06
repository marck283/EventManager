import {Client} from '@googlemaps/google-maps-services-js';

const geocodingRequest = (address) => {
    const client = new Client({});

    return client.geocode({
        params: {
            key: process.env.GEOCODE_API_KEY,
            outputFormat: 'json',
            address: encodeURIComponent(address)
        }
    });
};

export default geocodingRequest;