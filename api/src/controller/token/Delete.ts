import Controller from './../Controller'
import pg from 'pg';
import Account from '../../entity/Account';
import Token from '../../entity/Token';

class Delete extends Controller<Delete.Parameter, Promise<Token>> {
    constructor(
        private postgres: pg.ClientBase,
    ) {
        super();
    }
    public async run(parameter: Delete.Parameter): Promise<Token> {
        const token = (
            await new Token.Storage(this.postgres).update(
                {
                    deleted: new Date(),
                },
                {
                    filter: ['&&', [['isDeleted', false], ['=', 'account', parameter.account.id], ['=', 'id', parameter.id]]]
                }
            )
        ).first();
        if (!token) throw new Error(Delete.Error.NotFound);
        return token;
    }
}
namespace Delete {
    export enum Error {
        NotFound = 'NotFound'
    }
    export type Parameter = {
        account: Account
        id: string
    }
}

export default Delete;