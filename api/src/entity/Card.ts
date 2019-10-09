import uuid from 'uuid/v4';
import pg from 'pg';

class Card {
    id: string;
    name: string;
    created: Date;
    image: string | null;
    constructor(p: Card.Configuration) {
        this.id = p.id || uuid();
        this.name = p.name;
        this.created = p.created || new Date();
        this.image = p.image || null;
    }
}
namespace Card {
    export type Configuration = Partial<Card> & Pick<Card, 'name'>;
    export class Storage {
        constructor(private client: pg.ClientBase) {
        }

        async read(constraint: { filter?: Card.Storage.Filter, limit?: number, skip?: number, language: 'en' | 'ru' }): Promise<Array<Card>> {
            let sql = [
                'SELECT instance.*, tranlsate.value AS name FROM card.instance',
                `LEFT JOIN localization.translate ON translate.word=instance.name AND translate.language = ${this.client.escapeLiteral(constraint.language || 'en')}`
            ];
            if (constraint) {
                if (constraint.filter) sql.push('WHERE ' + this.filter(constraint.filter));
                if (constraint.limit) sql.push('LIMIT ' + constraint.limit);
                if (constraint.skip) sql.push('OFFSET ' + constraint.skip);
            }

            const result = await this.client.query(sql.join(' '));
            if (result.rowCount === 0) {
                return new Array<Card>();
            }
            return new Array<Card>(...result.rows.map(row => new Card({
                name: row.name,
                id: row.id,
                created: new Date(row.created),
                image: row.image,
            })));
        }
        private filter(f: Card.Storage.Filter): string {
            switch (f[0]) {
                case '=': {
                    switch (f[1]) {
                        case 'id':
                            if (!(f[2] instanceof Array)) f[2] = new Array(f[2]);
                            const ph = f[2].map(this.client.escapeLiteral).join(',');
                            return `id IN(${ph})`;
                        default: throw new Error('Invalid filter: ' + JSON.stringify(f));
                    }
                }
                case '||': {
                    return f[1].map(v => `(${this.filter(v)})`).join(' OR ');
                }
                case '&&': {
                    return f[1].map(v => `(${this.filter(v)})`).join(' AND ');
                }
                default: throw new Error('Invalid filter: ' + JSON.stringify(f));
            }
        }
    }
    export namespace Storage {
        export type Filter =
            { 0: '||' | '&&', 1: Array<Filter> }
            | ['=', 'id', Card['id'] | Array<Card['id']>]
            ;
    }
}
export default Card;