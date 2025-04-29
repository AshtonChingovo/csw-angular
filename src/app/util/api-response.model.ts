export class APIResponse{
    isSuccessful: boolean = false
    errorMessage: string = ""
    errorsList: string[] = []
    data: any
    // POST, GET, PUT, DELETE
    requestType?: string
}