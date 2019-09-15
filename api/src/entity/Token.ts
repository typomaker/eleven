import Account from './Account';
import uuid from 'uuid/v4';

class Token  {
    created: Date;
    expired: Date | null;
    uuid: string;

    constructor(p: Token.Configuration) {
        this.uuid = p.uuid || uuid();
        this.created = p.created || new Date;
        this.expired = p.expired || null;
    }
}
namespace Token {
    export type Configuration = Partial<Token>;
}

export default Token