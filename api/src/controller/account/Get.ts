import Controller from './../Controller'
import pg from 'pg';
import Account from '../../entity/Account';

class Get extends Controller<Get.Parameter, Promise<Account>> {
    constructor(
        private postgres: pg.ClientBase,
    ) {
        super();
    }
    public async run(parameter: Get.Parameter): Promise<Account> {
        const account = (
            await new Account.Storage(this.postgres).read({filter: ['=', 'id', parameter.id]})
        ).first();
        if (!account) throw new Error(Get.Error.NotFound);
        return account;
    }
}
namespace Get {
    export enum Error {
        NotFound = 'NotFound'
    }
    export type Parameter = {
        id: string
    }
}

export default Get;