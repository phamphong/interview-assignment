import axios from 'axios'

const server_address = 'https://deckofcardsapi.com/api/deck'

export const API = ({method='GET',route='',data={},params={},responseType=''}) => {
	return new Promise( (resolve,reject) => {
        return axios({
            baseURL: server_address,
            url: route,
            method,
            params,
            data,
            headers: {'Content-Type': 'application/json'},
            responseType
        })
        .then(res => {
            let {data} = res
            if(data.success) {
                resolve(data);
            } else {
                reject(data.success)
            }
        })
        .catch(err => {
            reject(err)
        })
	})
}

export const getDeck = () => {
    return API({
        route: `/new/shuffle/?deck_count=1`,
    })
}

export const shuffleDeck = (deskId) => {
    return API({
        route: `/${deskId}/shuffle/`,
    })
}

export const drawDeck = (deskId, count=3) => {
    return API({
        route: `/${deskId}/draw/?count=${count}`,
    })
}