import Profile from "./Profile";

export default interface Session {
    token: string
    expiredAt: string
    profile?: Profile
}