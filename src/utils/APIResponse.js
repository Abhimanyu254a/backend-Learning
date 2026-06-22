class APIResponse{
    constructor(statusCode,data,message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

/*

100 - 199 information responses
200 - 299 successful 

*/