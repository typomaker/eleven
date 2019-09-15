const HOST = location.protocol + '//api.' + location.hostname;


export default Object.freeze({
    create: (resource, body, {token} = {}) => fetch(HOST + "/" + resource, {
        method: "POST",
        body,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token && "Bearer " + token,
        }
    }),
    read: (resource, {token} = {}) => fetch(HOST + "/" + resource, {
        method: "GET",
        body,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token && "Bearer " + token,
        }
    }),
    delete: (resource, {token} = {}) => fetch(HOST + "/" + resource, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token && "Bearer " + token,
        }
    }),
    update: (resource, body, {token} = {}) => fetch(HOST + "/" + resource, {
        method: "PUT",
        body,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token && "Bearer " + token,
        }
    })
})
