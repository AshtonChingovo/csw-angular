
export interface TrackingSheetClient{
    id: string
    name: string
    surname: string
    email: string
    registrationNumber: string
    practiceNumber: string
    registrationYear: string
    sheetYear: string
    phone_number: string
    membershipStatus: string    
    headshotRequestEmailSent: boolean
    // variables to track the status of the client when processing something
    renewing: boolean
    emailingClient: boolean
}