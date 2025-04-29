import { Images } from "../images/images.model"

export interface CardPro{
    id: string
    name: string
    surname: string
    registrationNumber: string
    practiceNumber: string
    dateOfExpiry: string
    email: string
    notInTrackingSheet: boolean
    hasDifferentEmail: boolean
    hasNoAttachment: boolean
    images: Images[]
}