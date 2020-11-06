import request from 'supertest';
import { ObjectID } from 'mongodb';

import app from 'app';
import { connect as connectToDb } from 'db';
import { connect as connectToRabbitMq } from 'lib/rabbitmq';

beforeAll(async () => {
    await connectToDb();
    await connectToRabbitMq();
});

describe('townhall routes', () => {
    describe('/townhalls', () => {
        it('should be status 200', async () => {
            const { status } = await request(app).get('/townhalls');
            expect(status).toStrictEqual(200);
        });
    });
    describe('/townhalls/:townhallId', () => {
        it('should be status 200', async () => {
            const { status } = await request(app).get(
                `/townhalls/${new ObjectID().toString()}`
            );
            expect(status).toStrictEqual(200);
        });
    });
    /// test returns 500 because townhall id is technically null until a townhall create post request is made
    describe('/townhalls/:townhallId/bills', () => {
        it('should be status 500', async () => {
            const { status } = await request(app).get(
                `/townhalls/${new ObjectID().toString()}/bills`
            );
            expect(status).toStrictEqual(500);
        });
    });
    // describe('/townhalls/create', () => {
    //     it('should be status 200', async () => {
    //         const { status } = await request(app).post('/townhalls/create');
    //         expect(status).toStrictEqual(200);
    //     });
    // });
    // describe('/townhalls/:townhallId/update', () => {
    //     it('should be status 200', async () => {
    //         const { status } = await request(app).post('/townhalls/123/update');
    //         expect(status).toStrictEqual(200);
    //     });
    // });
    // describe('/townhalls/:townhallId/delete', () => {});
    // describe('/:townhallId/questions/set-current', () => {});
    // describe('/:townhallId/questions/create', () => {});
    // describe('/:townhallId/questions/:questionId/update', () => {});
    // describe('/:townhallId/questions/:questionId/delete', () => {});
    // describe('/:townhallId/questions', () => {});
    // describe('/:townhallId/questions/:questionId', () => {});
});
