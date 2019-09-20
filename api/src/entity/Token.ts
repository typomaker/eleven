import Account from './Account';
import uuid from 'uuid/v4';

class Token  {
    created: Date;
    expired: Date | null;
    id: string;

    constructor(p: Token.Configuration) {
        this.id = p.id || uuid();
        this.created = p.created || new Date;
        this.expired = p.expired || null;
    }
}
namespace Token {
    export type Configuration = Partial<Token>;
}

export default Token