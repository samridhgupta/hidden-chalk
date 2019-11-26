class RequestService {

    // async function
    async getRequest(url, idToken) {
        let data = await (await (fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization':  idToken 
                }})
            .then(res => {
                return res.json()
            })
            .catch(err => {
                console.log('Error: ', err)
            })
        ))
        return data
    }

    async postRequest(url, body, idToken) {
        let data = await (
            await (fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':  idToken 
                },
                body: JSON.stringify(body)
            })
                .then(res => {
                    console.log("Request object",res )
                    return res.json()
                })
                .catch(err => {

                    console.log("Request object err",err )
                    console.log('Error: ', err)
                })
            ))
        return data
    }
}
export default new RequestService()
