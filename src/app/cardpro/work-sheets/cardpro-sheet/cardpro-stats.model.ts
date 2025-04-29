
export interface CardProStats{
    transactionId: string,
    totalEmails: number,
    processedEmails: number,
    notInTrackingSheet: number,
    notInTrackingSheetEmailList: String[],
    emailsNoAttachment: number,
    hasDifferentEmail: number,
    hasDifferentEmailList: String[],
    emptyEmails: number,
    emptyPayloadEmails: number,
    emptyPayloadEmailsList: String[],
    totalEmailsWithMultipleImages: number,
    totalEmailWithMultipleImagesList: String[],
}
