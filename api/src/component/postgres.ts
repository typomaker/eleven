import pg from 'pg';

namespace postgres {
    export type Handler<T> = (db: pg.ClientBase) => Promise<T>;

    export async function connection(pool: pg.Pool): Promise<pg.PoolClient> {
        return new Promise<pg.PoolClient>(async resolve => pool.connect().then((db) => {
            resolve(db);
            return db;
        })).then((db) => {
            db.release();
            return db;
        })
    }

    export async function transaction(pool: pg.Pool) {
        return new Promise<pg.ClientBase>((resolve, reject) => {
            return connection(pool)
                .then((db: pg.ClientBase) => {
                    db.query('BEGIN')
                        .then(() => resolve(db))
                        .then(
                            () => db.query('COMMIT'),
                            (e) => Promise.all([db.query('ROLLBACK'), reject(e)])
                        )
                });

        })
    }
}

export default postgres;