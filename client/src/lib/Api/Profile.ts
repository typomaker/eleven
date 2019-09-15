import User from './User'

export default interface Profile {
    name: string
    email?: string
    avatar?: string
    user: User
}